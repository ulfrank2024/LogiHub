import { createAvatar } from "@dicebear/core";
import { lorelei, adventurer, personas, notionists } from "@dicebear/collection";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";

const bgByRole: Record<Role, string[]> = {
  EXPEDITEUR: ["D4A017", "E07B39", "C1440E"],
  TRANSPORTEUR: ["1B4332", "52B788", "0E4D3A"],
  RESPONSABLE_ENTREPOT: ["1A3A5C", "2E86AB", "0D1B2A"],
  ADMIN: ["4A0E8F", "7B2FBE", "C1440E"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSchema(role: Role): any {
  switch (role) {
    case "EXPEDITEUR": return lorelei;
    case "TRANSPORTEUR": return adventurer;
    case "RESPONSABLE_ENTREPOT": return personas;
    case "ADMIN": return notionists;
  }
}

export function generateAvatarUri(seed: string, role: Role = "EXPEDITEUR"): string {
  const avatar = createAvatar(getSchema(role), {
    seed,
    backgroundColor: bgByRole[role],
    radius: 50,
    size: 80,
  });
  return avatar.toDataUri();
}

export function generateAvatarSvg(seed: string, role: Role = "EXPEDITEUR"): string {
  const avatar = createAvatar(getSchema(role), {
    seed,
    backgroundColor: bgByRole[role],
    radius: 50,
    size: 80,
  });
  return avatar.toString();
}
