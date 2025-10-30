import { Outlet as LayoutOutlet } from '@renderer/components/layouts/outlet';
import { Outlet } from 'react-router-dom';

export function Protected() {
  return (
    <LayoutOutlet>
      <Outlet />
    </LayoutOutlet>
  );
}
