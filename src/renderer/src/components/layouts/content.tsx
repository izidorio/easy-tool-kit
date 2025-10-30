import { cn } from '../../lib/utils';

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Content({ children, className, ...props }: ContentProps) {
  return (
    <div className={cn('p-4 max-h-[calc(100vh-44px)]', className)} {...props}>
      {children}
    </div>
  );
}
