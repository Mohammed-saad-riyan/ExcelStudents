"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Users,
  UserCheck,
  Clock,
  BookOpen,
  FileText,
  MessageSquare,
  Calendar,
  AlertCircle,
  StickyNote,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface AdminStats {
  counts: { total: number; pending: number; approved: number };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetch("/api/admin/students?filter=all")
        .then((res) => res.json())
        .then((data) => {
          setStats({ counts: data.counts });
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  if ((session?.user as { role?: string })?.role !== "admin") return null;

  const quickActions = [
    {
      href: "/admin/students",
      icon: Users,
      label: "Manage Students",
      desc: "Approve, reject & manage student accounts",
      color: "bg-blue-50 text-[#075aae]",
      badge: stats?.counts.pending ? `${stats.counts.pending} pending` : null,
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      href: "/admin/exams",
      icon: BookOpen,
      label: "Exams",
      desc: "Create MCQ quizzes & final exams",
      color: "bg-purple-50 text-purple-600",
      badge: null,
      badgeColor: "",
    },
    {
      href: "/admin/assignments",
      icon: FileText,
      label: "Assignments",
      desc: "View & evaluate student submissions",
      color: "bg-teal-50 text-teal-600",
      badge: null,
      badgeColor: "",
    },
    {
      href: "/admin/notes",
      icon: StickyNote,
      label: "Class Notes",
      desc: "Create & manage class notes",
      color: "bg-amber-50 text-amber-600",
      badge: null,
      badgeColor: "",
    },
    {
      href: "/feedback",
      icon: MessageSquare,
      label: "Feedback",
      desc: "Read student feedback",
      color: "bg-orange-50 text-orange-600",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#075aae] to-[#0ea5e9] rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage students, exams, and content</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg w-fit">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        </div>

          {/* Pending Alert */}
          {stats && stats.counts.pending > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Link
                href="/admin/students"
                className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 hover:bg-amber-100 transition-all group"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Pending Approvals</p>
                  <p className="text-xs text-amber-700">
                    {stats.counts.pending} student registration{stats.counts.pending > 1 ? "s" : ""} waiting for review
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-6">
          {[
            {
              label: "Total Students",
              value: stats?.counts.total || 0,
              icon: Users,
              color: "text-[#075aae]",
              bgColor: "bg-blue-50",
              change: "+12%",
              trend: "up"
            },
            {
              label: "Pending Approval",
              value: stats?.counts.pending || 0,
              icon: Clock,
              color: "text-amber-600",
              bgColor: "bg-amber-50",
              change: stats?.counts.pending ? `${stats.counts.pending} pending` : "None",
              trend: "neutral"
            },
            {
              label: "Active Students",
              value: stats?.counts.approved || 0,
              icon: UserCheck,
              color: "text-emerald-600",
              bgColor: "bg-emerald-50",
              change: "+8%",
              trend: "up"
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-white border border-gray-100 rounded-xl p-4 lg:p-5"
            >
              <div className="flex items-start justify-between mb-3 lg:mb-4">
                <div className={`w-10 h-10 lg:w-11 lg:h-11 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
                {stat.trend === "up" && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-semibold">{stat.change}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
          </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className="bg-white border border-gray-100 rounded-xl p-4 lg:p-5 block group hover:shadow-lg transition-all relative overflow-hidden"
                >
                  {action.badge && (
                    <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${action.badgeColor}`}>
                        {action.badge}
                      </span>
                    </div>
                  )}
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1 group-hover:text-[#075aae] transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 lg:mb-3">{action.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[#075aae] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
