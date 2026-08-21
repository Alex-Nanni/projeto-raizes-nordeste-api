import fs from 'fs';
import path from 'path';

// Cria pasta logs se não existir
const logDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'audit.log');

export function logAudit(action: string, userId?: number, details?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    userId,
    details,
  };
  const line = JSON.stringify(logEntry) + '\n';
  // Escreve no arquivo (modo assíncrono)
  fs.appendFile(logFile, line, (err) => {
    if (err) console.error('Erro ao escrever log:', err);
  });
  // Também imprime no console para debug
  console.log(`[AUDIT] ${action} - User: ${userId || 'sistema'}`);
}