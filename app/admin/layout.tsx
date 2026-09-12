import { DeskShell } from "@/components/desk/desk-shell";
import { requireDashboardAccess } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDashboardAccess();
  const counselorName = user.fullName?.trim() || user.email;

  return (
    <div data-surface="desk" className="min-h-svh font-sans">
      <DeskShell counselorName={counselorName} role={user.role}>
        {children}
      </DeskShell>
    </div>
  );
}
