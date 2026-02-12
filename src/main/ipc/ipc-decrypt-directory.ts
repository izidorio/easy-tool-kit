import { ipcMain } from 'electron';
import { decryptFile } from '../services';
import { join } from 'node:path';
import fs from 'node:fs';
import { sendLog } from '../services/send-logs';
//TODO: ler os arquivos .gpg de um diretorio

ipcMain.handle('ipc-decrypt-directory', async (_, { input_dir, output_dir, password }: { input_dir: string; output_dir: string; password: string }) => {
    try {
        const files = fs.readdirSync(input_dir);
        const gpgFiles = files.filter(file => file.endsWith('.gpg'));
        
        if (gpgFiles.length === 0) {
            sendLog('Nenhum arquivo .gpg encontrado no diretório');
            return true;
        }

        sendLog(`Encontrados ${gpgFiles.length} arquivos .gpg no diretório`);

        let successCount = 0;
        let errorCount = 0;
        let fileErrors: string[] = [];

        for (const file of gpgFiles) {
            try {
                const inputPath = join(input_dir, file);
                const outputPath = join(output_dir, file.replace(/[.gpg|.zip]/g, ''));
                
                sendLog(`Descriptografando arquivo: ${inputPath}`);
                await decryptFile(inputPath, outputPath, password);
                successCount++;
                // Pequeno delay entre arquivos para dar tempo ao GC e reduzir pico de memória
                await new Promise((r) => setTimeout(r, 50));
            } catch (error: any) {
                errorCount++;
                fileErrors.push(`${file}: ${error.message}`);
                sendLog(`Erro ao descriptografar ${file}: ${error.message}`);
                // Continua processando os próximos arquivos
            }
        }

        sendLog(`Processamento concluído: ${successCount} sucesso(s), ${errorCount} erro(s)`);
        sendLog(`Erros: ${fileErrors.join('\n')}`);
        
        if (errorCount > 0 && successCount === 0) {
            return new Error(`Erro ao descriptografar todos os arquivos do diretório`);
        }
        
        return true;
    }
    catch (error: any) {
        return new Error(`Erro ao processar diretório: ${error.message}`);
    }
});