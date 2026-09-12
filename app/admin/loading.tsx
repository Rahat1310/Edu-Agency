import { DeskTableSkeleton } from "@/components/desk/skeleton";

export default function AdminLoading() {
  return (
    <div>
      <DeskTableSkeleton columns={5} rows={6} />
    </div>
  );
}
