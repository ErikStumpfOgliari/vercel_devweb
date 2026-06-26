/**
 * Popular o banco com usuários e máquinas de exemplo (desenvolvimento).
 * Rode na raiz do projeto: npm run seed
 */
import bcrypt from 'bcryptjs';
import sequelize from './database/db.js';
import Usuario from './model/usuarioModel.js';
import Maquina from './model/maquinaModel.js';

Usuario.hasMany(Maquina, { foreignKey: 'id_proprietario', as: 'maquinas' });
Maquina.belongsTo(Usuario, {
  foreignKey: 'id_proprietario',
  as: 'proprietario',
});

async function seed() {
  await sequelize.authenticate();

  console.log('Sincronizando modelo...');
  await sequelize.sync({ alter: true });

  const senhaHash = await bcrypt.hash('soloobra123', 10);

  await Usuario.findOrCreate({
    where: { email: 'joao@soloobra.test' },
    defaults: {
      tipo: 'dono',
      nome: 'João Silva – Locações pesadas',
      senha: senhaHash,
      telefone: '11999990001',
      cpf_cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Obras 100',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  });

  await Usuario.findOrCreate({
    where: { email: 'maria@soloobra.test' },
    defaults: {
      tipo: 'dono',
      nome: 'Maria Santos',
      senha: senhaHash,
      telefone: '11987654321',
      cpf_cnpj: '11.222.333/0001-44',
      endereco: 'Av. Terraplenagem 50',
      cidade: 'Guarulhos',
      estado: 'SP',
    },
  });

  await Usuario.findOrCreate({
    where: { email: 'ana@soloobra.test' },
    defaults: {
      tipo: 'cliente',
      nome: 'Ana Cliente',
      senha: senhaHash,
      telefone: '11988887777',
      cpf_cnpj: '123.456.789-00',
      endereco: 'Rua Alfa 10',
      cidade: 'Campinas',
      estado: 'SP',
    },
  });

  const joao = await Usuario.findOne({
    where: { email: 'joao@soloobra.test' },
  });
  if (!joao) {
    console.error('Não foi possível encontrar usuário exemplo joao@soloobra.test.');
    return;
  }

  const existe = await Maquina.count({
    where: { id_proprietario: joao.id },
  });
  if (existe === 0) {
    await Maquina.bulkCreate([
      {
        id_proprietario: joao.id,
        nome: 'Retroescavadeira JCB 3CX',
        tipo_maquina: 'Retroescavadeira',
        descricao:
          'Retroescavadeira em excelente estado, manutenção em dia. Ideal para terraplanagem e escavação.',
        preco_diaria: 350,
        disponibilidade: true,
        localizacao: 'São Paulo, SP',
        img_url: '',
        especificacoes: {
          Ano: '2020',
          Potência: '74 HP',
          Capacidade: '1.2 m³',
          Combustível: 'Diesel',
          Peso: '8.5 toneladas',
        },
        recursos: ['Ar condicionado', 'GPS', 'Seguro atualizado'],
      },
      {
        id_proprietario: joao.id,
        nome: 'Escavadeira CAT 320',
        tipo_maquina: 'Escavadeira',
        descricao:
          'Escavadeira hidráulica alta performance para obras médias e grandes.',
        preco_diaria: 450,
        disponibilidade: true,
        localizacao: 'São Paulo, SP',
        especificacoes: {
          Ano: '2019',
          Peso_operacional: '22 t',
        },
      },
      {
        id_proprietario: joao.id,
        nome: 'Rolo Compactador Vibratório',
        tipo_maquina: 'Rolo Compactador',
        descricao: 'Compactação de base e acabamento de asfalto.',
        preco_diaria: 280,
        disponibilidade: true,
        localizacao: 'Guarulhos, SP',
        especificacoes: {
          Massa_operacional: '12 t',
        },
      },
    ]);
    console.log('Máquinas de exemplo criadas.');
  } else {
    console.log('Já existem máquinas cadastradas para o usuário exemplo; ignorando inserts.');
  }

  console.log('Seed concluído.');
  console.log(' Login dono exemplo: joao@soloobra.test / soloobra123');
  console.log(' Login cliente exemplo: ana@soloobra.test / soloobra123');
}

seed()
  .then(() => sequelize.close())
  .catch((err) => {
    console.error('Falha no seed:', err);
    process.exit(1);
  });
