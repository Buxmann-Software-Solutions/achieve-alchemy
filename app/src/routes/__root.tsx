import { DesktopLayout } from "@/components/layouts/desktop-layout";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <>
      <Root />
      <Toaster />
    </>
  ),
});

const Root = () => {
  return (
    <DesktopLayout>
      <Outlet />
    </DesktopLayout>
  );
};
