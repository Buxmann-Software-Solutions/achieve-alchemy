import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUpdateHabit } from "@/hooks/habit/use-update-habit";
import { HabitForm, HabitFormValues } from "@/components/habit/habit-form";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Pencil } from "lucide-react";
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
import { routerInput } from "@/lib/trpc";

interface EditHabitButtonProps {
  habit: routerInput["habit"]["update"];
}

export function EditHabitButton({ habit }: EditHabitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { mutateAsync: updateHabit } = useUpdateHabit();
  const onEditHabit = async (values: HabitFormValues) => {
    const { title, description, icon } = values;

    try {
      await updateHabit({
        id: habit.id,
        title,
        description,
        icon,
        isArchived: undefined,
      });

      toast.success("Habit succesfully updated!", {
        icon: <CheckCircle size={16} />,
      });

      setIsOpen(false);
    } catch (error) {
      toast.warning("Something went wrong, please try again.", {
        icon: <AlertTriangle size={16} />,
        className: "!text-red-600",
      });
    }
  };

  if (isDesktop) {
    return (
      <Sheet open={isOpen}>
        <SheetTrigger asChild className="outline-none">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Pencil size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="!min-w-[600px] space-y-4"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SheetHeader>
            <SheetTitle>Edit habit</SheetTitle>
            <SheetDescription>
              Make changes to your habit here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <HabitForm
            habit={habit}
            onSubmit={onEditHabit}
            onRequestClose={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil size={16} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit habit</DrawerTitle>
          <DrawerDescription>
            Make changes to your habit here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <HabitForm
          habit={habit}
          onSubmit={onEditHabit}
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
