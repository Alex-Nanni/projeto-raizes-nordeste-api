import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    console.error(`❌ Variável de ambiente obrigatória ausente: ${name}`);
    console.error(`   Configure-a no arquivo .env (veja .env.example) antes de iniciar o servidor.`);
    process.exit(1);
  }
  return value;
}

export const env = {
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  DATABASE_URL: required('DATABASE_URL'),
  PORT: process.env.PORT || 3000,
};