import { UserButton } from "@clerk/nextjs";

export function MobileHeader() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
      <span className="text-lg font-bold tracking-tight">Ceklis</span>
      <UserButton />
    </header>
  );
}
