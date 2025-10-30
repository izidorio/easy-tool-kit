import fs from 'node:fs';

export const createDirectoryIfNotExists = (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true }); // `recursive: true` cria diretórios pai se não existirem
  }
};
