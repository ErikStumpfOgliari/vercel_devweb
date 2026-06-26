import { NextResponse } from 'next/server';
import { Usuario, Maquina, syncDb } from '../../../../lib/models/index.js';
import { verificarTokenReq } from '../../../../lib/auth.js';

function enriquecer(m) {
  const j = typeof m?.toJSON === 'function' ? m.toJSON() : { ...m };
  return { ...j, avaliacao: j.avaliacao ?? 4.8, totalAvaliacoes: j.totalAvaliacoes ?? 0 };
}

export async function GET(request, { params }) {
  try {
    await syncDb();
    const maquina = await Maquina.findByPk(params.id, {
      include: [
        {
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'email', 'telefone', 'cidade', 'estado'],
        },
      ],
    });
    if (!maquina) return NextResponse.json({ erro: 'Máquina não encontrada' }, { status: 404 });
    return NextResponse.json(enriquecer(maquina));
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao buscar máquina', detalhes: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

    await syncDb();
    const maquina = await Maquina.findByPk(params.id);
    if (!maquina) return NextResponse.json({ erro: 'Máquina não encontrada' }, { status: 404 });
    if (maquina.id_proprietario !== decoded.id) {
      return NextResponse.json(
        { erro: 'Você não tem permissão para alterar esta máquina.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    delete body.id;
    delete body.id_proprietario;
    await maquina.update(body);

    const completa = await Maquina.findByPk(params.id, {
      include: [{ model: Usuario, as: 'proprietario', attributes: ['id', 'nome', 'cidade'] }],
    });

    return NextResponse.json({ maquina: enriquecer(completa || maquina), mensagem: 'Máquina atualizada com sucesso' });
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao atualizar máquina', detalhes: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

    await syncDb();
    const maquina = await Maquina.findByPk(params.id);
    if (!maquina) return NextResponse.json({ erro: 'Máquina não encontrada' }, { status: 404 });
    if (maquina.id_proprietario !== decoded.id) {
      return NextResponse.json(
        { erro: 'Você não tem permissão para excluir esta máquina.' },
        { status: 403 }
      );
    }

    await maquina.destroy();
    return NextResponse.json({ mensagem: 'Máquina removida com sucesso' });
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao remover máquina', detalhes: error.message },
      { status: 500 }
    );
  }
}
