import { ActivateLicenseKeyArgs } from "@/bindings";
import { taurpc } from "@/lib/taurpc";
import {
  instanceIdAtom,
  isLicenseKeyValidAtom,
  licenseKeyAtom,
} from "@/stores/global";
import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai/react";
import { toast } from "sonner";

export function useActivateLicenseKey() {
  const setLicenseKey = useSetAtom(licenseKeyAtom);
  const setInstanceId = useSetAtom(instanceIdAtom);
  const setIsLicenseKeyValid = useSetAtom(isLicenseKeyValidAtom);

  return useMutation({
    mutationFn: async (args: ActivateLicenseKeyArgs) => {
      const response = await taurpc.activate_license_key(args);

      if (!response.isActivated) {
        toast.error("Invalid license key!");
      }

      return response;
    },

    onSuccess: (response, args) => {
      if (response.isActivated) {
        setLicenseKey(args.key);
        setInstanceId(response.instanceId ?? "");
        setIsLicenseKeyValid(response.isActivated);
      }
    },
    onError: () => {
      toast.error("Failed to activate license key!");
    },
  });
}
