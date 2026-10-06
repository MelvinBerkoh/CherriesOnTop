import "server-only";
import { z } from "zod";

const ownerEmail = z
  .email()
  .parse(process.env.OWNER_EMAIL?.trim())
  .toLowerCase();

export function isOwner(email: string, emailVerified: boolean) {
  return (
    emailVerified === true &&
    email.trim().toLowerCase() === ownerEmail
  );
}