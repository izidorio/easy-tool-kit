import { Inbox, Settings, CloudLightning, Users, PackageOpen } from 'lucide-react';

interface Item {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;

  subItems?: {
    title: string;
    path: string;
  }[];
}

export const items: Item[] = [
  {
    title: 'Nuvens',
    path: '/clouds',
    icon: CloudLightning,
  },
  {
    title: 'Alvos',
    path: '/targets',
    icon: Users,
  },
  {
    title: 'Descriptografar',
    path: '/decrypt-evidence',
    icon: PackageOpen,
  },
  {
    title: 'Settings',
    path: '/settings/params',
    icon: Settings,
  },
  {
    title: 'Sobre',
    path: '/about',
    icon: Inbox,
  },
];
