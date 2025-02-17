import { taurpc } from "@/lib/taurpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGenerateCheckoutSession() {
  return useMutation({
    mutationFn: async () => await taurpc.generate_checkout_session(),
    onError: () => {
      toast.error("Failed to activate license key!");
    },
  });
}
