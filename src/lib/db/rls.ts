import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

/**
 * Resolves the current Clerk user id or redirects to sign-in. This is the
 * actual security boundary for every query: server actions must pass the
 * returned id into every `.where(eq(table.userId, ...))` clause. It is the
 * resource-level check Clerk recommends over relying solely on middleware
 * path matching, so it must be called from every page/action that reads
 * or writes user data -- not just from behind the proxy.ts matcher.
 *
 * RLS policies exist on every table as defense-in-depth, but the pooled
 * Postgres connection (`postgres.<ref>`) is a privileged role that
 * bypasses RLS, so they are not the enforcement path today — the
 * explicit filter is.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}
