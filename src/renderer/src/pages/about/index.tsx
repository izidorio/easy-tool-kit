import * as Layout from '@renderer/components/layouts';
import { CopyToClipboard } from '@renderer/components/copy-to-clipboard';
import packageJson from '../../../../../package.json';

export function About() {
  return (
    <Layout.Root>
      <Layout.Breadcrumb links={[{ name: 'Sobre', href: '#' }]} />
      <Layout.Content>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
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
