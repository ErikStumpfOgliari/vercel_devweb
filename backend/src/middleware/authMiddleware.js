import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'soloobra-dev-secret-mude-em-producao';

export const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ erro: 'Faltou Informar o Token.' });
        }
        const decoded = jwt.verify(token, SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
};
export const gerarToken = (usuario) => {
    return jwt.sign(
        { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        SECRET,
        { expiresIn: '24h' }
    );
};

export default SECRET;

/** Apenas perfil cadastrado como dono pode publicar/editar suas máquinas. */
export const apenasDono = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== 'dono') {
    return res
      .status(403)
      .json({ erro: 'Somente donos de máquinas podem usar este recurso.' });
  }
  next();
};

/** Só permite acessar o recurso quando :id coincide com quem está autenticado. */
export const apenasUsuarioDoParametro = (req, res, next) => {
  const idPedido = Number(req.params.id);
  if (!req.usuario || !Number.isFinite(idPedido) || idPedido !== req.usuario.id) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }
  next();
};
