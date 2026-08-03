import axios from 'axios';
import { app } from 'electron';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import type { AppUpdateProgress } from '../../types/app-update';
import { formatBytes } from './format-bytes';
import { logAppUpdate } from './app-update-log';

const EXECUTABLE_NAME = 'easy-tool-kit.exe';

function getAppInstallDir(): string {
  return path.dirname(process.execPath);
}

function getUpdateBaseDir(version: string): string {
  return path.join(app.getPath('temp'), 'easy-tool-kit-update', version);
}

function reportProgress(
  onProgress: ((progress: AppUpdateProgress) => void) | undefined,
  progress: AppUpdateProgress
): void {
  onProgress?.(progress);
}

async function removeDirRobust(dir: string): Promise<void> {
  try {
    await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logAppUpdate(`Aviso ao limpar pasta (será ignorado se não existir): ${dir} — ${message}`);
  }
}

async function downloadUpdateZip(
  downloadUrl: string,
  zipPath: string,
  onProgress?: (progress: AppUpdateProgress) => void
): Promise<void> {
  logAppUpdate(`Download iniciado: ${downloadUrl}`);
  reportProgress(onProgress, { percent: 0, message: 'Conectando ao GitHub...' });

  const response = await axios({
    url: downloadUrl,
    method: 'GET',
    responseType: 'stream',
    maxRedirects: 10,
    headers: {
      Accept: 'application/octet-stream',
      'User-Agent': 'easy-tool-kit',
    },
    timeout: 0,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentLengthHeader = response.headers['content-length'];
  const totalBytes = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : 0;
  logAppUpdate(
    `Download HTTP ${response.status}. content-length=${totalBytes > 0 ? formatBytes(totalBytes) : 'desconhecido'}`
  );

  await fs.promises.mkdir(path.dirname(zipPath), { recursive: true });

  let loadedBytes = 0;
  let lastLoggedPercent = -1;

  await new Promise<void>((resolve, reject) => {
    const writer = createWriteStream(zipPath);

    response.data.on('data', (chunk: Buffer) => {
      loadedBytes += chunk.length;

      if (totalBytes > 0) {
        const percent = Math.min(99, Math.round((loadedBytes / totalBytes) * 100));
        reportProgress(onProgress, {
          percent,
          message: `Baixando... ${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`,
        });
        if (percent >= lastLoggedPercent + 10) {
          lastLoggedPercent = percent;
          logAppUpdate(`Download progresso: ${percent}% (${formatBytes(loadedBytes)})`);
        }
      } else {
        reportProgress(onProgress, {
          percent: 0,
          message: `Baixando... ${formatBytes(loadedBytes)}`,
        });
      }
    });

    response.data.pipe(writer);
    writer.on('finish', () => {
      logAppUpdate(`Download concluído: ${zipPath} (${formatBytes(loadedBytes)})`);
      resolve();
    });
    writer.on('error', (error) => {
      logAppUpdate(`Erro ao gravar ZIP: ${error.message}`);
      reject(error);
    });
    response.data.on('error', (error: Error) => {
      logAppUpdate(`Erro no stream do download: ${error.message}`);
      reject(error);
    });
  });
}

function verifyZipReadable(zipPath: string): void {
  const result = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `try { Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}').Dispose(); exit 0 } catch { exit 1 }`,
    ],
    { encoding: 'utf8', windowsHide: true }
  );

  if (result.status !== 0) {
    throw new Error('O arquivo baixado não é um ZIP válido.');
  }
}

