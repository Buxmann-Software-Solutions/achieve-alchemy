import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedButtonProps {
  isDisabled?: boolean;
  isCompletedState: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function AnimatedButton({
  isDisabled,
  isCompletedState,
  onClick,
  children,
}: AnimatedButtonProps) {
  return (
    <Button
      disabled={isDisabled}
      variant="outline"
      size="icon"
      className="relative"
      onClick={() => {
        onClick();
      }}
    >
      {children}
      <AnimatePresence>
        {isCompletedState && (
          <motion.span
            className="absolute inset-0 rounded-md bg-primary z-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          ></motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
