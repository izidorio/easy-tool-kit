import { NavLink } from 'react-router-dom';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@renderer/components/ui/sidebar';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@renderer/components/ui/collapsible';
import { Button } from './ui/button';

import { items } from './_menu-items';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                if (item.subItems) {
                  return (
                    <Collapsible className="group/collapsible" key={item.title}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild className="group">
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <Button variant="ghost" size="sm" className="p-0 ml-auto">
                              <ChevronRightIcon className="h-4 w-4 group-data-[state=open]/collapsible:rotate-90" />
                              <span className="sr-only">Toggle</span>
                            </Button>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              {item.subItems.map((subItem) => (
                                <NavLink key={subItem.title} to={subItem.path}>
                                  <SidebarMenuSubButton to={subItem.path}>
                                    <span>{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </NavLink>
                              ))}
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                return (
                  <NavLink key={item.title} to={item.path}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </NavLink>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
