import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Usuario, syncDb } from '../../../lib/models/index.js';

export async function POST(request) {
  try {
    await syncDb();
    const { tipo, nome, email, senha, telefone, cpf_cnpj, endereco, cidade, estado } =
      await request.json();

    if (!tipo || !nome || !email || !senha) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios: tipo, nome, email e senha.' },
        { status: 400 }
      );
    }

    const tipoNorm = tipo.trim().toLowerCase();
    if (!['cliente', 'dono'].includes(tipoNorm)) {
      return NextResponse.json(
        { erro: 'Tipo de usuário inválido. Use Cliente ou Dono.' },
        { status: 400 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novo = await Usuario.create({
      tipo: tipoNorm,
      nome,
      email: email.trim().toLowerCase(),
      senha: senhaHash,
      telefone,
      cpf_cnpj,
      endereco,
      cidade,
      estado,
    });

    const dados = novo.toJSON();
    delete dados.senha;
    return NextResponse.json({ usuario: dados, mensagem: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.parent?.code === '23505') {
      return NextResponse.json({ erro: 'Este e-mail já está cadastrado.' }, { status: 409 });
    }
    return NextResponse.json(
      { erro: 'Erro ao criar usuário', detalhes: error.message },
      { status: 500 }
    );
  }
}
