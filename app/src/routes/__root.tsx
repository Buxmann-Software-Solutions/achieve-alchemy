import { DesktopLayout } from "@/components/layouts/desktop-layout";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <>
      <DesktopLayout>
        <Outlet />
      </DesktopLayout>
      <Toaster />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
