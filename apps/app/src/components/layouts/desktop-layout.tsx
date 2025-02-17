import { cn } from "@/lib/utils";
import { useState } from "react";
import { Timer, Bird, ArrowRight, Moon, Sun } from "lucide-react";
import { useSetAtom } from "jotai/react";
import { useAtomValue } from "jotai/react";
import { themeAtom } from "@/stores/global";
import { NavUser } from "@/components/nav-user";
import {
  SidebarFooter,
  SidebarContent,
  SidebarHeader,
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
  useSidebar,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "../nav-main";
import { useSession } from "@/lib/auth-client";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

enum NavItemType {
  HABITS = "/",
  POMODORO = "/pomodoro",
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

const AppSidebar = () => {
  const { data } = useSession();
  const [selectedMenu, setSelectedMenu] = useState<NavItemType>(
    NavItemType.HABITS
  );

  // This is sample data.
  const navMain = [
    {
      title: "Habits",
      icon: Bird,
      isActive: selectedMenu === NavItemType.HABITS,
      url: NavItemType.HABITS,
      onClick: () => setSelectedMenu(NavItemType.HABITS),
    },
    {
      title: "Pomodoro",
      icon: Timer,
      isActive: selectedMenu === NavItemType.POMODORO,
      url: NavItemType.POMODORO,
      onClick: () => setSelectedMenu(NavItemType.POMODORO),
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      style={{
        // @ts-ignore
        "--sidebar-width": "250px",
      }}
    >
      <SidebarHeader>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <NavUser
          user={{
            name: data?.user?.name || "",
            email: data?.user?.email || "",
            avatar: data?.user?.image || "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const ThemeToggle = () => {
  const theme = useAtomValue(themeAtom);
  const setTheme = useSetAtom(themeAtom);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="p-4 h-10"
          tooltip="Toggle Sidebar"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const SidebarToggle = () => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="p-4 h-10"
          tooltip="Toggle Sidebar"
          onClick={toggleSidebar}
        >
          <ArrowRight
            className={cn("transform animate-in ease-in-out duration-300", {
              "rotate-180": open,
            })}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
