import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runSchema = async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      multipleStatements: true,
    });

    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await conn.query(schema);

    console.log('✅ Schema applied! Tables created: users, dishes, recipes, techniques, reflection_logs');

    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tables now in database:', tables.map(t => Object.values(t)[0]));

    await conn.end();
  } catch (err) {
    console.log('❌ Failed to run schema:', err.message);
  }
};

runSchema();
