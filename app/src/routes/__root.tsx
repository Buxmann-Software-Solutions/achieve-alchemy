import { DesktopLayout } from "@/components/layouts/desktop-layout";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useActivateLicenseKey } from "@/hooks/use-activate-license-key";
import { Input } from "@/components/ui/input";
import { isLicenseKeyValidAtom } from "@/stores/global";
import { useAtomValue } from "jotai/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createRootRoute({
  component: () => (
    <>
      <Root />
      <Toaster />
    </>
  ),
});

const Root = () => {
  const isLicenseKeyValid = useAtomValue(isLicenseKeyValidAtom);

  if (!isLicenseKeyValid) {
    return <SignedOut />;
  }

  return (
    <DesktopLayout>
      <Outlet />
    </DesktopLayout>
  );
};

const SignedOut = () => {
  const [internalLicenseKey, setInternalLicenseKey] = useState("");
  const { mutateAsync: activateLicenseKey, isPending } =
    useActivateLicenseKey();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Achieve Alchemy</h1>
          <h2 className="text-xl text-muted-foreground">
            Enter your license key to get started
          </h2>
        </div>
        <div className="space-y-4">
          <Input
            value={internalLicenseKey}
            className="w-full text-center"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            onChange={(e) => setInternalLicenseKey(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={isPending}
            onClick={async () =>
              await activateLicenseKey({
                licenseKey: internalLicenseKey,
                instanceName: "1",
              })
            }
          >
            Activate License
          </Button>
        </div>
      </div>
    </div>
  );
};
