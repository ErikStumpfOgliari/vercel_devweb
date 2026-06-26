import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Usuario, syncDb } from '../../../../lib/models/index.js';
import { verificarTokenReq } from '../../../../lib/auth.js';

export async function GET(request, { params }) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
    if (decoded.id !== Number(params.id)) return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 });

    await syncDb();
    const usuario = await Usuario.findByPk(params.id);
    if (!usuario) return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 });

    const dados = usuario.toJSON();
    delete dados.senha;
    return NextResponse.json(dados);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro no servidor', detalhes: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
    if (decoded.id !== Number(params.id)) return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 });

    await syncDb();
    const usuario = await Usuario.findByPk(params.id);
    if (!usuario) return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 });

    const corpo = await request.json();
    delete corpo.id;
    delete corpo.email;

    if (corpo.senha) {
      corpo.senha = await bcrypt.hash(corpo.senha, 10);
    } else {
      delete corpo.senha;
    }

    if (corpo.tipo !== undefined) {
      const t = corpo.tipo.trim().toLowerCase();
      if (!['cliente', 'dono'].includes(t)) {
        return NextResponse.json({ erro: 'Tipo inválido. Use Cliente ou Dono.' }, { status: 400 });
      }
      corpo.tipo = t;
    }

    await usuario.update(corpo);
    const dados = usuario.toJSON();
    delete dados.senha;
    return NextResponse.json({ usuario: dados, mensagem: 'Perfil atualizado' });
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao atualizar', detalhes: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
    if (decoded.id !== Number(params.id)) return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 });

    await syncDb();
    const deletado = await Usuario.destroy({ where: { id: params.id } });
    if (!deletado) return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 });

    return NextResponse.json({ mensagem: 'Conta removida com sucesso' });
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao remover conta', detalhes: error.message }, { status: 500 });
  }
}
