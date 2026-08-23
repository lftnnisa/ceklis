import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-5xl font-black tracking-tight text-primary">
        Ceklis
      </span>
      <p className="max-w-sm text-lg text-muted-foreground">
        Todo, habit tracker, planner, dan journal — satu tempat, satu swipe.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/sign-up">Mulai gratis</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/sign-in">Sudah punya akun</Link>
        </Button>
      </div>
    </div>
  );
}
