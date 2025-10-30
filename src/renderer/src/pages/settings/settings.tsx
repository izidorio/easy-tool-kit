import { Button } from '@renderer/components/ui/button';
import { Pin, PinOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Layout from '@renderer/components/layouts';

export function Settings() {
  const [status, setStatus] = useState<boolean>(false);

  const getStatusAlwaysOnTop = async (): Promise<void> => {
    const res = await window.electron.ipcRenderer.invoke('get-status-always-on-top');

    setStatus(res);
  };

  const handleToggleAlwaysOnTop = async () => {
    const res = await window.electron.ipcRenderer.invoke('toggle-always-on-top');
    setStatus(res);
  };

  useEffect(() => {
    getStatusAlwaysOnTop();
  }, []);

  return (
    <Layout.Root>
      <Layout.Breadcrumb links={[{ name: 'Configurações', href: '#' }]} />
      <Layout.Content>
        <Button onClick={handleToggleAlwaysOnTop} className="bg-muted-foreground">
          {status ? (
            <>
              <PinOff />
              Desafixar a janela sempre no topo
            </>
          ) : (
            <>
              <Pin /> Fixar a janela sempre no topo
            </>
          )}
        </Button>
      </Layout.Content>
    </Layout.Root>
  );
}
