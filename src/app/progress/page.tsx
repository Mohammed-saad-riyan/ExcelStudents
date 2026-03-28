"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import {
  BarChart3,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";

interface ProgressData {
  attendance: {
    attended: number;
    total: number;
    records: { session: { title: string; date: string }; present: boolean }[];
  };
  exams: {
    attempts: {
      id: string;
      score: number;
      totalMarks: number;
      passed: boolean;
      startedAt: string;
      exam: { title: string; totalMarks: number };
    }[];
    totalAttempts: number;
    passed: number;
  };
  assignments: {
    submitted: number;
    total: number;
    submissions: {
      id: string;
      marks: number | null;
      status: string;
      submittedAt: string;
      assignment: { title: string; totalMarks: number; dueDate: string };
    }[];
  };
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "exams" | "assignments">("overview");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/progress")
        .then((res) => res.json())
        .then((data) => {
          setProgress(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  const attendancePercent = progress.attendance.total > 0
    ? Math.round((progress.attendance.attended / progress.attendance.total) * 100)
    : 0;

  const avgExamScore = progress.exams.attempts.length > 0
    ? Math.round(
        progress.exams.attempts.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) /
          progress.exams.attempts.length
      )
    : 0;

  const assignmentPercent = progress.assignments.total > 0
    ? Math.round((progress.assignments.submitted / progress.assignments.total) * 100)
    : 0;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "attendance" as const, label: "Attendance", icon: Calendar },
    { id: "exams" as const, label: "Exams", icon: BookOpen },
    { id: "assignments" as const, label: "Assignments", icon: FileText },
  ];

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-[#fafbfc]">
        <div className="px-8 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-display text-2xl text-gray-900 mb-1">My Progress</h1>
            <p className="text-sm text-gray-500">Track your learning journey and achievements</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#075aae] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Attendance</h3>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                      strokeDasharray={`${attendancePercent * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{attendancePercent}%</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  {progress.attendance.attended}/{progress.attendance.total} classes
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Avg Exam Score</h3>
                  <Award className="w-5 h-5 text-[#075aae]" />
                </div>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke="#075aae" strokeWidth="10"
                      strokeDasharray={`${avgExamScore * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{avgExamScore}%</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  {progress.exams.passed}/{progress.exams.totalAttempts} exams passed
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Assignments</h3>
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="10"
                      strokeDasharray={`${assignmentPercent * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{assignmentPercent}%</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  {progress.assignments.submitted}/{progress.assignments.total} submitted
                </p>
              </motion.div>
            </div>

            {/* Overall Performance */}
            <div className="card-elevated rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#075aae]" />
                Performance Summary
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Class Attendance", value: attendancePercent, color: "bg-blue-500" },
                  { label: "Exam Performance", value: avgExamScore, color: "bg-[#075aae]" },
                  { label: "Assignment Completion", value: assignmentPercent, color: "bg-purple-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`${item.color} h-3 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Class Attendance Record</h3>
              <p className="text-sm text-gray-500 mt-1">
                Attended {progress.attendance.attended} out of {progress.attendance.total} classes
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {progress.attendance.records.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No attendance records yet.</div>
              ) : (
                progress.attendance.records.map((record, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {record.present ? (
                        <CheckCircle2 className="w-5 h-5 text-[#075aae]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.session.title}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(record.session.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      record.present ? "bg-blue-50 text-[#075aae]" : "bg-red-50 text-red-500"
                    }`}>
                      {record.present ? "Present" : "Absent"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <div className="space-y-4">
            {progress.exams.attempts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <p className="text-gray-500">No exam attempts yet.</p>
              </div>
            ) : (
              progress.exams.attempts.map((attempt, i) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        attempt.passed ? "bg-blue-50" : "bg-red-50"
                      }`}>
                        {attempt.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#075aae]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{attempt.exam.title}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(attempt.startedAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {attempt.score}/{attempt.totalMarks}
                      </div>
                      <div className={`text-sm font-medium ${
                        attempt.passed ? "text-[#075aae]" : "text-red-500"
                      }`}>
                        {Math.round((attempt.score / attempt.totalMarks) * 100)}% -{" "}
                        {attempt.passed ? "Passed" : "Failed"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {progress.assignments.submissions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <p className="text-gray-500">No assignments submitted yet.</p>
              </div>
            ) : (
              progress.assignments.submissions.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        sub.status === "graded" ? "bg-blue-50" : "bg-yellow-50"
                      }`}>
                        {sub.status === "graded" ? (
                          <CheckCircle2 className="w-5 h-5 text-[#075aae]" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{sub.assignment.title}</h4>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {sub.marks !== null ? (
                        <div className="text-lg font-bold text-gray-900">
                          {sub.marks}/{sub.assignment.totalMarks}
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-600 font-medium">Pending review</span>
                      )}
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                        sub.status === "graded"
                          ? "bg-blue-50 text-[#075aae]"
                          : "bg-yellow-50 text-yellow-600"
                      }`}>
                        {sub.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
