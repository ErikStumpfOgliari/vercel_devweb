import bcrypt from 'bcryptjs';
import Usuario from '../model/usuarioModel.js';
import { gerarToken } from '../middleware/authMiddleware.js';
import {
  normalizarTipoUsuario,
  sanitizarUsuario,
} from '../utils/usuarioUtils.js';

const HASH_ROUNDS = 10;

export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    let senhaValida =
      usuario.senha &&
      usuario.senha.startsWith('$2') &&
      (await bcrypt.compare(senha, usuario.senha));

    if (
      !senhaValida &&
      usuario.senha &&
      !usuario.senha.startsWith('$2') &&
      usuario.senha === senha
    ) {
      senhaValida = true;
      await usuario.update({
        senha: await bcrypt.hash(senha, HASH_ROUNDS),
      });
    }

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = gerarToken(usuario);

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: sanitizarUsuario(usuario),
    });
  } catch (error) {
    res.status(500).json({
      erro: 'Erro no servidor ao processar login',
      detalhes: error.message,
    });
  }
};

/** Retorna dados do usuário autenticado (para perfil atualizado sem localStorage só). */
export const obterUsuarioLogado = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(sanitizarUsuario(usuario));
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao buscar usuário',
      detalhes: error.message,
    });
  }
};

export const obterUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(sanitizarUsuario(usuario));
  } catch (error) {
    res.status(500).json({
      erro: 'Erro no servidor ao buscar usuário',
      detalhes: error.message,
    });
  }
};

export const criarUsuario = async (req, res) => {
  try {
    const {
      tipo,
      nome,
      email,
      telefone,
      cpf_cnpj,
      endereco,
      cidade,
      estado,
      senha,
    } = req.body;

    const tipoNormalizado = normalizarTipoUsuario(tipo);
    if (!tipoNormalizado) {
      return res.status(400).json({
        erro: 'Tipo de usuário inválido. Use Cliente ou Dono.',
      });
    }

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ erro: 'Campos obrigatórios: tipo, nome, email e senha.' });
    }

    const senhaHash = await bcrypt.hash(senha, HASH_ROUNDS);

    const novo = await Usuario.create({
      tipo: tipoNormalizado,
      nome,
      email: email.trim().toLowerCase(),
      senha: senhaHash,
      telefone,
      cpf_cnpj,
      endereco,
      cidade,
      estado,
    });

    res.status(201).json({
      usuario: sanitizarUsuario(novo),
      mensagem: 'Usuário criado com sucesso',
    });
  } catch (error) {
    if (
      error.name === 'SequelizeUniqueConstraintError' ||
      error.parent?.code === '23505'
    ) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    res.status(500).json({
      erro: 'Erro ao criar usuário',
      detalhes: error.message,
    });
  }
};

export const atualizarUsuario = async (req, res) => {
  try {
    const idNum = Number(req.params.id);
    if (req.usuario.id !== idNum) {
      return res
        .status(403)
        .json({ erro: 'Você só pode alterar o seu próprio perfil.' });
    }

    const usuario = await Usuario.findByPk(idNum);
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const corpo = { ...req.body };
    delete corpo.id;
    delete corpo.email;
    if (typeof corpo.senha === 'string' && corpo.senha.length > 0) {
      corpo.senha = await bcrypt.hash(corpo.senha, HASH_ROUNDS);
    } else {
      delete corpo.senha;
    }
    if (corpo.tipo !== undefined) {
      const tn = normalizarTipoUsuario(corpo.tipo);
      if (!tn) {
        return res.status(400).json({ erro: 'Tipo inválido. Use Cliente ou Dono.' });
      }
      corpo.tipo = tn;
    }

    await usuario.update(corpo);
    res.json({ usuario: sanitizarUsuario(usuario), mensagem: 'Perfil atualizado' });
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao atualizar usuário',
      detalhes: error.message,
    });
  }
};

export const deletarUsuario = async (req, res) => {
  try {
    const idNum = Number(req.params.id);
    if (req.usuario.id !== idNum) {
      return res
        .status(403)
        .json({ erro: 'Você só pode remover a própria conta.' });
    }

    const deletado = await Usuario.destroy({ where: { id: idNum } });
    if (!deletado) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Conta removida com sucesso' });
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao remover conta',
      detalhes: error.message,
    });
  }
};
