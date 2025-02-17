import { LucideProps } from "lucide-react";
import { icons } from "lucide-react";

interface IconProps extends Omit<LucideProps, "ref"> {
  name: keyof typeof icons;
}

export function LucideIcon({ name, ...props }: IconProps) {
  const Icon = icons[name];

  return <Icon {...props} />;
}
