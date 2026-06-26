import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Só carrega UM arquivo .env (o primeiro que existir), para a pasta pai não
 * sobrescrever PG_PASSWORD com override (causa comum de “senha certa” sumir).
 */
const candidatosEnv = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

let envCarregado = null;
for (const arquivo of candidatosEnv) {
  if (fs.existsSync(arquivo)) {
    dotenv.config({ path: arquivo, override: true });
    envCarregado = arquivo;
    break;
  }
}

/** Aspas no .env e trim; não logar a senha. */
function normalizarSenha(raw) {
  if (raw === undefined || raw === null) return '';
  let s = String(raw).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  return s;
}

const databaseUrl = process.env.DATABASE_URL?.trim();

let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  const database =
    process.env.PGDATABASE || process.env.PG_DATABASE || 'SoloObraDB';
  const username =
    process.env.PGUSER || process.env.PG_USER || 'postgres';
  const resolvedPassword = normalizarSenha(
    process.env.PGPASSWORD ??
      process.env.PG_PASSWORD ??
      process.env.POSTGRES_PASSWORD ??
      '',
  );

  if (!resolvedPassword) {
    throw new Error(
      `[SoloObra] Senha do PostgreSQL vazia no Node.\n` +
        `  • Arquivo .env usado: ${envCarregado ?? '(nenhum — crie .env em ' + candidatosEnv[0] + ')'}\n` +
        `  • Defina PG_PASSWORD=... ou DATABASE_URL=postgres://...\n` +
        `  • Senha com # ou espaços: use aspas, ex: PG_PASSWORD="minha#senha"\n` +
        `  • No Windows o arquivo deve se chamar exatamente .env (não .env.txt).`,
    );
  }

  const host = process.env.PGHOST || process.env.PG_HOST || 'localhost';
  const port = Number(process.env.PGPORT || process.env.PG_PORT || 5432);

  sequelize = new Sequelize(database, username, resolvedPassword, {
    host,
    port,
    dialect: 'postgres',
    logging: false,
  });
}

if (process.env.DEBUG_PG === '1') {
  console.log('[DEBUG_PG] .env carregado:', envCarregado ?? '(nenhum)');
  if (databaseUrl) {
    console.log('[DEBUG_PG] modo: DATABASE_URL (senha vem da URL)');
  } else {
    console.log(
      '[DEBUG_PG] PG_USER:',
      process.env.PGUSER || process.env.PG_USER || 'postgres',
    );
    const len = normalizarSenha(
      process.env.PGPASSWORD ??
        process.env.PG_PASSWORD ??
        process.env.POSTGRES_PASSWORD ??
        '',
    ).length;
    console.log('[DEBUG_PG] tamanho PG_PASSWORD (caracteres):', len);
  }
}

export default sequelize;
