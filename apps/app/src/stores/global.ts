import { atomWithStorage } from "jotai/utils";
import { Theme } from "@/providers/theme-provider";

export const themeAtom = atomWithStorage<Theme>("theme", "light");
export const licenseKeyAtom = atomWithStorage<string | undefined>("licenseKey", undefined);
export const instanceIdAtom = atomWithStorage<string | undefined>("instanceId", undefined);
export const isLicenseKeyValidAtom = atomWithStorage<boolean>(
    "isLicenseKeyValid",
    false
);
