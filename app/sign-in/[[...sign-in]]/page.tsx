import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[36rem] items-center justify-center p-6">
      <SignIn fallbackRedirectUrl="/portal" signUpUrl="/sign-up" />
    </div>
  );
}
