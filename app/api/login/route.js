import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Usuario, syncDb } from '../../../lib/models/index.js';
import { gerarToken } from '../../../lib/auth.js';

export async function POST(request) {
  try {
    await syncDb();
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json({ erro: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      return NextResponse.json({ erro: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    let senhaValida =
      usuario.senha?.startsWith('$2') && (await bcrypt.compare(senha, usuario.senha));

    if (!senhaValida && usuario.senha && !usuario.senha.startsWith('$2') && usuario.senha === senha) {
      senhaValida = true;
      await usuario.update({ senha: await bcrypt.hash(senha, 10) });
    }

    if (!senhaValida) {
      return NextResponse.json({ erro: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = gerarToken(usuario);
    const dados = usuario.toJSON();
    delete dados.senha;

    return NextResponse.json({ mensagem: 'Login realizado com sucesso!', token, usuario: dados });
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro no servidor ao processar login', detalhes: error.message },
      { status: 500 }
    );
  }
}
