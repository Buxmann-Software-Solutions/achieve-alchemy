import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { icons } from "lucide-react";
// import { RouterOutputs } from "~/lib/trpc";

const habitFormSchema = z.object({
  title: z.string().min(4, {
    message: "Title must be at least 4 characters.",
  }),
  description: z.string().min(4, {
    message: "Description must be at least 4 characters.",
  }),
  icon: z.string(),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;
// type Habit = RouterOutputs["habit"]["listActive"][0];

interface HabitFormProps {
  className?: string;
  habit?: any;
  onRequestClose: () => void;
  onSubmit: (values: HabitFormValues) => void;
}

export function HabitForm({ habit, className = "", onSubmit }: HabitFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: habit?.title,
      description: habit?.description,
      icon: habit?.icon,
    },
  });

  const icons = getAllLucideIcons();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("grid items-start gap-4", className)}
    >
      <div>
        <div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.title?.message}
          </p>
        </div>
        <div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrition</Label>
            <Input id="description" {...register("description")} />
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.description?.message}
          </p>
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex h-[400px] flex-wrap gap-3 w-full overflow-y-scroll">
            {icons.map((Icon) => {
              return (
                <Icon
                  className={cn(
                    "border-[1px] border-transparent hover:border-foreground rounded-md cursor-pointer w-[35px] h-[35px] p-[7px]",
                    {
                      "border-foreground":
                        Icon.displayName === getValues("icon"),
                    }
                  )}
                  onClick={() =>
                    setValue("icon", Icon.displayName, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              );
            })}
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.icon?.message}
          </p>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !isDirty || Object.keys(errors).length > 0}
        className="mt-10"
      >
        Save changes
      </Button>
    </form>
  );
}

function getAllLucideIcons() {
  const allIconKeys = Object.keys(icons);

  const allIcons = allIconKeys.map((iconKey) => {
    // @ts-ignore
    const icon = icons[iconKey];
    return icon;
  });

  return allIcons;
}
