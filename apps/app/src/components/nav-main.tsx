import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "@tanstack/react-router";

export function NavMain({
  items,
}: {
  items: {
    url: string;
    title: string;
    icon?: LucideIcon;
    isActive?: boolean;
    onClick?: () => void;
  }[];
}) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.title}
            onClick={() => {
              router.navigate({ to: item.url });
            }}
          >
            <SidebarMenuButton
              className="p-4 h-10"
              tooltip={item.title}
              isActive={item.isActive}
              onClick={item.onClick}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
