import { useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from '@renderer/hooks/use-toast';
import { FormProvider } from 'react-hook-form';
import { Input } from '@renderer/components/form/input';
import { Button } from '@renderer/components/ui/button';
import { CopyToClipboard } from '../../components/copy-to-clipboard';
import * as Layout from '@renderer/components/layouts';
import gitImage from '../../../../../resources/git.png';

const FormSchema = z.object({
  bash_path: z.string().min(1, 'selecione o git-bach.exe'),
  iped_path: z.string().optional(),
});

export function Params() {
  const methods = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      bash_path: '',
      iped_path: '',
    },
  });

  const getSettings = useCallback(async () => {
    const settings = await window.api.getSettings();

    if (settings instanceof Error) {
      toast({
        title: 'Erro ao ler settings',
        description: settings.message,
        variant: 'destructive',
      });
      return;
    }

    methods.reset({
      bash_path: settings.bash_path,
      iped_path: settings.iped_path || '',
    });
  }, []);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  const handleSelectFile = async (field: 'bash_path' | 'iped_path') => {
    const path = await window.api.selectFile([{ name: 'exe', extensions: ['exe'] }]);
    if (path) {
      methods.setValue(field, path);
      return;
    }

    methods.setValue(field, '');
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const result = await window.api.setSettings({
      bash_path: data.bash_path,
      iped_path: data.iped_path,
    });

    if (result instanceof Error) {
      toast({
        title: 'Erro ao atualizar parâmetros',
        description: result.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sucesso',
      description: 'parâmetros salvo com sucesso',
    });
  }

  return (
    <Layout.Root>
      <Layout.Breadcrumb links={[{ name: 'Editar parâmetros', href: '#' }]} />
      <Layout.Content>
        <div className="flex flex-col items-start gap-4  w-[800px]">
          <h1 className="">Editar parâmetros</h1>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="grid h-fit w-full grid-cols-12 gap-4">
              <Input
                name="bash_path"
                label='Selecione o arquivo git-bash.exe normalmente localizado em "C:\Arquivos de Programa\Git\git-bash.exe"'
                readOnly
                className="col-span-full"
                placeholder="click aqui para selecionar"
                onClick={() => handleSelectFile('bash_path')}
              />

              <Input
                name="iped_path"
                label="Selecione o arquivo iped.exe"
                readOnly
                className="col-span-full"
                placeholder="click aqui para selecionar"
                onClick={() => handleSelectFile('iped_path')}
              />

              <div className="col-span-full flex justify-end items-end w-full gap-4">
                <Button type="submit" disabled={methods.formState.isSubmitting} className="px-8">
                  <Loader2
                    className="animate-spin hidden data-[show=true]:flex"
                    data-show={methods.formState.isSubmitting}
                  />
                  Salvar
                </Button>
              </div>
            </form>
          </FormProvider>

          <div className="flex flex-col gap-2">
            <p className="flex gap-2">
              Caso você não tenha o Git <img src={gitImage} className="w-12" /> instalado na sua máquina siga as
              instruções:
            </p>
            <p className="flex flex-col gap-1">
              abra o Powershell e execute o comando abaixo para instalar o Git Bash:
              <div className="flex justify-center bg-muted p-1 rounded-md">
                <CopyToClipboard>winget install --id Git.Git -e --source winget</CopyToClipboard>
              </div>
            </p>

            <a
              href="https://git-scm.com/downloads/win"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex gap-2"
            >
              ou se preferir click aqui para baixar e instalar o <img src={gitImage} className="w-12" />
            </a>
          </div>
        </div>
      </Layout.Content>
    </Layout.Root>
  );
}
