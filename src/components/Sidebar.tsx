"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart3,
  MessageSquare,
  StickyNote,
  FolderOpen,
  Shield,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/notes", label: "Class Notes", icon: StickyNote },
  { href: "/materials", label: "Materials", icon: FolderOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: User },
  { href: "/admin/exams", label: "Exams", icon: BookOpen },
  { href: "/admin/assignments", label: "Assignments", icon: FileText },
  { href: "/admin/notes", label: "Class Notes", icon: StickyNote },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const userRole = (session.user as { role?: string })?.role;
  const isAdmin = userRole === "admin";
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white sidebar-depth z-40 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Excel Academy"
            width={140}
            height={40}
            className="object-contain"
          />
        </Link>
      </div>

      {/* User info section */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#075aae] to-[#0ea5e9] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {session.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {isAdmin ? "Administrator" : "Student"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== "/admin" && link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-[#075aae]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#075aae] rounded-r-full" />
                )}

                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                <span>{link.label}</span>

                {/* Hover arrow */}
                <ChevronRight
                  className={`ml-auto w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200 ${
                    !isActive && "group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        {isAdmin && (
          <div className="mb-2 px-3 py-2 bg-gradient-to-r from-[#075aae]/5 to-[#0ea5e9]/5 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-xs">
              <Shield className="w-3.5 h-3.5 text-[#075aae]" />
              <span className="text-[#075aae] font-medium">Admin Access</span>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
