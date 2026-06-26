import { DataTypes } from 'sequelize';
import db from '../db.js';

const Usuario =
  db.models.Usuario ??
  db.define(
    'Usuario',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tipo: { type: DataTypes.ENUM('cliente', 'dono', 'operador'), allowNull: false },
      nome: { type: DataTypes.STRING(100), allowNull: false },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      senha: { type: DataTypes.STRING(255), allowNull: false },
      telefone: { type: DataTypes.STRING(20) },
      cpf_cnpj: { type: DataTypes.STRING(20) },
      endereco: { type: DataTypes.STRING(255) },
      cidade: { type: DataTypes.STRING(100) },
      estado: { type: DataTypes.STRING(50) },
    },
    { tableName: 'usuarios', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );

const Maquina =
  db.models.Maquina ??
  db.define(
    'Maquina',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_proprietario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      nome: { type: DataTypes.STRING(100), allowNull: false },
      tipo_maquina: { type: DataTypes.STRING(50), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      preco_diaria: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      disponibilidade: { type: DataTypes.BOOLEAN, defaultValue: true },
      localizacao: { type: DataTypes.STRING(255), allowNull: true },
      img_url: { type: DataTypes.STRING(255) },
      especificacoes: { type: DataTypes.JSON, allowNull: true },
      recursos: { type: DataTypes.JSON, allowNull: true },
    },
    { tableName: 'maquinas', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );

if (!Usuario.associations?.maquinas) {
  Usuario.hasMany(Maquina, { foreignKey: 'id_proprietario', as: 'maquinas' });
  Maquina.belongsTo(Usuario, { foreignKey: 'id_proprietario', as: 'proprietario' });
}

let _syncPromise = null;
export async function syncDb() {
  if (!_syncPromise) {
    _syncPromise = db.sync({ alter: true }).catch((err) => {
      _syncPromise = null;
      throw err;
    });
  }
  return _syncPromise;
}

export { Usuario, Maquina };
export default db;
