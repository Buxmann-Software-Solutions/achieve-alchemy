import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

interface OtpDialogProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OtpDialog({ email, isOpen, onClose }: OtpDialogProps) {
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (error) {
        toast.error(error.message);
      }

      onClose();
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Verification Code</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the 6-digit verification code sent to your email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-center my-10">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot className="w-10 h-10" index={0} />
              <InputOTPSlot className="w-10 h-10" index={1} />
              <InputOTPSlot className="w-10 h-10" index={2} />
              <InputOTPSlot className="w-10 h-10" index={3} />
              <InputOTPSlot className="w-10 h-10" index={4} />
              <InputOTPSlot className="w-10 h-10" index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <AlertDialogFooter className="flex justify-between">
          <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
          <AlertDialogAction className="w-full" onClick={handleVerify}>
            Verify
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
