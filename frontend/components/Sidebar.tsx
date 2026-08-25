"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Kanban,
  Users2,
  ShieldCheck,
  Bot,
  BarChart3,
  FileText,
  UserCircle,
  Link2,
  Settings,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Job Discovery", href: "/jobs", icon: Search, badge: "100+", badgeColor: "bg-indigo-100 text-indigo-700" },
  { name: "Applications Tracker", href: "/applications", icon: Kanban },
  { name: "Recruiter CRM", href: "/recruiters", icon: Users2 },
  { name: "Approval Center", href: "/approval-center", icon: ShieldCheck, badge: "Review", badgeColor: "bg-amber-100 text-amber-700" },
  { name: "AI Career Assistant", href: "/assistant", icon: Bot, badge: "AI", badgeColor: "bg-purple-100 text-purple-700" },
  { name: "Analytics & Trends", href: "/analytics", icon: BarChart3 },
  { name: "Daily Reports", href: "/reports", icon: FileText },
  { name: "Profile & Resume", href: "/profile", icon: UserCircle },
  { name: "Connected Accounts", href: "/integrations", icon: Link2 },
  { name: "Automation Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-gray-100 bg-white min-h-[calc(100vh-4rem)] p-3 justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Career Hub
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    item.badgeColor || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Safety Card */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 rounded-2xl border border-indigo-100/80 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold mb-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Compliant & Safe</span>
        </div>
        <p className="text-gray-600 text-[11px] leading-relaxed">
          Zero password storage, duplicate prevention active, and strict 5 email/run safety limits.
        </p>
      </div>
    </aside>
  );
};
