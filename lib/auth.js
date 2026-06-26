import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'soloobra-dev-secret-mude-em-producao';

export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
    SECRET,
    { expiresIn: '24h' }
  );
}

/** Extrai e valida o token do header Authorization de um NextRequest. */
export function verificarTokenReq(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
