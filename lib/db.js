import { Sequelize } from 'sequelize';

const g = globalThis;

if (!g.__sequelize) {
  const url = process.env.DATABASE_URL;
  if (url) {
    g.__sequelize = new Sequelize(url, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    });
  } else {
    g.__sequelize = new Sequelize(
      process.env.PGDATABASE || 'SoloObraDB',
      process.env.PGUSER || 'postgres',
      process.env.PGPASSWORD || process.env.PG_PASSWORD || '',
      {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        dialect: 'postgres',
        logging: false,
      }
    );
  }
}

export default g.__sequelize;
