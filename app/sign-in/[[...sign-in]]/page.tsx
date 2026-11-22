import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { authCardAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn
        appearance={authCardAppearance}
        fallbackRedirectUrl="/portal"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
