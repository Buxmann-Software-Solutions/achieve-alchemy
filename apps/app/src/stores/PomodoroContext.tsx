import React, { useCallback } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";
import { toast } from "react-hot-toast";

const PomodoroContext: React.FC = () => {
  const { send } = usePomodoro();

  const stopTimer = useCallback(() => {
    send({ type: "STOP" });
    toast.success("Session abandoned");
  }, [send]);

  return <div>{/* Rest of the component code */}</div>;
};

export default PomodoroContext;
