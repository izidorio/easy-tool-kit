import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from '@renderer/hooks/use-toast';
import { FormProvider } from 'react-hook-form';
import { Input } from '@renderer/components/form/input';
import { Button } from '@renderer/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { WatchLogs } from '../../components/watch-logs';
import * as Check from '@renderer/components/form/input-checkbox';
import { useQuery } from '@tanstack/react-query';
import { PasswordInput } from '../../components/form/password-input';
import * as Layout from '@renderer/components/layouts';

const FormSchema = z.object({
  name: z.string(),
  download_link: z.string(),
  password: z.string().min(1, 'a senha é obrigatória'),
  // csv_links: z.string().min(1, 'o arquivo .csv é obrigatório'),
  output_dir: z
    .string()
    .min(1, 'o diretório onde os downloads serão salvos é obrigatório')
    .refine(
      (path) => !path.includes(' '),
      'O caminho do diretório não pode conter espaços em branco. Use underscores ou hífens. Exemplo: "OPERACAO_NOME" ou "OPERACAO-NOME"'
    ),
  status: z.string(),
  reset: z.boolean().optional().nullable(),
});

export function Cloud() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const methods = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      reset: true,
    },
  });

  const { data: cloud, error } = useQuery({
    queryKey: ['cloud', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await window.api.getCloudById(Number(id));
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (cloud) {
      methods.reset({
        ...cloud,
      });
    }
  }, [cloud, methods]);

  useEffect(() => {
    if (error instanceof Error) {
      toast({
        title: 'Erro ao ler nuvem',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  // const handleSelectFile = async () => {
  //   const path = await window.api.selectFile([{ name: 'csv', extensions: ['csv'] }]);
  //   if (path) {
  //     methods.setValue('csv_links', path);
  //     return;
  //   }

  //   methods.setValue('csv_links', '');
  // };

  const handleSelectDirectoryOutput = async () => {
    const path = await window.api.selectDirectory();
    if (path) {
      methods.setValue('output_dir', path);
      return;
    }

    methods.setValue('output_dir', '');
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const result = await window.api.discoveryAccounts(Number(id), {
      ...data,
      links_dir: data.output_dir,
      status: 'discovering',
      reset: data.reset ? true : false,
    });

    if (result instanceof Error) {
      toast({
        title: 'Erro ao atualizar nuvem',
        description: result.message,
        variant: 'destructive',
      });
      return;
    }

    if (data.reset) {
      nav(`/list-accounts/${id}`, { replace: true });
      return;
    }

    toast({
      title: 'Sucesso',
      description: 'Dados salvo com sucesso',
    });
  }

  return (
    <Layout.Root>
      <Layout.Breadcrumb
        links={[
          { name: 'Lista de nuvens', href: '/' },
          { name: 'Editar nuvem', href: '#' },
        ]}
      />
      <Layout.Content className="py-0">
        <div className="flex flex-col items-start gap-4 w-[800px]">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="grid h-fit w-full grid-cols-12 gap-4">
              <Input name="name" label="Nome da nuvem" className="col-span-6" />
              <Input
                name="output_dir"
                readOnly
                label="Pasta destino (NÃO UTILIZE ESPAÇOS no nome da pasta)"
                className="col-span-6"
                placeholder="click aqui para selecionar"
                onClick={handleSelectDirectoryOutput}
              />


              <Input name="download_link" type="url" label="Link de download da nuvem" className="col-span-6" />
              <PasswordInput name="password" label="Senha para descriptografar" className="col-span-6" />

              {/* <Input
                name="csv_links"
                label='Selecione o arquivo "account-download-details.csv" com os links'
                readOnly
                className="col-span-full"
                placeholder="click aqui para selecionar"
                onClick={handleSelectFile}
              />
              */}

              <div
                className="col-span-12 flex items-center pt-1 data-[show=false]:hidden"
                data-show={methods.getValues('status') === 'discovering' ? true : false}
              >
                <Check.Control name="reset" label="Salvar e baixar novamente as contas" />
              </div>

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
          <WatchLogs height={120} className="w-[800px]" />
        </div>
      </Layout.Content>
    </Layout.Root>
  );
}
