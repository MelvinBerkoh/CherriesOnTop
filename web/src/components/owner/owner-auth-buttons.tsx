"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function OwnerAuthButton({
  action,
}: {
  action: "sign-in" | "sign-out";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setPending(true);
    setError("");

    try {
      const result =
        action === "sign-in"
          ? await authClient.signIn.social({
              provider: "google",
              callbackURL: "/owner",
              errorCallbackURL: "/owner/login?error=sign-in",
            })
          : await authClient.signOut();

      if (result.error) {
        throw new Error("Authentication failed");
      }

      if (action === "sign-out") {
        router.replace("/owner/login");
        router.refresh();
      }
    } catch {
      setError(
        action === "sign-in"
          ? "Could not start sign-in. Please try again."
          : "Could not sign out. Please try again.",
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className="button"
        type="button"
        disabled={pending}
        onClick={handleClick}
      >
        {pending
          ? "Please wait…"
          : action === "sign-in"
            ? "Continue with Google"
            : "Sign out"}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}