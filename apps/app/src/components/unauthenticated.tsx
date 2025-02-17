import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OtpDialog } from "@/components/dialogs/otp-dialog";
import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const Unauthenticated = () => {
  const [email, setEmail] = useState("");
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsOtpDialogOpen(true);
    setIsLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) toast.error(error.message);
      else toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return (
    <>
      <section>
        <div className="flex justify-center items-center h-screen bg-background">
          <div className="container relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
              <img
                src={
                  "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                alt="Authentication"
                className="absolute grayscale hidden md:block inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-70" />
              <div className="relative z-20 flex items-center text-lg font-medium">
                Achieve Alchemy
              </div>
              <div className="relative z-20 mt-auto">
                <blockquote className="space-y-2">
                  <p className="text-lg">Henry Ford</p>
                  <footer className="text-sm">
                    Whether you think you can, or you think you can't, you're
                    right.
                  </footer>
                </blockquote>
              </div>
            </div>
            <div className="lg:p-8">
              <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                <div className="flex flex-col space-y-2 text-center"></div>
                <div className="mx-auto my-auto flex h-full w-full max-w-md flex-col justify-center gap-4 p-6">
                  <div className="mb-6 flex flex-col items-center text-center">
                    <p className="mb-2 text-2xl font-bold">Welcome back</p>
                    <p className="text-muted-foreground">
                      Welcome back! Please enter your details.
                    </p>
                  </div>
                  <div className="w-full bg-background">
                    <div className="grid gap-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          required
                          type="email"
                          value={email}
                          placeholder="Enter your email"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        disabled={isLoading}
                        onClick={handleSignIn}
                        className="w-full"
                      >
                        {isLoading ? "Sending..." : "Send Verification Code"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="px-8 text-center text-sm text-[hsl(0,0%,45.1%)]">
                By clicking continue, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-4 hover:text-[hsl(0,0%,9%)]"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-[hsl(0,0%,9%)]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      <OtpDialog
        email={email}
        isOpen={isOtpDialogOpen}
        onClose={() => setIsOtpDialogOpen(false)}
      />
    </>
  );
};
