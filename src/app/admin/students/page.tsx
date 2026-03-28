"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCheck,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  BookOpen,
  Plus,
  X,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  courseInterested: string | null;
  approved: boolean;
  createdAt: string;
}

interface Counts {
  total: number;
  pending: number;
  approved: number;
}

interface CourseOption {
  id: string;
  title: string;
}

interface EnrollmentInfo {
  id: string;
  courseId: string;
  course: { id: string; title: string };
}

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, approved: 0 });
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Enrollment state
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [enrollmentPanel, setEnrollmentPanel] = useState<string | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<EnrollmentInfo[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role: string })?.role === "admin") {
      fetchStudents();
      fetchCourses();
    }
  }, [session, filter]);

  const fetchStudents = async () => {
    const res = await fetch(`/api/admin/students?filter=${filter}`);
    const data = await res.json();
    setStudents(data.students);
    setCounts(data.counts);
    setLoading(false);
  };

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/enrollments");
    const data = await res.json();
    setCourses(data.courses || []);
  };

  const fetchEnrollments = async (studentId: string) => {
    const res = await fetch(`/api/admin/enrollments?studentId=${studentId}`);
    const data = await res.json();
    setStudentEnrollments(data.enrollments || []);
  };

  const toggleEnrollmentPanel = async (studentId: string) => {
    if (enrollmentPanel === studentId) {
      setEnrollmentPanel(null);
      setStudentEnrollments([]);
      return;
    }
    setEnrollmentPanel(studentId);
    setSelectedCourse("");
    await fetchEnrollments(studentId);
  };

  const handleEnroll = async (studentId: string) => {
    if (!selectedCourse) return;
    setEnrollLoading(true);
    await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId: selectedCourse }),
    });
    setSelectedCourse("");
    await fetchEnrollments(studentId);
    setEnrollLoading(false);
  };

  const handleUnenroll = async (enrollmentId: string, studentId: string) => {
    setEnrollLoading(true);
    await fetch(`/api/admin/enrollments?id=${enrollmentId}`, { method: "DELETE" });
    await fetchEnrollments(studentId);
    setEnrollLoading(false);
  };

  const handleAction = async (studentId: string, action: "approve" | "reject") => {
    setActionLoading(studentId);
    await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, action }),
    });
    setActionLoading(null);
    fetchStudents();
  };

  const handleDelete = async (studentId: string) => {
    setActionLoading(studentId);
    await fetch(`/api/admin/students?id=${studentId}`, { method: "DELETE" });
    setActionLoading(null);
    setConfirmDelete(null);
    fetchStudents();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search))
  );

  // Get courses not yet enrolled for a student
  const availableCourses = courses.filter(
    (c) => !studentEnrollments.some((e) => e.courseId === c.id)
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  if ((session?.user as { role: string })?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-[#075aae]" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-500">Manage student registrations, accounts, and course enrollments.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Students", value: counts.total, icon: Users, color: "bg-blue-50 text-[#075aae]" },
            { label: "Pending Approval", value: counts.pending, icon: Clock, color: "bg-amber-50 text-amber-600" },
            { label: "Approved", value: counts.approved, icon: UserCheck, color: "bg-green-50 text-green-600" },
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

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-100">
            {(["pending", "approved", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f
                    ? "bg-[#075aae] text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f} {f === "pending" && counts.pending > 0 && (
                  <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {counts.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Student List */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === "pending" ? "No pending registrations" : "No students found"}
            </h3>
            <p className="text-gray-500 mt-1">
              {filter === "pending"
                ? "All registrations have been reviewed."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          student.approved
                            ? "bg-gradient-to-br from-[#075aae] to-[#0ea5e9]"
                            : "bg-gradient-to-br from-amber-400 to-orange-500"
                        }`}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </span>
                            {student.phone && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                {student.phone}
                              </span>
                            )}
                          </div>
                          {student.courseInterested && (
                            <div className="flex items-center gap-1 mt-1">
                              <BookOpen className="w-3 h-3 text-[#075aae]" />
                              <span className="text-xs font-medium text-[#075aae] bg-blue-50 px-2 py-0.5 rounded-full">
                                Interested in: {student.courseInterested}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            Registered: {new Date(student.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.approved
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {student.approved ? "Approved" : "Pending"}
                        </span>

                        {/* Actions */}
                        {!student.approved ? (
                          <>
                            <button
                              onClick={() => handleAction(student.id, "approve")}
                              disabled={actionLoading === student.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(student.id, "reject")}
                              disabled={actionLoading === student.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleEnrollmentPanel(student.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                enrollmentPanel === student.id
                                  ? "bg-[#075aae] text-white"
                                  : "bg-blue-50 text-[#075aae] hover:bg-blue-100"
                              }`}
                            >
                              <BookOpen className="w-4 h-4" />
                              Courses
                            </button>
                            {confirmDelete === student.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Confirm?
                                </span>
                                <button
                                  onClick={() => handleDelete(student.id)}
                                  disabled={actionLoading === student.id}
                                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                  Yes, Remove
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(student.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Panel */}
                  <AnimatePresence>
                    {enrollmentPanel === student.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-4">
                          <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Course Enrollments
                          </h5>

                          {/* Current enrollments */}
                          {studentEnrollments.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {studentEnrollments.map((enrollment) => (
                                <span
                                  key={enrollment.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#075aae] rounded-lg text-sm font-medium border border-blue-100"
                                >
                                  {enrollment.course.title}
                                  <button
                                    onClick={() => handleUnenroll(enrollment.id, student.id)}
                                    disabled={enrollLoading}
                                    className="ml-1 text-blue-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Not enrolled in any course yet.</p>
                          )}

                          {/* Enroll in new course */}
                          {availableCourses.length > 0 && (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                              >
                                <option value="">Select a course to enroll...</option>
                                {availableCourses.map((course) => (
                                  <option key={course.id} value={course.id}>
                                    {course.title}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleEnroll(student.id)}
                                disabled={!selectedCourse || enrollLoading}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                                Enroll
                              </button>
                            </div>
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
