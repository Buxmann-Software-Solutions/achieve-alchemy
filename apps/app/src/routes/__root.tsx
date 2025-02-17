import { DesktopLayout } from "@/components/layouts/desktop-layout";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "@/lib/auth-client";
import { Unauthenticated } from "@/components/unauthenticated";
import loadingAnimation from "@/assets/animations/loading.json";
import Lottie from "lottie-react";
import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
  component: () => (
    <>
      <Root />
      <Toaster />
    </>
  ),
});

const Root = () => {
  const { data, isPending, error } = useSession();

  if (isPending) return <Loading />;

  if (error) return <Error />;

  if (!data) return <Unauthenticated />;

  return (
    <DesktopLayout>
      <Outlet />
    </DesktopLayout>
  );
};

const Loading = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center gap-4">
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        style={{
          marginTop: "200px",
          height: 500,
          width: 500,
        }}
      />
    </div>
  );
};

const Error = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <div className="text-xl font-bold">Something went wrong</div>
      <Button className="w-[200px]" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
};
