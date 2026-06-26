import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { Usuario, Maquina, syncDb } from '../../../lib/models/index.js';
import { verificarTokenReq } from '../../../lib/auth.js';

function enriquecer(m) {
  const j = typeof m?.toJSON === 'function' ? m.toJSON() : { ...m };
  return { ...j, avaliacao: j.avaliacao ?? 4.8, totalAvaliacoes: j.totalAvaliacoes ?? 0 };
}

export async function GET(request) {
  try {
    await syncDb();
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const q = searchParams.get('q');
    const local = searchParams.get('local');

    const where = {};
    if (tipo) where.tipo_maquina = tipo.trim();

    const conds = [];
    if (q) conds.push({ nome: { [Op.iLike]: `%${q.trim()}%` } });
    if (local) conds.push({ localizacao: { [Op.iLike]: `%${local.trim()}%` } });
    if (conds.length === 1) Object.assign(where, conds[0]);
    if (conds.length > 1) where[Op.and] = conds;

    const maquinas = await Maquina.findAll({
      where,
      include: [{ model: Usuario, as: 'proprietario', attributes: ['id', 'nome', 'cidade'] }],
      order: [['created_at', 'DESC']],
    });

    return NextResponse.json(maquinas.map(enriquecer));
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao listar máquinas', detalhes: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
    if (decoded.tipo !== 'dono') {
      return NextResponse.json(
        { erro: 'Somente donos de máquinas podem usar este recurso.' },
        { status: 403 }
      );
    }

    await syncDb();
    const {
      nome, tipo_maquina, descricao, preco_diaria,
      localizacao, img_url, especificacoes, recursos, disponibilidade,
    } = await request.json();

    if (!nome || !tipo_maquina || preco_diaria == null) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios: nome, tipo_maquina e preco_diaria.' },
        { status: 400 }
      );
    }

    const nova = await Maquina.create({
      id_proprietario: decoded.id,
      nome, tipo_maquina, descricao, preco_diaria,
      localizacao, img_url, especificacoes, recursos,
      disponibilidade: disponibilidade !== false && disponibilidade !== 'false',
    });

    const completa = await Maquina.findByPk(nova.id, {
      include: [{ model: Usuario, as: 'proprietario', attributes: ['id', 'nome', 'cidade'] }],
    });

    return NextResponse.json(
      { maquina: enriquecer(completa || nova), mensagem: 'Máquina cadastrada com sucesso.' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao criar máquina', detalhes: error.message },
      { status: 400 }
    );
  }
}
