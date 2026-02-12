import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from '@renderer/hooks/use-toast';
import { FormProvider } from 'react-hook-form';
import { Input } from '@renderer/components/form/input';
import { Button } from '@renderer/components/ui/button';
import { WatchLogs } from '../../components/watch-logs';
import { PasswordInput } from '../../components/form/password-input';
import * as Layout from '@renderer/components/layouts';

const FormSchema = z.object({
  password: z.string().min(1, 'a senha é obrigatória'),
  input_dir: z.string().min(1, 'o diretório onde os arquivos .gpg estão salvos é obrigatório'),
  output_dir: z
    .string()
    .min(1, 'o diretório onde os downloads serão salvos é obrigatório')
    .refine(
      (path) => !path.includes(' '),
      'O caminho do diretório não pode conter espaços em branco. Use underscores ou hífens. Exemplo: "OPERACAO_NOME" ou "OPERACAO-NOME"'
    ),
});

export function DecryptEvidence() {

  const methods = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      input_dir: '',
      output_dir: '',
    },
  });
  const handleSelectDirectoryInput = async () => {
    const path = await window.api.selectDirectory();
    if (path) {
      methods.setValue('input_dir', path);
      return;
    }

    methods.setValue('input_dir', '');
  };

  const handleSelectDirectoryOutput = async () => {
    const path = await window.api.selectDirectory();
    if (path) {
      methods.setValue('output_dir', path);
      return;
    }

    methods.setValue('output_dir', '');
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const result = await window.api.decryptDirectory({
      input_dir: data.input_dir,
      output_dir: data.output_dir,
      password: data.password,
    });

    if (result instanceof Error) {
      toast({
        title: 'Erro ao descriptografar diretório',
        description: result.message,
        variant: 'destructive',
      });
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
          { name: 'Descptografar', href: '/' },
          { name: 'Descptografar evidência em lote', href: '#' },
        ]}
      />
      <Layout.Content className="py-0">
        <div className="flex flex-col items-start gap-4 w-[800px]">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="grid h-fit w-full grid-cols-12 gap-4">
              <Input
                name="input_dir"
                readOnly
                label="Pasta de entrada (onde os arquivos .gpg estão salvos)"
                className="col-span-12"
                placeholder="click aqui para selecionar"
                onClick={handleSelectDirectoryInput}
              />
              <Input
                name="output_dir"
                readOnly
                label="Pasta destino (onde os arquivos descriptografados serão salvos)"
                className="col-span-12"
                placeholder="click aqui para selecionar"
                onClick={handleSelectDirectoryOutput}
              />
              <PasswordInput name="password" label="Senha para descriptografar" className="col-span-8" />
              <div className="col-span-4 flex justify-end items-end w-full gap-4">
                <Button type="submit" disabled={methods.formState.isSubmitting} className="px-8">
                  <Loader2
                    className="animate-spin hidden data-[show=true]:flex"
                    data-show={methods.formState.isSubmitting}
                  />
                  Descriptografar
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
