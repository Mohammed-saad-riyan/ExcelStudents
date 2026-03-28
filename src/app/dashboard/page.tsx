"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  BarChart3,
  MessageSquare,
  Clock,
  Award,
  ArrowRight,
  Target,
  Sparkles,
} from "lucide-react";

interface ProgressData {
  attendance: { attended: number; total: number };
  exams: { totalAttempts: number; passed: number };
  assignments: { submitted: number; total: number };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role === "admin") {
      router.push("/admin");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/progress")
        .then((res) => res.json())
        .then(setProgress)
        .catch(console.error);
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const quickLinks = [
    {
      href: "/exams",
      icon: BookOpen,
      label: "Exams",
      desc: "Take your online exams",
      color: "bg-blue-50 text-[#075aae]",
      count: 3
    },
    {
      href: "/assignments",
      icon: FileText,
      label: "Assignments",
      desc: "View and submit work",
      color: "bg-violet-50 text-violet-600",
      count: progress?.assignments ? progress.assignments.total - progress.assignments.submitted : 0
    },
    {
      href: "/progress",
      icon: BarChart3,
      label: "Progress",
      desc: "Track your performance",
      color: "bg-emerald-50 text-emerald-600",
      count: null
    },
    {
      href: "/feedback",
      icon: MessageSquare,
      label: "Feedback",
      desc: "Share your thoughts",
      color: "bg-amber-50 text-amber-600",
      count: null
    },
  ];

  const attendancePercent = progress
    ? progress.attendance.total > 0
      ? Math.round((progress.attendance.attended / progress.attendance.total) * 100)
      : 0
    : 0;

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Welcome back, {session.user?.name?.split(" ")[0]}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg w-fit">
              <span className="status-dot status-success" />
              <span className="text-xs font-medium text-gray-700">Active</span>
            </div>
          </motion.div>
        </div>

        {/* Stats Overview */}
        {progress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-6">
            {[
              {
                label: "Attendance",
                value: `${attendancePercent}%`,
                subtitle: `${progress.attendance.attended}/${progress.attendance.total} classes`,
                icon: Clock,
                color: "text-[#075aae]",
                bgColor: "bg-blue-50",
                trend: attendancePercent >= 75 ? "good" : "warning",
              },
              {
                label: "Exams Passed",
                value: progress.exams.passed,
                subtitle: `${progress.exams.totalAttempts} attempted`,
                icon: Award,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
                trend: "good",
              },
              {
                label: "Assignments",
                value: `${progress.assignments.submitted}/${progress.assignments.total}`,
                subtitle: progress.assignments.submitted === progress.assignments.total ? "All completed" : `${progress.assignments.total - progress.assignments.submitted} pending`,
                icon: FileText,
                color: "text-violet-600",
                bgColor: "bg-violet-50",
                trend: progress.assignments.submitted === progress.assignments.total ? "good" : "warning",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white border border-gray-100 rounded-xl p-4 lg:p-5"
              >
                <div className="flex items-start justify-between mb-3 lg:mb-4">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    stat.trend === "good"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {stat.trend === "good" ? "On track" : "Needs attention"}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {quickLinks.map((link, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="bg-white border border-gray-100 rounded-xl p-4 lg:p-5 block group relative overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  {link.count !== null && link.count > 0 && (
                    <div className="absolute top-2 right-2 lg:top-3 lg:right-3 w-5 h-5 bg-[#075aae] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {link.count}
                    </div>
                  )}
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 ${link.color} rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-0.5 lg:mb-1 group-hover:text-[#075aae] transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 lg:mb-3 line-clamp-1">{link.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[#075aae] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5"
        >
          {/* Tips Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#075aae] to-[#0ea5e9] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Study Tips</h3>
            </div>
            <div className="space-y-3">
              {[
                "Review lesson plans before class sessions",
                "Practice teaching methodologies regularly",
                "Complete assignments before deadlines",
                "Engage with course materials daily",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-50 transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#075aae]">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Your Goals</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Course Completion</span>
                  <span className="text-xs font-bold text-gray-900">65%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#075aae] to-[#0ea5e9] rounded-full transition-all duration-500" style={{ width: "65%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Assignment Completion</span>
                  <span className="text-xs font-bold text-gray-900">
                    {progress ? Math.round((progress.assignments.submitted / progress.assignments.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: progress ? `${(progress.assignments.submitted / progress.assignments.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Keep up the great work! You're making steady progress toward your certification.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
