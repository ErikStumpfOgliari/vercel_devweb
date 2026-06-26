import pg from 'pg';

let _neonSql = null;
let _localPool = null;

export async function dbQuery(text, params) {
  const url = process.env.DATABASE_URL;

  if (url) {
    if (!_neonSql) {
      const { neon } = await import('@neondatabase/serverless');
      _neonSql = neon(url);
    }
    const result = await _neonSql.query(text, params ?? []);
    return {
      rows: result.rows ?? [],
      rowCount: result.rowCount ?? result.rows?.length ?? 0,
    };
  }

  if (!_localPool) {
    _localPool = new pg.Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'SoloObraDB',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
    });
  }
  return _localPool.query(text, params);
}
