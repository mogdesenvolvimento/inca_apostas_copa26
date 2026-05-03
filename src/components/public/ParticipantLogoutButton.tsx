"use client";

import { useRouter } from "next/navigation";
import { publicCopy } from "@/lib/copy";

type ParticipantLogoutButtonProps = {
  className?: string;
};

export function ParticipantLogoutButton({ className = "" }: ParticipantLogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    if (!window.confirm(publicCopy.bets.logoutConfirm)) {
      return;
    }

    await fetch("/api/participant/logout", {
      method: "POST"
    });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`rounded-full border border-teal/20 bg-white/80 px-4 py-2 text-sm font-semibold text-teal transition hover:bg-teal/5 ${className}`}
    >
      {publicCopy.bets.logout}
    </button>
  );
}
