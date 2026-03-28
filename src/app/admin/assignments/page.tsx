"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  User,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  BookOpen,
  AlertCircle,
  Star,
  Plus,
  X,
  Calendar,
} from "lucide-react";

interface Submission {
  id: string;
  content: string;
  marks: number | null;
  feedback: string | null;
  status: string;
  submittedAt: string;
  user: { id: string; name: string; email: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  course: { title: string };
  submissions: Submission[];
}

interface Course {
  id: string;
  title: string;
}

export default function AdminAssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState<{ marks: string; feedback: string }>({ marks: "", feedback: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "graded">("all");

  // Add Assignment form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    totalMarks: "",
  });
  const [addingAssignment, setAddingAssignment] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetchAssignments();
    }
  }, [session]);

  const fetchAssignments = async () => {
    const res = await fetch("/api/admin/assignments");
    const data = await res.json();
    setAssignments(data.assignments);
    setLoading(false);
  };

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/enrollments");
    const data = await res.json();
    setCourses(data.courses || []);
  };

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetchCourses();
    }
  }, [session]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAssignment(true);

    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: addForm.title,
        description: addForm.description,
        courseId: addForm.courseId,
        dueDate: new Date(addForm.dueDate).toISOString(),
        totalMarks: parseInt(addForm.totalMarks),
      }),
    });

    if (res.ok) {
      setShowAddForm(false);
      setAddForm({ title: "", description: "", courseId: "", dueDate: "", totalMarks: "" });
      fetchAssignments();
    }
    setAddingAssignment(false);
  };

  const handleGrade = async (submissionId: string, totalMarks: number) => {
    const marks = parseInt(gradeForm.marks);
    if (isNaN(marks) || marks < 0 || marks > totalMarks) return;

    setSaving(true);
    const res = await fetch("/api/admin/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, marks, feedback: gradeForm.feedback }),
    });

    if (res.ok) {
      setGradingSubmission(null);
      setGradeForm({ marks: "", feedback: "" });
      fetchAssignments();
    }
    setSaving(false);
  };

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission.id);
    setGradeForm({
      marks: submission.marks !== null ? String(submission.marks) : "",
      feedback: submission.feedback || "",
    });
  };

  // Count stats
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions.length, 0);
  const pendingCount = assignments.reduce(
    (sum, a) => sum + a.submissions.filter((s) => s.status === "submitted").length,
    0
  );
  const gradedCount = assignments.reduce(
    (sum, a) => sum + a.submissions.filter((s) => s.status === "graded").length,
    0
  );

  // Filter assignments to only show those with matching submissions
  const filteredAssignments = assignments
    .map((a) => ({
      ...a,
      submissions: a.submissions.filter((s) => {
        if (filter === "pending") return s.status === "submitted";
        if (filter === "graded") return s.status === "graded";
        return true;
      }),
    }))
    .filter((a) => filter === "all" || a.submissions.length > 0);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  if ((session?.user as { role?: string })?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#075aae]" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Assignments</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500">Create assignments and evaluate student submissions.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#075aae] text-white text-sm font-medium rounded-xl hover:bg-[#064a8e] transition-colors shadow-lg shadow-blue-500/20 w-full sm:w-auto"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? "Cancel" : "Add Assignment"}
            </button>
          </div>
        </motion.div>

        {/* Add Assignment Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Assignment</h3>
                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={addForm.title}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Assignment title"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Course</label>
                      <select
                        value={addForm.courseId}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, courseId: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                        required
                      >
                        <option value="">Select a course...</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={addForm.description}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the assignment requirements..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        value={addForm.dueDate}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        Total Marks
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={addForm.totalMarks}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, totalMarks: e.target.value }))}
                        placeholder="100"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setAddForm({ title: "", description: "", courseId: "", dueDate: "", totalMarks: "" });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingAssignment}
                      className="flex items-center gap-2 px-5 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                    >
                      {addingAssignment ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Assignment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          {[
            { label: "Total Submissions", value: totalSubmissions, icon: FileText, color: "bg-blue-50 text-[#075aae]" },
            { label: "Pending Review", value: pendingCount, icon: Clock, color: "bg-amber-50 text-amber-600" },
            { label: "Graded", value: gradedCount, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-5 border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
          >
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-800 font-medium">
              {pendingCount} submission{pendingCount > 1 ? "s" : ""} waiting for your review
            </span>
          </motion.div>
        )}

        {/* Filter */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-100 w-fit">
          {(["all", "pending", "graded"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f
                  ? "bg-[#075aae] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f === "pending" ? "Pending Review" : f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Assignment List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No submissions found</h3>
            <p className="text-gray-500 mt-1">
              {filter === "pending"
                ? "All submissions have been reviewed."
                : "No assignment submissions yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAssignments.map((assignment, i) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  {/* Assignment Header */}
                  <button
                    onClick={() =>
                      setExpandedAssignment(expandedAssignment === assignment.id ? null : assignment.id)
                    }
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#075aae] to-[#0ea5e9] rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <BookOpen className="w-3 h-3" />
                            {assignment.course.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-gray-400">
                            Total: {assignment.totalMarks} marks
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {assignment.submissions.length} submission{assignment.submissions.length !== 1 ? "s" : ""}
                      </span>
                      {expandedAssignment === assignment.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Submissions */}
                  <AnimatePresence>
                    {expandedAssignment === assignment.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 divide-y divide-gray-50">
                          {assignment.submissions.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                              No submissions yet for this assignment.
                            </div>
                          ) : (
                            assignment.submissions.map((submission) => (
                              <div key={submission.id} className="p-5 bg-gray-50/50">
                                {/* Student Info */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                      {submission.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 text-sm">
                                        {submission.user.name}
                                      </h4>
                                      <p className="text-xs text-gray-500">{submission.user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {new Date(submission.submittedAt).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        submission.status === "graded"
                                          ? "bg-green-50 text-green-600"
                                          : "bg-amber-50 text-amber-600"
                                      }`}
                                    >
                                      {submission.status === "graded" ? "Graded" : "Pending Review"}
                                    </span>
                                  </div>
                                </div>

                                {/* Submission Content */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {submission.content}
                                  </p>
                                </div>

                                {/* Graded Info */}
                                {submission.status === "graded" && gradingSubmission !== submission.id && (
                                  <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 mb-3">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-semibold text-green-700">
                                          {submission.marks}/{assignment.totalMarks}
                                        </span>
                                      </div>
                                      {submission.feedback && (
                                        <p className="text-sm text-green-700">{submission.feedback}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => startGrading(submission)}
                                      className="text-xs text-green-600 hover:text-green-800 font-medium"
                                    >
                                      Edit Grade
                                    </button>
                                  </div>
                                )}

                                {/* Grade Form */}
                                {gradingSubmission === submission.id ? (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-50 rounded-lg border border-blue-100 p-4 space-y-3"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">
                                          Marks (out of {assignment.totalMarks})
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          max={assignment.totalMarks}
                                          value={gradeForm.marks}
                                          onChange={(e) =>
                                            setGradeForm((prev) => ({ ...prev, marks: e.target.value }))
                                          }
                                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                          placeholder="0"
                                        />
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <label className="text-xs font-medium text-gray-600">
                                          Feedback (optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={gradeForm.feedback}
                                          onChange={(e) =>
                                            setGradeForm((prev) => ({ ...prev, feedback: e.target.value }))
                                          }
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                          placeholder="Great work! Consider improving..."
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 justify-end">
                                      <button
                                        onClick={() => {
                                          setGradingSubmission(null);
                                          setGradeForm({ marks: "", feedback: "" });
                                        }}
                                        className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleGrade(submission.id, assignment.totalMarks)}
                                        disabled={saving || !gradeForm.marks}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                                      >
                                        {saving ? (
                                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                          <>
                                            <Send className="w-3.5 h-3.5" />
                                            Submit Grade
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </motion.div>
                                ) : (
                                  submission.status !== "graded" && (
                                    <button
                                      onClick={() => startGrading(submission)}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Evaluate
                                    </button>
                                  )
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
