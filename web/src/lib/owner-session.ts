import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/owner-access";

export async function getOwnerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    !isOwner(session.user.email, session.user.emailVerified)
  ) {
    return null;
  }

  return session;
}

export async function requireOwner() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/owner/login");
  }

  return session;
}