import { Sidebar } from "@orion-ds/react";
import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarItems = [
    {
      id: "home",
      label: "Home",
      href: "/home",
      icon: "🏠",
    },
    {
      id: "expenses",
      label: "Expenses",
      href: "/expenses",
      icon: "💸",
    },
    {
      id: "cycle",
      label: "Cycle",
      href: "/cycle",
      icon: "📅",
    },
    {
      id: "notifications",
      label: "Notifications",
      href: "/notifications",
      icon: "🔔",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "⚙️",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Pawo</h1>
          <p className="text-sm text-gray-600">Shared expenses</p>
        </div>
        <nav className="space-y-2 px-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
