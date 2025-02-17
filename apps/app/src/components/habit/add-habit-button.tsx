import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { HabitForm, HabitFormValues } from "@/components/habit/habit-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useCreateHabit } from "@/hooks/habit/use-add-habit";

export function AddHabitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { mutateAsync: updateHabit } = useCreateHabit();
  const onCreateHabit = async (values: HabitFormValues) => {
    const { title, description, icon } = values;
    console.log("values", values);
    await updateHabit({
      title,
      description,
      icon,
    });

    setIsOpen(false);
  };

  if (isDesktop) {
    return (
      <Sheet open={isOpen}>
        <SheetTrigger asChild className="outline-none">
          <Button onClick={() => setIsOpen(true)}>Add Habit</Button>
        </SheetTrigger>
        <SheetContent
          className="!min-w-[600px] space-y-4"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SheetHeader>
            <SheetTitle>Add habit</SheetTitle>
            <SheetDescription>
              Add information about your habit here. Click save when you're
              done.
            </SheetDescription>
          </SheetHeader>
          <HabitForm
            onSubmit={onCreateHabit}
            onRequestClose={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button>Add Habit</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add habit</DrawerTitle>
          <DrawerDescription>
            Add information about your habit here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <HabitForm
          onSubmit={onCreateHabit}
          onRequestClose={() => setIsOpen(false)}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
