import { Op } from 'sequelize';
import Maquina from '../model/maquinaModel.js';
import Usuario from '../model/usuarioModel.js';

/** Campos esperados pela listagem/cards — mantém valores padrão até existir modelo de avaliações. */
function enriquecerMaquinaJson(row) {
  const m = typeof row?.toJSON === 'function' ? row.toJSON() : { ...row };
  return {
    ...m,
    avaliacao: m.avaliacao != null ? Number(m.avaliacao) : 4.8,
    totalAvaliacoes: m.totalAvaliacoes != null ? m.totalAvaliacoes : 0,
  };
}

export const obterTodasMaquinas = async (req, res) => {
  try {
    const { tipo, q, local } = req.query;

    const where = {};

    if (tipo && typeof tipo === 'string' && tipo.trim()) {
      where.tipo_maquina = tipo.trim();
    }

    const condicaoTexto = [];
    if (q && typeof q === 'string' && q.trim()) {
      condicaoTexto.push({ nome: { [Op.iLike]: `%${q.trim()}%` } });
    }
    if (local && typeof local === 'string' && local.trim()) {
      condicaoTexto.push({
        localizacao: { [Op.iLike]: `%${local.trim()}%` },
      });
    }

    if (condicaoTexto.length === 1) {
      Object.assign(where, condicaoTexto[0]);
    } else if (condicaoTexto.length > 1) {
      where[Op.and] = condicaoTexto;
    }

    const maquinas = await Maquina.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'cidade'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(maquinas.map(enriquecerMaquinaJson));
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao listar máquinas',
      detalhes: error.message,
    });
  }
};

export const obterMaquinasDoUsuario = async (req, res) => {
  try {
    const lista = await Maquina.findAll({
      where: { id_proprietario: req.usuario.id },
      include: [
        {
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(lista.map(enriquecerMaquinaJson));
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao carregar suas máquinas',
      detalhes: error.message,
    });
  }
};

export const obtermaquinaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const maquina = await Maquina.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'email', 'telefone', 'cidade', 'estado'],
        },
      ],
    });

    if (!maquina) {
      return res.status(404).json({ erro: 'Máquina não encontrada' });
    }

    res.json(enriquecerMaquinaJson(maquina));
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao buscar máquina',
      detalhes: error.message,
    });
  }
};

export const criarmaquina = async (req, res) => {
  try {
    const proprietarioId = req.usuario.id;

    const {
      nome,
      tipo_maquina,
      descricao,
      preco_diaria,
      localizacao,
      img_url,
      especificacoes,
      recursos,
      disponibilidade,
    } = req.body;

    const idCliente = Number(req.body.id_proprietario);
    if (idCliente && idCliente !== proprietarioId) {
      return res.status(403).json({
        erro: 'Você não pode cadastrar máquinas em nome de outro usuário.',
      });
    }

    if (!nome || !tipo_maquina || preco_diaria === undefined || preco_diaria === null) {
      return res.status(400).json({
        erro:
          'Campos obrigatórios: nome, tipo_maquina e preco_diaria.',
      });
    }

    const novaMaquina = await Maquina.create({
      id_proprietario: proprietarioId,
      nome,
      tipo_maquina,
      descricao,
      preco_diaria,
      localizacao,
      img_url,
      especificacoes,
      recursos,
      disponibilidade: disponibilidade !== false && disponibilidade !== 'false',
    });

    const completa = await Maquina.findByPk(novaMaquina.id, {
      include: [
        {
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'cidade'],
        },
      ],
    });

    res.status(201).json({
      maquina: enriquecerMaquinaJson(completa || novaMaquina),
      mensagem: 'Máquina cadastrada com sucesso.',
    });
  } catch (error) {
    res.status(400).json({
      erro: 'Erro ao criar máquina',
      detalhes: error.message,
    });
  }
};

export const atualizarMaquina = async (req, res) => {
  try {
    const { id } = req.params;
    const maquina = await Maquina.findByPk(id);

    if (!maquina) {
      return res.status(404).json({ erro: 'Máquina não encontrada' });
    }

    const atualizacao = { ...req.body };
    delete atualizacao.id;
    delete atualizacao.id_proprietario;

    await maquina.update(atualizacao);

    const completa = await Maquina.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'cidade'],
        },
      ],
    });

    res.json({
      maquina: enriquecerMaquinaJson(completa || maquina),
      mensagem: 'Máquina atualizada com sucesso',
    });
  } catch (error) {
    res.status(400).json({
      erro: 'Erro ao atualizar máquina',
      detalhes: error.message,
    });
  }
};

export const deletarMaquina = async (req, res) => {
  try {
    const { id } = req.params;

    const deletado = await Maquina.destroy({ where: { id } });

    if (!deletado) {
      return res.status(404).json({ erro: 'Máquina não encontrada' });
    }

    res.json({ mensagem: 'Máquina removida com sucesso' });
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao remover máquina',
      detalhes: error.message,
    });
  }
};
