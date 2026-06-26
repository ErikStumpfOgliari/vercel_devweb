import { NextResponse } from 'next/server';
import { Usuario, syncDb } from '../../../../lib/models/index.js';
import { verificarTokenReq } from '../../../../lib/auth.js';

export async function GET(request) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token inválido ou expirado.' }, { status: 401 });
    }

    await syncDb();
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 });
    }

    const dados = usuario.toJSON();
    delete dados.senha;
    return NextResponse.json(dados);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro no servidor', detalhes: error.message }, { status: 500 });
  }
}
