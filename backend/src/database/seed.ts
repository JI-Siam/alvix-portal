import 'dotenv/config';
import * as argon2 from 'argon2';
import dataSource from '../config/data-source';

const MAJORS = ['COMPUTER SCIENCE', 'BUSINESS ADMINISTRATION', 'MECHANICAL ENGINEERING', 'ELECTRICAL ENGINEERING', 'KOREAN LANGUAGE', 'INTERNATIONAL BUSINESS'];

async function main() {
  await dataSource.initialize();
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 10) throw new Error('Set SEED_ADMIN_PASSWORD (min 10 chars) in .env');
  await dataSource.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'SUPER_ADMIN') ON CONFLICT (email) DO NOTHING`,
    ['SUPER ADMIN', email, await argon2.hash(password)],
  );
  for (const name of MAJORS) await dataSource.query(`INSERT INTO majors (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [name]);
  await dataSource.query(`INSERT INTO intakes (name) VALUES ('SEPTEMBER-2026') ON CONFLICT (name) DO NOTHING`);
  console.log(`Seeded super admin (${email}) and ${MAJORS.length} majors + SEPTEMBER-2026 intake.`);
  await dataSource.destroy();
}
main().catch((e) => { console.error(e); process.exit(1); });
