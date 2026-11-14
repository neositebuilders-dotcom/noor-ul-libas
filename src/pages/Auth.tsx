import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/account",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect, { replace: true });
    } catch {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect, { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not continue as a guest.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-espresso lg:block">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-espresso/10" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link
            to="/"
            className="font-display text-xl tracking-[0.2em] text-ivory"
          >
            NOOR UL LIBAS
          </Link>
          <div className="max-w-sm text-ivory">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
              Welcome back
            </p>
            <p className="mt-4 font-display text-4xl leading-tight">
              Your orders, saved pieces and details — all in one place.
            </p>
            <div className="mt-8 space-y-3 text-xs text-ivory/70">
              <p className="flex items-center gap-2.5">
                <ShoppingBag className="size-3.5 text-gold" /> Faster checkout next time
              </p>
              <p className="flex items-center gap-2.5">
                <Truck className="size-3.5 text-gold" /> Track every order
              </p>
              <p className="flex items-center gap-2.5">
                <ShieldCheck className="size-3.5 text-gold" /> Your details stay private
              </p>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-ivory/40">
            Pakistani womenswear · Lahore
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="border-b border-border/70 px-6 py-5 lg:hidden">
          <Link to="/" className="font-display text-lg tracking-[0.18em]">
            NOOR UL LIBAS
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm">
            <p className="eyebrow">{step === "signIn" ? "Sign in" : "Verify"}</p>
            <h1 className="mt-3 text-4xl leading-tight">
              {step === "signIn" ? "Your account" : "Check your email"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step === "signIn"
                ? "Enter your email and we will send a six-digit code. No password to remember."
                : `We have sent a code to ${step.email}. It expires in 15 minutes.`}
            </p>

            {step === "signIn" ? (
              <>
                <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      name="email"
                      placeholder="you@example.com"
                      type="email"
                      className="h-11 rounded-sm pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full gap-2 rounded-sm text-[10px] font-semibold uppercase tracking-[0.18em]"
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    Send sign-in code
                  </Button>
                </form>

                {error && (
                  <p className="mt-3 border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                    {error}
                  </p>
                )}

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    or
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-sm text-[10px] font-semibold uppercase tracking-[0.16em]"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  Continue as guest
                </Button>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                  Guests can order and track with an order number. Signing in with email
                  keeps your order history on this account.
                </p>

                <div className="mt-6 flex flex-col gap-2 border-t border-border/70 pt-5 text-[11px]">
                  <Link to="/" className="text-muted-foreground hover:text-gold">
                    ← Back to the store
                  </Link>
                  <Link to="/track-order" className="text-muted-foreground hover:text-gold">
                    Track an order without signing in
                  </Link>
                </div>
              </>
            ) : (
              <form onSubmit={handleOtpSubmit} className="mt-6">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (event.target as HTMLElement).closest("form");
                        form?.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <p className="mt-3 text-center text-xs text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  className="mt-5 h-11 w-full gap-2 rounded-sm text-[10px] font-semibold uppercase tracking-[0.18em]"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Verify & continue
                </Button>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-gold"
                    onClick={() => setStep("signIn")}
                  >
                    ← Use a different email
                  </button>
                  <span className="text-muted-foreground">
                    Didn't receive it? Check spam.
                  </span>
                </div>
              </form>
            )}

            <p className="mt-8 border-t border-border/70 pt-4 text-[10px] leading-5 text-muted-foreground">
              By continuing you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-2">
                terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-2">
                privacy policy
              </Link>
              . Store owners: sign in with the business email to reach the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
