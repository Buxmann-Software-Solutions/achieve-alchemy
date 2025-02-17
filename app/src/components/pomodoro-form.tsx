import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePomodoro } from "@/contexts/PomodoroContext";

const pomodoroPreferenceFormSchema = z.object({
  focusDuration: z.number().min(1, {
    message: "Focus duration must be at least 1 minute.",
  }),
  shortBreakDuration: z.number().min(1, {
    message: "Short break duration must be at least 1 minute.",
  }),
  longBreakDuration: z.number().min(1, {
    message: "Long break duration must be at least 1 minute.",
  }),
  sessionsUntilLongBreak: z.number().min(1, {
    message: "Sessions before long break must be at least 1.",
  }),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
});

export type PomodoroPreferenceFormValues = z.infer<
  typeof pomodoroPreferenceFormSchema
>;

interface PomodoroPreferenceFormProps {
  className?: string;
  onRequestClose: () => void;
}

export function PomodoroPreferenceForm({
  className = "",
  onRequestClose,
}: PomodoroPreferenceFormProps) {
  const { state, dispatch } = usePomodoro();
  const { settings } = state;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PomodoroPreferenceFormValues>({
    resolver: zodResolver(pomodoroPreferenceFormSchema),
    defaultValues: {
      focusDuration: settings.focusDuration / (60 * 1000), // Convert ms to minutes
      shortBreakDuration: settings.shortBreakDuration / (60 * 1000),
      longBreakDuration: settings.longBreakDuration / (60 * 1000),
      sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
    },
  });

  const onSubmit = (data: PomodoroPreferenceFormValues) => {
    dispatch({
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
