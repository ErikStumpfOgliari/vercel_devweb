import Maquina from '../model/maquinaModel.js';

/** Garante que a máquina em :id existe e pertence ao usuário autenticado. */
export const apenasProprietarioMaquina = async (req, res, next) => {
  try {
    const { id } = req.params;
    const maquina = await Maquina.findByPk(id);
    if (!maquina) {
      return res.status(404).json({ erro: 'Máquina não encontrada' });
    }
    if (maquina.id_proprietario !== req.usuario.id) {
      return res.status(403).json({
        erro: 'Você não tem permissão para alterar ou excluir esta máquina.',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      erro: 'Erro ao validar permissão',
      detalhes: error.message,
    });
  }
};
