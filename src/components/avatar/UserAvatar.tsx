"use client";

import { useMemo } from "react";
import Image from "next/image";
import { generateAvatarUri } from "@/lib/avatar";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { px: number; class: string }> = {
  sm: { px: 32, class: "w-8 h-8" },
  md: { px: 48, class: "w-12 h-12" },
  lg: { px: 80, class: "w-20 h-20" },
  xl: { px: 120, class: "w-30 h-30" },
};

interface UserAvatarProps {
  seed: string;
  role?: Role;
  size?: Size;
  alt?: string;
  className?: string;
}

export function UserAvatar({
  seed,
  role = "EXPEDITEUR",
  size = "md",
  alt = "Avatar",
  className = "",
}: UserAvatarProps) {
  const uri = useMemo(() => generateAvatarUri(seed, role), [seed, role]);
  const { px, class: cls } = sizeMap[size];

  return (
    <div className={`relative rounded-full overflow-hidden ring-2 ring-primary/20 ${cls} ${className}`}>
      <Image
        src={uri}
        alt={alt}
        width={px}
        height={px}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>
  );
}
