import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[36rem] items-center justify-center p-6">
      <SignUp fallbackRedirectUrl="/portal" signInUrl="/sign-in" />
    </div>
  );
}
