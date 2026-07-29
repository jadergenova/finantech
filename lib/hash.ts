import { createHash } from "crypto";

export function hashChave(...partes: (string | number)[]): string {
  return createHash("sha256").update(partes.join("|")).digest("hex");
}
