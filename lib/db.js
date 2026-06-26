import pg from 'pg';

const { Pool } = pg;
const g = globalThis;

if (!g.__pgPool) {
  const url = process.env.DATABASE_URL;
  g.__pgPool = new Pool(
    url
      ? { connectionString: url, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.PGHOST || 'localhost',
          port: Number(process.env.PGPORT || 5432),
          database: process.env.PGDATABASE || 'SoloObraDB',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || '',
        }
  );
}

export default g.__pgPool;
