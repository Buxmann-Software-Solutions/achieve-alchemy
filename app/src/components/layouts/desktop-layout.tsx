import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Timer, Bird, ArrowRight, Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai/react";
import { useAtomValue } from "jotai/react";
import { themeAtom } from "@/stores/global";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

enum NavItemType {
  HABITS = "/",
  POMODORO = "pomodoro",
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  return (
    <div className="flex divide-x-[0.5px] w-screen divide-foreground/15 h-screen overflow-hidden">
      <SideBar />
      <div className="w-screen overflow-hidden h-screen">{children}</div>
    </div>
  );
};

const SideBar = () => {
  const theme = useAtomValue(themeAtom);
  const setTheme = useSetAtom(themeAtom);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<NavItemType>(
    NavItemType.HABITS
  );

  const navItems = [
    {
      id: NavItemType.HABITS,
      label: "Habits",
      icon: Bird,
    },
    {
      id: NavItemType.POMODORO,
      label: "Pomodoro",
      icon: Timer,
    },
  ];

  return (
    <div
      className={cn(
        "p-4 flex flex-col handle gap-y-[10px] justify-between w-full max-w-[250px] animate-in ease-in-out duration-200 h-screen",
        {
          "max-w-[80px]": !isExpanded,
        }
      )}
    >
      <div className="flex flex-grow flex-col space-y-[10px]">
        <Logo isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        {navItems.map(({ id, label, icon: Icon }) => (
          <NavItem
            key={id}
            href={`/${id}`}
            selected={selectedMenu === id}
            handleSelect={() => setSelectedMenu(id)}
          >
            <div className="flex space-x-3 items-center">
              <Icon size={24} className="min-w-[24px]" strokeWidth={1.5} />
              {isExpanded && (
                <motion.div
                  className="text-sm font-semibold"
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ scale: 0 }}
                >
                  {label}
                </motion.div>
              )}
            </div>
          </NavItem>
        ))}
      </div>
      <div
        className={cn({
          "flex justify-between": isExpanded,
          "flex flex-col items-center": !isExpanded,
        })}
      >
        <div className="flex items-center min-w-[24px] p-2">
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  selected: boolean;
  handleSelect: () => void;
}

const NavItem = ({ href, children, selected, handleSelect }: NavItemProps) => {
  return (
    <Link to={href}>
      <motion.div
        className={cn(
          "p-3 text-xl min-w-[48px] min-h-[48px] w-full bg-background hover:bg-background rounded-md transition-colors relative",
          {
            "text-background": selected,
          }
        )}
        onClick={handleSelect}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="block relative z-10">{children}</span>
        <AnimatePresence>
          {selected && (
            <motion.span
              className="absolute inset-0 rounded-md bg-primary z-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            ></motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

interface LogoProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const Logo = ({ isExpanded, setIsExpanded }: LogoProps) => {
  return (
    <motion.button
      className="p-3 w-fit hover:bg-primary-foreground rounded-md transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowRight
        size={20}
        className={cn("transform animate-in ease-in-out duration-300", {
          "rotate-180": isExpanded,
        })}
      />
    </motion.button>
  );
};
