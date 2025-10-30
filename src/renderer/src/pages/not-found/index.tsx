import { useLocation } from 'react-router-dom';
import * as Layout from '@renderer/components/layouts';

export function NotFound() {
  const { pathname } = useLocation();

  return (
    <Layout.Root>
      <Layout.Breadcrumb
        links={[
          { name: 'Home', href: '/' },
          { name: 'Recurso não encontrado', href: '#' },
        ]}
      />
      <Layout.Content>
        <div className="p-2">
          <h1>não foi possível acessar o recurso "{pathname}"</h1>
        </div>
      </Layout.Content>
    </Layout.Root>
  );
}
