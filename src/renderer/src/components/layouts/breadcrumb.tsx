import { Separator } from '@radix-ui/react-separator';
import { Link } from 'react-router-dom';
import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@renderer/components/ui/breadcrumb';

import { ModeToggle } from '../mode-toggle';
import { SidebarTrigger } from '../ui/sidebar';
import { cn } from '../../lib/utils';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  links: { name: string; href?: string }[] | string;
}

export function Breadcrumb({ links, className, ...props }: BreadcrumbProps) {
  const isString = typeof links === 'string';

  return (
    <header className={cn("flex items-center justify-between p-1 px-4", className)} {...props}>
      <div className="flex items-center">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-3 m-2 bg-muted-foreground" />

        <BreadcrumbUI>
          <BreadcrumbList>
            {links && isString && <span className="hidden md:flex">{links}</span>}

            {!isString &&
              links?.map((link, index) => {
                if (link.href) {
                  return (
                    <div key={link.href} className="flex items-center">
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink asChild>
                          <Link to={link.href} replace>
                            {link.name}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator
                        className="data-[last=true]:hidden"
                        data-last={links.length === index + 1}
                        key={`separator-${index}`}
                      />
                    </div>
                  );
                }
                return (
                  <BreadcrumbItem key={link.name}>
                    <BreadcrumbPage>{link.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                );
              })}
          </BreadcrumbList>
        </BreadcrumbUI>
      </div>
      <ModeToggle />
    </header>
  );
}
