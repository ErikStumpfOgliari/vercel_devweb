import { NextResponse } from 'next/server';
import { Maquina, syncDb } from '../../../../lib/models/index.js';
import { verificarTokenReq } from '../../../../lib/auth.js';

export async function GET(request) {
  try {
    const decoded = verificarTokenReq(request);
    if (!decoded) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

    await syncDb();
    const lista = await Maquina.findAll({
      where: { id_proprietario: decoded.id },
      includeOwner: true,
    });

    return NextResponse.json(lista.map((m) => m.toJSON()));
  } catch (error) {
    return NextResponse.json(
      { erro: 'Erro ao carregar suas máquinas', detalhes: error.message },
      { status: 500 }
    );
  }
}
