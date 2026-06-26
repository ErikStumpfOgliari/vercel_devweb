import { dbQuery } from '../db.js';

let _syncPromise = null;

export async function syncDb() {
  if (_syncPromise) return _syncPromise;
  _syncPromise = (async () => {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id         SERIAL PRIMARY KEY,
        tipo       VARCHAR(20)  NOT NULL CHECK (tipo IN ('cliente','dono','operador')),
        nome       VARCHAR(100) NOT NULL,
        email      VARCHAR(100) NOT NULL UNIQUE,
        senha      VARCHAR(255) NOT NULL,
        telefone   VARCHAR(20),
        cpf_cnpj   VARCHAR(20),
        endereco   VARCHAR(255),
        cidade     VARCHAR(100),
        estado     VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS maquinas (
        id               SERIAL PRIMARY KEY,
        id_proprietario  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome             VARCHAR(100) NOT NULL,
        tipo_maquina     VARCHAR(50)  NOT NULL,
        descricao        TEXT,
        preco_diaria     NUMERIC(10,2) NOT NULL,
        disponibilidade  BOOLEAN DEFAULT TRUE,
        localizacao      VARCHAR(255),
        img_url          VARCHAR(255),
        especificacoes   JSONB,
        recursos         JSONB,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  })().catch((err) => {
    _syncPromise = null;
    throw err;
  });
  return _syncPromise;
}

// ─── Row wrapper ──────────────────────────────────────────────────────────────
function makeRow(data, table) {
  const row = { ...data };
  return {
    ...row,
    toJSON() {
      return { ...row };
    },
    async update(changes) {
      const entries = Object.entries(changes);
      if (!entries.length) return this;
      const sets = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
      const vals = [...entries.map(([, v]) => v), row.id];
      await dbQuery(`UPDATE ${table} SET ${sets} WHERE id = $${vals.length}`, vals);
      Object.assign(row, changes);
      return this;
    },
    async destroy() {
      await dbQuery(`DELETE FROM ${table} WHERE id = $1`, [row.id]);
    },
  };
}

// ─── Proprietario join cols ───────────────────────────────────────────────────
const PROP_COLS = [
  'u.id   AS "proprietario_id"',
  'u.nome AS "proprietario_nome"',
  'u.email AS "proprietario_email"',
  'u.telefone AS "proprietario_telefone"',
  'u.cidade AS "proprietario_cidade"',
  'u.estado AS "proprietario_estado"',
].join(', ');

function attachProprietario(row) {
  const m = {};
  for (const [k, v] of Object.entries(row)) {
    if (!k.startsWith('proprietario_')) m[k] = v;
  }
  if (row.proprietario_id != null) {
    m.proprietario = {
      id: row.proprietario_id,
      nome: row.proprietario_nome,
      email: row.proprietario_email,
      telefone: row.proprietario_telefone,
      cidade: row.proprietario_cidade,
      estado: row.proprietario_estado,
    };
  }
  return makeRow(m, 'maquinas');
}

// ─── Usuario ──────────────────────────────────────────────────────────────────
export const Usuario = {
  async create({ tipo, nome, email, senha, telefone, cpf_cnpj, endereco, cidade, estado }) {
    const { rows } = await dbQuery(
      `INSERT INTO usuarios (tipo,nome,email,senha,telefone,cpf_cnpj,endereco,cidade,estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tipo, nome, email, senha,
       telefone ?? null, cpf_cnpj ?? null, endereco ?? null, cidade ?? null, estado ?? null]
    );
    return makeRow(rows[0], 'usuarios');
  },

  async findOne({ where }) {
    const conds = Object.entries(where);
    const clause = conds.map(([k], i) => `${k} = $${i + 1}`).join(' AND ');
    const { rows } = await dbQuery(
      `SELECT * FROM usuarios WHERE ${clause} LIMIT 1`,
      conds.map(([, v]) => v)
    );
    return rows[0] ? makeRow(rows[0], 'usuarios') : null;
  },

  async findByPk(id) {
    const { rows } = await dbQuery('SELECT * FROM usuarios WHERE id = $1', [id]);
    return rows[0] ? makeRow(rows[0], 'usuarios') : null;
  },

  async destroy({ where }) {
    const { rowCount } = await dbQuery('DELETE FROM usuarios WHERE id = $1', [where.id]);
    return rowCount;
  },
};

// ─── Maquina ──────────────────────────────────────────────────────────────────
export const Maquina = {
  async create({
    id_proprietario, nome, tipo_maquina, descricao, preco_diaria,
    disponibilidade, localizacao, img_url, especificacoes, recursos,
  }) {
    const { rows } = await dbQuery(
      `INSERT INTO maquinas
         (id_proprietario,nome,tipo_maquina,descricao,preco_diaria,
          disponibilidade,localizacao,img_url,especificacoes,recursos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        id_proprietario, nome, tipo_maquina, descricao ?? null, preco_diaria,
        disponibilidade ?? true, localizacao ?? null, img_url ?? null,
        especificacoes != null ? JSON.stringify(especificacoes) : null,
        recursos != null ? JSON.stringify(recursos) : null,
      ]
    );
    return makeRow(rows[0], 'maquinas');
  },

  async findAll({ where = {}, includeOwner = false } = {}) {
    const conds = [];
    const vals = [];
    let i = 1;
    if (where.id_proprietario != null) { conds.push(`m.id_proprietario = $${i++}`); vals.push(where.id_proprietario); }
    if (where.tipo_maquina)            { conds.push(`m.tipo_maquina = $${i++}`);     vals.push(where.tipo_maquina); }
    if (where._nome_ilike)             { conds.push(`m.nome ILIKE $${i++}`);         vals.push(where._nome_ilike); }
    if (where._local_ilike)            { conds.push(`m.localizacao ILIKE $${i++}`);  vals.push(where._local_ilike); }

    const whereSQL = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const joinSQL  = includeOwner ? 'LEFT JOIN usuarios u ON u.id = m.id_proprietario' : '';
    const cols     = includeOwner ? `m.*, ${PROP_COLS}` : 'm.*';

    const { rows } = await dbQuery(
      `SELECT ${cols} FROM maquinas m ${joinSQL} ${whereSQL} ORDER BY m.created_at DESC`,
      vals
    );
    return includeOwner ? rows.map(attachProprietario) : rows.map(r => makeRow(r, 'maquinas'));
  },

  async findByPk(id, { includeOwner = false } = {}) {
    const joinSQL = includeOwner ? 'LEFT JOIN usuarios u ON u.id = m.id_proprietario' : '';
    const cols    = includeOwner ? `m.*, ${PROP_COLS}` : 'm.*';
    const { rows } = await dbQuery(
      `SELECT ${cols} FROM maquinas m ${joinSQL} WHERE m.id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    return includeOwner ? attachProprietario(rows[0]) : makeRow(rows[0], 'maquinas');
  },
};