function buildApplyScript(
  zipPath: string,
  stagingDir: string,
  appDir: string,
  updateDir: string,
  appUpdateLogPath: string
): string {
  const exePath = path.join(appDir, EXECUTABLE_NAME);
  const escapedZip = zipPath.replace(/'/g, "''");
  const escapedStaging = stagingDir.replace(/'/g, "''");
  const escapedAppDir = appDir.replace(/'/g, "''");
  const escapedExe = exePath.replace(/'/g, "''");
  const escapedUpdateDir = updateDir.replace(/'/g, "''");
  const logPath = path.join(updateDir, 'apply-result.log').replace(/'/g, "''");
  const escapedAppLog = appUpdateLogPath.replace(/'/g, "''");

  return `
$ErrorActionPreference = 'Stop'
$logPath = '${logPath}'
$appLog = '${escapedAppLog}'
function Write-ApplyLog([string]$Message) {
  $line = "[$(Get-Date -Format o)] [apply] $Message"
  Add-Content -Path $logPath -Value $line -Encoding UTF8
  Add-Content -Path $appLog -Value $line -Encoding UTF8
}
$zip = '${escapedZip}'
$staging = '${escapedStaging}'
$appDir = '${escapedAppDir}'
$exe = '${escapedExe}'
$updateDir = '${escapedUpdateDir}'

Write-ApplyLog "Script de apply iniciado (PID=$PID)"

try {
  $deadline = (Get-Date).AddMinutes(10)
  do {
    $procs = @(Get-Process -Name 'easy-tool-kit' -ErrorAction SilentlyContinue)
    if ($procs.Count -gt 0) {
      Write-ApplyLog "Aguardando encerrar easy-tool-kit (processos=$($procs.Count))..."
      Start-Sleep -Seconds 2
    }
  } while ($procs.Count -gt 0 -and (Get-Date) -lt $deadline)

  if ((Get-Process -Name 'easy-tool-kit' -ErrorAction SilentlyContinue)) {
    throw "Timeout aguardando o aplicativo encerrar."
  }

  Start-Sleep -Seconds 2

  if (Test-Path -LiteralPath $staging) {
    Write-ApplyLog "Removendo staging anterior: $staging"
    Remove-Item -LiteralPath $staging -Recurse -Force
  }
  New-Item -ItemType Directory -Path $staging -Force | Out-Null

  Write-ApplyLog "Extraindo ZIP para $staging"
  $tar = Get-Command tar.exe -ErrorAction SilentlyContinue
  if ($tar) {
    & tar.exe -xf $zip -C $staging
  } else {
    Expand-Archive -LiteralPath $zip -DestinationPath $staging -Force
  }

  $exeStaging = Join-Path $staging '${EXECUTABLE_NAME}'
  $asar = Join-Path $staging 'resources\\app.asar'
  if (-not (Test-Path -LiteralPath $exeStaging) -or -not (Test-Path -LiteralPath $asar)) {
    throw "Pacote inválido após extração (falta exe ou app.asar)."
  }

  Write-ApplyLog "Copiando de $staging para $appDir"
  Copy-Item -Path (Join-Path $staging '*') -Destination $appDir -Recurse -Force

  Write-ApplyLog "Iniciando $exe"
  Start-Process -FilePath $exe -WorkingDirectory $appDir
  Write-ApplyLog "Atualização aplicada com sucesso"
} catch {
  Write-ApplyLog "FALHA: $($_.Exception.Message)"
  exit 1
}
`.trim();
}

async function spawnApplyScript(scriptPath: string): Promise<void> {
  const updateDir = path.dirname(scriptPath);
  const launcherPath = path.join(updateDir, 'run-apply.cmd');
  const quotedScript = scriptPath.replace(/"/g, '""');
  const launcherContent = `@echo off\r\nstart "EasyToolKitUpdate" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "${quotedScript}"\r\n`;

  await fs.promises.writeFile(launcherPath, launcherContent, 'utf8');

  const child = spawn('cmd.exe', ['/c', launcherPath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });

  child.on('error', (error) => {
    logAppUpdate(`Falha ao iniciar launcher de apply: ${error.message}`);
  });

  child.unref();
  logAppUpdate(`Launcher de apply iniciado (PID ${child.pid ?? 'n/a'}): ${launcherPath}`);
}

export async function applyAppUpdate(
  downloadUrl: string,
  latestVersion: string,
  onProgress?: (progress: AppUpdateProgress) => void
): Promise<void> {
  if (process.platform !== 'win32') {
    throw new Error('Atualização automática disponível apenas no Windows.');
  }

  const appDir = getAppInstallDir();
  const updateDir = getUpdateBaseDir(latestVersion);
  const zipPath = path.join(updateDir, 'easy-tool-kit.zip');
  const stagingDir = path.join(updateDir, 'staging');
  const scriptPath = path.join(updateDir, 'apply-update.ps1');

  logAppUpdate(`Apply iniciado. appDir=${appDir} updateDir=${updateDir}`);

  await removeDirRobust(updateDir);
  await fs.promises.mkdir(updateDir, { recursive: true });

  await downloadUpdateZip(downloadUrl, zipPath, onProgress);
  verifyZipReadable(zipPath);
  const zipStat = await fs.promises.stat(zipPath);
  logAppUpdate(`ZIP validado: ${formatBytes(zipStat.size)}`);

  const appUpdateLogPath = path.join(appDir, 'easy-tool-kit-update.log');

  const script = buildApplyScript(zipPath, stagingDir, appDir, updateDir, appUpdateLogPath);
  await fs.promises.writeFile(scriptPath, script, 'utf8');
  const applyResultLog = path.join(updateDir, 'apply-result.log');
  logAppUpdate(`Script gravado: ${scriptPath}`);
  logAppUpdate(`Extração e cópia ocorrerão após fechar o app. Log: ${applyResultLog}`);

  reportProgress(onProgress, {
    percent: 100,
    message: 'Download concluído. Reiniciando para instalar...',
  });
  await spawnApplyScript(scriptPath);

  logAppUpdate('Encerrando aplicativo para aplicar atualização...');
  setTimeout(() => {
    app.quit();
  }, 1500);
}
