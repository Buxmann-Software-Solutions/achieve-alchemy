import { atomWithStorage } from "jotai/utils";
import { Theme } from "@/providers/theme-provider";

export const themeAtom = atomWithStorage<Theme>("theme", "light");
