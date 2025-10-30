import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@renderer/components/ui/breadcrumb';

import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  links: { name: string; href?: string }[] | string;
}

export function AppBreadcrumb({ links }: BreadcrumbProps) {
  const isString = typeof links === 'string';

  return (
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
  );
}
