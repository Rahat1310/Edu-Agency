import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { authCardAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp
        appearance={authCardAppearance}
        fallbackRedirectUrl="/portal"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
