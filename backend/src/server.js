import express from 'express';
import cors from 'cors';
import sequelize from './database/db.js';
import {
  verificarToken,
  apenasDono,
  apenasUsuarioDoParametro,
} from './middleware/authMiddleware.js';

import Usuario from './model/usuarioModel.js';
import Maquina from './model/maquinaModel.js';

Usuario.hasMany(Maquina, { foreignKey: 'id_proprietario', as: 'maquinas' });
Maquina.belongsTo(Usuario, {
  foreignKey: 'id_proprietario',
  as: 'proprietario',
});

import {
  obterUsuarioLogado,
  obterUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario,
} from './controller/usuarioController.js';

import {
  obterTodasMaquinas,
  obterMaquinasDoUsuario,
  obtermaquinaPorId,
  criarmaquina,
  atualizarMaquina,
  deletarMaquina,
} from './controller/maquinaController.js';

import { apenasProprietarioMaquina } from './middleware/maquinaOwnerMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SOLOOBRA API - STATUS: ONLINE');
});

app.post('/login', loginUsuario);

app.post('/api/usuarios', criarUsuario);
app.get('/api/usuarios/me', verificarToken, obterUsuarioLogado);
app.get('/api/usuarios/:id', verificarToken, apenasUsuarioDoParametro, obterUsuarioPorId);
app.put('/api/usuarios/:id', verificarToken, apenasUsuarioDoParametro, atualizarUsuario);
app.delete('/api/usuarios/:id', verificarToken, apenasUsuarioDoParametro, deletarUsuario);

/** IMPORTANTE: /minhas antes de /:id — senão "minhas" é interpretado como id. */
app.get('/api/maquinas/minhas', verificarToken, obterMaquinasDoUsuario);
app.get('/api/maquinas', obterTodasMaquinas);
app.get('/api/maquinas/:id', obtermaquinaPorId);

app.post('/api/maquinas', verificarToken, apenasDono, criarmaquina);
app.put('/api/maquinas/:id', verificarToken, apenasProprietarioMaquina, atualizarMaquina);
app.delete('/api/maquinas/:id', verificarToken, apenasProprietarioMaquina, deletarMaquina);

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida com sucesso.');

    await sequelize.sync({ alter: true });
    console.log('Tabelas e relações sincronizadas.');

    app.listen(5000, () => {
      console.log(`Servidor rodando em http://localhost:5000`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
