import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button, buttonVariants } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { SlidersHorizontal } from "lucide-react";
import { PomodoroPreferenceForm } from "@/components/pomodoro-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePomodoro } from "@/contexts/PomodoroContext";

export function EditPomodoroPreferencesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { state } = usePomodoro();
  const isIdle = state.matches("idle");
  const isRunning = !isIdle;

  if (isRunning) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <div
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                {
                  "!text-muted-foreground": isRunning,
                }
              )}
            >
              <SlidersHorizontal />
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="bg-background border-[1px] border-foreground text-foreground"
            align="center"
            side="bottom"
          >
            Abandon the current cycle to edit preferences.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isDesktop) {
    return (
      <Sheet open={isOpen}>
        <SheetTrigger asChild className="outline-none">
          <Button
            disabled={isRunning}
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
          >
            <SlidersHorizontal />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="!min-w-[600px] space-y-4"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SheetHeader>
            <SheetTitle>Edit preferences</SheetTitle>
            <SheetDescription>
              Make changes to your pomodoro preferences here. Click save when
              you're done.
            </SheetDescription>
          </SheetHeader>
          <PomodoroPreferenceForm onRequestClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          disabled={isRunning}
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit preferences</DrawerTitle>
          <DrawerDescription>
            Make changes to your pomodoro preferences here. Click save when
            you're done.
          </DrawerDescription>
        </DrawerHeader>
        <PomodoroPreferenceForm onRequestClose={() => setIsOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
