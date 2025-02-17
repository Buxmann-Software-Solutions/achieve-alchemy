import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePomodoro } from "@/contexts/PomodoroContext";

interface PomodoroPreferenceFormProps {
  className?: string;
  onRequestClose: () => void;
}

const pomodoroPreferenceFormSchema = z.object({
  focusDuration: z.number().min(1).max(60),
  shortBreakDuration: z.number().min(1).max(15),
  longBreakDuration: z.number().min(1).max(30),
  sessionsUntilLongBreak: z.number().min(1).max(10),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
});

type PomodoroPreferenceFormValues = z.infer<
  typeof pomodoroPreferenceFormSchema
>;

export function PomodoroPreferenceForm({
  className = "",
  onRequestClose,
}: PomodoroPreferenceFormProps) {
  const { settings, send } = usePomodoro();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PomodoroPreferenceFormValues>({
    resolver: zodResolver(pomodoroPreferenceFormSchema),
    defaultValues: {
      focusDuration: settings.focusDuration / (60 * 1000), // Convert ms to minutes
      shortBreakDuration: settings.shortBreakDuration / (60 * 1000), // Fixed typo in divisor
      longBreakDuration: settings.longBreakDuration / (60 * 1000),
      sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
    },
  });

  const onSubmit = (data: PomodoroPreferenceFormValues) => {
    send({
      type: "UPDATE_SETTINGS",
      settings: {
        focusDuration: data.focusDuration * 60 * 1000, // Convert minutes to ms
        shortBreakDuration: data.shortBreakDuration * 60 * 1000,
        longBreakDuration: data.longBreakDuration * 60 * 1000,
        sessionsUntilLongBreak: data.sessionsUntilLongBreak,
        autoStartBreaks: data.autoStartBreaks,
        autoStartPomodoros: data.autoStartPomodoros,
      },
    });
    onRequestClose();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("grid items-start gap-4", className)}
    >
      <div>
        <div>
          <div className="grid gap-2">
            <Label htmlFor="sessionsUntilLongBreak">
              Number of sessions before long break
            </Label>
            <Input
              type="number"
              placeholder="4"
              id="sessionsUntilLongBreak"
              {...register("sessionsUntilLongBreak", { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.sessionsUntilLongBreak?.message}
          </p>
        </div>
        <div>
          <div className="grid gap-2">
            <Label htmlFor="focusDuration">Focus duration in minutes</Label>
            <Input
              type="number"
              placeholder="25"
              id="focusDuration"
              {...register("focusDuration", { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.focusDuration?.message}
          </p>
        </div>
        <div>
          <div className="grid gap-2">
            <Label htmlFor="shortBreakDuration">
              Short break duration in minutes
            </Label>
            <Input
              type="number"
              placeholder="5"
              id="shortBreakDuration"
              {...register("shortBreakDuration", { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.shortBreakDuration?.message}
          </p>
        </div>
        <div>
          <div className="grid gap-2">
            <Label htmlFor="longBreakDuration">
              Long break duration in minutes
            </Label>
            <Input
              type="number"
              placeholder="15"
              id="longBreakDuration"
              {...register("longBreakDuration", { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs py-2 px-1 text-red-600">
            {errors.longBreakDuration?.message}
          </p>
        </div>
        <div className="grid gap-2 mt-4">
          <Label className="flex items-center gap-2">
            <Input
              type="checkbox"
              className="w-4 h-4"
              {...register("autoStartBreaks")}
            />
            Auto-start breaks
          </Label>
          <Label className="flex items-center gap-2">
            <Input
              type="checkbox"
              className="w-4 h-4"
              {...register("autoStartPomodoros")}
            />
            Auto-start focus sessions
          </Label>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !isDirty || Object.keys(errors).length > 0}
        className="mt-4"
      >
        Save changes
      </Button>
    </form>
  );
}
