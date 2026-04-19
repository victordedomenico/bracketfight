"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CirclePlus,
  House,
  Library,
  Play,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

type IconName = "home" | "search" | "create" | "library" | "battle" | "guide" | "settings";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

type SidebarNavLinksProps = {
  links: readonly NavItem[];
};

const iconMap: Record<IconName, LucideIcon> = {
  home: House,
  search: Search,
  create: CirclePlus,
  library: Library,
  battle: Play,
  guide: BookOpen,
  settings: Settings,
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNavLinks({ links }: SidebarNavLinksProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1.5">
      {links.map(({ href, label, icon }) => {
        const Icon = iconMap[icon];
        const active = isActivePath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[1.02rem] transition"
            style={{
              color: active ? "#09090b" : "#8f93a0",
              background: active ? "#f3f4f6" : "transparent",
              border: active ? "1px solid rgba(255,255,255,0.9)" : "1px solid transparent",
            }}
          >
            <Icon size={18} strokeWidth={1.9} />
            <span className={active ? "font-semibold" : "font-medium"}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

