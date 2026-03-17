"use client";

import { UserMenu } from "@orion-ds/react/client";
import Link from "next/link";
import { logoutAction } from "./logout/actions";
import { toggleThemeAction } from "./actions";
import { LogoPawo } from "@/app/components/LogoPawo";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    initials: string;
    avatar?: string;
  };
  theme: "light" | "dark";
}

export function AppHeader({ user, theme }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-b-[var(--border-subtle)] bg-surface shadow-sm flex items-center justify-between px-8">
      <Link href="/spaces">
        <LogoPawo height={32} width={120} />
      </Link>
      <UserMenu
        user={user}
        sections={[
          {
            id: "account",
            items: [
              {
                id: "profile",
                label: "Edit Profile",
                href: "/settings/profile",
              },
              {
                id: "theme",
                label: theme === "dark" ? "Light Mode" : "Dark Mode",
                onClick: async () => {
                  const next =
                    document.documentElement.getAttribute("data-theme") === "dark"
                      ? "light"
                      : "dark";
                  document.documentElement.setAttribute("data-theme", next);
                  await toggleThemeAction();
                },
              },
            ],
          },
          {
            id: "auth",
            items: [
              {
                id: "logout",
                label: "Sign out",
                danger: true,
                onClick: () => logoutAction(),
              },
            ],
          },
        ]}
        placement="bottom"
      />
    </header>
  );
}
