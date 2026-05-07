"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  FileText,
  Loader2,
  Search,
  Check,
  AlertCircle,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  hasAccess: boolean;
  grantedAt: string | null;
  attempt: {
    id: string;
    status: string;
    score: number;
    totalMarks: number;
    startedAt: string;
    completedAt: string | null;
  } | null;
}

interface ExamInfo {
  id: string;
  title: string;
  course: { title: string };
  totalMarks: number;
  duration: number;
}

export default function AdminExamAccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"access" | "submissions">("access");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetchData();
    }
  }, [session, examId]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/exam-access?examId=${examId}`);
    const data = await res.json();
    setExam(data.exam);
    setStudents(data.students || []);
    setLoading(false);
  };

  const handleGrantAccess = async () => {
    if (selectedStudents.size === 0) return;
    setSaving(true);
    await fetch("/api/admin/exam-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, userIds: Array.from(selectedStudents) }),
    });
    setSelectedStudents(new Set());
    await fetchData();
    setSaving(false);
  };

  const handleRevokeAccess = async (userId: string) => {
    await fetch(`/api/admin/exam-access?examId=${examId}&userId=${userId}`, {
      method: "DELETE",
    });
    await fetchData();
  };

  const toggleSelectAll = () => {
    const withoutAccess = filteredStudents.filter(s => !s.hasAccess && !s.attempt);
    if (selectedStudents.size === withoutAccess.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(withoutAccess.map(s => s.id)));
    }
  };

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudents(newSet);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const studentsWithAccess = filteredStudents.filter(s => s.hasAccess);
  const studentsWithoutAccess = filteredStudents.filter(s => !s.hasAccess);
  const submissions = filteredStudents.filter(s => s.attempt);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#075aae]" />
      </div>
    );
  }

  if ((session?.user as { role?: string })?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.push("/admin/exams")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exams
          </button>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#075aae]" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{exam?.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{exam?.course?.title}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {exam?.duration} minutes
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {exam?.totalMarks} marks
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {students.length} students enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab("access")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "access"
                ? "border-[#075aae] text-[#075aae]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Manage Access
          </button>
          <button
            onClick={() => setTab("submissions")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "submissions"
                ? "border-[#075aae] text-[#075aae]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Submissions ({submissions.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        {tab === "access" ? (
          <>
            {/* Students Without Access */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserX className="w-5 h-5 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Without Access ({studentsWithoutAccess.length})</h2>
                </div>
                <div className="flex items-center gap-2">
                  {studentsWithoutAccess.filter(s => !s.attempt).length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-[#075aae] hover:underline"
                    >
                      {selectedStudents.size === studentsWithoutAccess.filter(s => !s.attempt).length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                  {selectedStudents.size > 0 && (
                    <button
                      onClick={handleGrantAccess}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Grant Access ({selectedStudents.size})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {studentsWithoutAccess.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  All students have been granted access
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {studentsWithoutAccess.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {!student.attempt && (
                          <button
                            onClick={() => toggleStudent(student.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              selectedStudents.has(student.id)
                                ? "bg-[#075aae] border-[#075aae]"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {selectedStudents.has(student.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      {student.attempt && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          Already attempted
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Students With Access */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-green-500" />
                <h2 className="font-semibold text-gray-900">With Access ({studentsWithAccess.length})</h2>
              </div>

              {studentsWithAccess.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No students have access yet
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {studentsWithAccess.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                        {student.grantedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Granted: {new Date(student.grantedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {student.attempt ? (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            student.attempt.status === "graded"
                              ? "bg-green-100 text-green-700"
                              : student.attempt.status === "submitted"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {student.attempt.status === "graded"
                              ? `Scored: ${student.attempt.score}/${student.attempt.totalMarks}`
                              : student.attempt.status === "submitted"
                              ? "Pending Grading"
                              : "In Progress"}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevokeAccess(student.id)}
                            className="text-xs text-red-600 hover:text-red-800 hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        ) : (
          /* Submissions Tab */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#075aae]" />
              <h2 className="font-semibold text-gray-900">Exam Submissions</h2>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {submissions.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        student.attempt?.status === "graded"
                          ? "bg-green-100"
                          : "bg-amber-100"
                      }`}>
                        {student.attempt?.status === "graded" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                        {student.attempt?.completedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted: {new Date(student.attempt.completedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {student.attempt?.status === "graded" ? (
                        <span className="text-sm font-semibold text-green-700">
                          {student.attempt.score} / {student.attempt.totalMarks}
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          Needs Grading
                        </span>
                      )}
                      <button
                        onClick={() => router.push(`/admin/exams/${examId}/grade/${student.attempt?.id}`)}
                        className="px-4 py-2 text-sm font-medium text-[#075aae] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {student.attempt?.status === "graded" ? "View" : "Grade"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
