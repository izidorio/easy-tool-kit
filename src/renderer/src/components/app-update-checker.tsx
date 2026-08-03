import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppUpdateCheckResult, AppUpdateProgress } from '../../../types/app-update';
import { toast } from '@renderer/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';
import { Button } from '@renderer/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getIpcErrorMessage, isAppUpdateCheckResult } from '@renderer/lib/app-update-ipc';

const MAX_RELEASE_NOTES_LENGTH = 500;

type AppUpdateContextValue = {
  checkForUpdates: (manual?: boolean) => Promise<void>;
  appVersion: string;
};

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);

function truncateNotes(notes: string): string {
  if (notes.length <= MAX_RELEASE_NOTES_LENGTH) {
    return notes;
  }
  return `${notes.slice(0, MAX_RELEASE_NOTES_LENGTH).trim()}…`;
}

function UpdateProgressBar({ percent, message }: { percent: number; message: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{percent}%</p>
    </div>
  );
}

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const [appVersion, setAppVersion] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<AppUpdateCheckResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<AppUpdateProgress>({ percent: 0, message: '' });

  useEffect(() => {
    void window.api.getAppVersion().then(setAppVersion);
  }, []);

  const checkForUpdates = useCallback(async (manual = false) => {
    void window.api.logAppUpdate(`checkForUpdates manual=${manual}`);
    const result = await window.api.checkAppUpdate();
    void window.api.logAppUpdate(`resposta IPC bruta: ${JSON.stringify(result)}`);

    if (!isAppUpdateCheckResult(result) || result.error) {
      const message = result.error ?? getIpcErrorMessage(result);
      void window.api.logAppUpdate(`resposta não é AppUpdateCheckResult. Erro: ${message}`);
      if (manual) {
        toast({
          title: 'Não foi possível verificar atualizações',
          description: message,
          variant: 'destructive',
        });
      }
      return;
    }

    if (result.updateAvailable) {
      setUpdateInfo(result);
      setDialogOpen(true);
      return;
    }

    if (manual) {
      toast({
        title: 'Você já está na versão mais recente',
        description: `Instalada: v${result.currentVersion} | GitHub latest: v${result.latestVersion}`,
      });
    }
  }, []);

  useEffect(() => {
    void checkForUpdates(false);
  }, [checkForUpdates]);

  const handleApplyUpdate = async () => {
    if (!updateInfo) {
      return;
    }

    setDownloading(true);
    setProgress({ percent: 0, message: 'Iniciando download...' });

    const unsubscribe = window.api.onAppUpdateProgress((value) => {
      setProgress(value);
    });

    const result = await window.api.downloadAppUpdate({
      downloadUrl: updateInfo.downloadUrl,
      latestVersion: updateInfo.latestVersion,
    });

    unsubscribe();

    if (result !== undefined && result !== null) {
      setDownloading(false);
      toast({
        title: 'Falha ao atualizar',
        description: getIpcErrorMessage(result),
        variant: 'destructive',
      });
      return;
    }

    setProgress({ percent: 100, message: 'Reiniciando...' });
  };

  const contextValue = useMemo(
    () => ({
      checkForUpdates,
      appVersion,
    }),
    [checkForUpdates, appVersion]
  );

  const releaseNotes = updateInfo?.releaseNotes ? truncateNotes(updateInfo.releaseNotes) : '';

  return (
    <AppUpdateContext.Provider value={contextValue}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={(open) => !downloading && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova versão disponível</DialogTitle>
            <DialogDescription>
              {updateInfo
                ? `A versão v${updateInfo.latestVersion} está disponível. Você está na v${updateInfo.currentVersion}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          {updateInfo?.releaseName ? <p className="text-sm font-medium">{updateInfo.releaseName}</p> : null}
          {releaseNotes ? (
            <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-40 overflow-y-auto rounded-md border p-3">
              {releaseNotes}
            </pre>
          ) : null}
          {downloading ? <UpdateProgressBar percent={progress.percent} message={progress.message} /> : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={downloading} onClick={() => setDialogOpen(false)}>
              Agora não
            </Button>
            <Button type="button" disabled={downloading} onClick={() => void handleApplyUpdate()}>
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar agora'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppUpdateContext.Provider>
  );
}

export function useAppUpdate(): AppUpdateContextValue {
  const context = useContext(AppUpdateContext);
  if (!context) {
    throw new Error('useAppUpdate deve ser usado dentro de AppUpdateProvider');
  }
  return context;
}
