import * as Layout from '@renderer/components/layouts';
import { CopyToClipboard } from '@renderer/components/copy-to-clipboard';
import { useAppUpdate } from '@renderer/components/app-update-checker';
import { WatchLogs } from '@renderer/components/watch-logs';
import packageJson from '../../../../../package.json';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { GlobeCheck, Loader2 } from 'lucide-react';

export function About() {
  const { checkForUpdates } = useAppUpdate();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateLogPath, setUpdateLogPath] = useState('');

  useEffect(() => {
    void window.api.getAppUpdateLogPath().then(setUpdateLogPath);
  }, []);
  
  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    try {
      await checkForUpdates(true);
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <Layout.Root>
      <Layout.Breadcrumb links={[{ name: 'Sobre', href: '#' }]} />
      <Layout.Content>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={checkingUpdate}
                  onClick={() => void handleCheckUpdates()}
                >
                  {checkingUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GlobeCheck className="mr-2 h-4 w-4" />}
                  Verificar atualizações
                </Button>
              </div>
            </section>
            <section className="space-y-2 hidden">
              <h2 className="text-xl font-semibold text-foreground">Diagnóstico de atualização</h2>
              <p className="text-sm text-muted-foreground">
                Após clicar em &quot;Verificar atualizações&quot;, copie os logs abaixo ou o arquivo:
              </p>
              {updateLogPath ? (
                <CopyToClipboard>
                  <span className="text-xs break-all">{updateLogPath}</span>
                </CopyToClipboard>
              ) : null}
              <WatchLogs className="w-full max-w-4xl" height={220} showToolbar />
            </section>
            <section>
              <h2 className="flex text-xl font-semibold text-foreground mb-3 gap-2 items-baseline">
                Sobre os sistema
                <p className="text-sm text-muted-foreground">versão {packageJson.version}</p>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Este sistema foi desenvolvido para auxiliar analistas em suas atividades diárias, gerenciando o
                download, a descriptografia e a indexação de evidências.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Objetivos</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Automatizar tarefas repetitivas</li>
                <li>Melhorar a produtividade dos analistas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contato</h2>
              <p className="text-muted-foreground flex flex-col gap-1">
                Para mais informações ou suporte técnico, entre em contato com nossa equipe de suporte.
                <CopyToClipboard>
                  <span>izidorio@bento.dev.br</span>
                </CopyToClipboard>
              </p>
            </section>
          </div>
        </div>
      </Layout.Content>
    </Layout.Root>
  );
}
