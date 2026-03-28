"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  BookOpen,
  Plus,
  Trash2,
  X,
  Send,
  ExternalLink,
  Eye,
  EyeOff,
  Users,
  Pencil,
  Link,
} from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
}

interface ExamItem {
  id: string;
  title: string;
  description: string;
  type: string;
  formUrl: string | null;
  isActive: boolean;
  createdAt: string;
  course: { id: string; title: string };
  _count: { attempts: number };
}

export default function AdminExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", courseId: "", formUrl: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetchExams();
    }
  }, [session]);

  const fetchExams = async () => {
    const res = await fetch("/api/admin/exams");
    const data = await res.json();
    setExams(data.exams || []);
    setCourses(data.courses || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.courseId) return;
    setSaving(true);
    await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "final",
        title: form.title,
        description: form.description,
        courseId: form.courseId,
        formUrl: form.formUrl || null,
      }),
    });
    resetForm();
    setSaving(false);
    fetchExams();
  };

  const handleUpdateUrl = async (examId: string) => {
    setSaving(true);
    await fetch("/api/admin/exams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, formUrl: form.formUrl || null }),
    });
    setEditingExam(null);
    setForm({ title: "", description: "", courseId: "", formUrl: "" });
    setSaving(false);
    fetchExams();
  };

  const toggleActive = async (examId: string, current: boolean) => {
    await fetch("/api/admin/exams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, isActive: !current }),
    });
    fetchExams();
  };

  const handleDelete = async (examId: string) => {
    await fetch(`/api/admin/exams?id=${examId}`, { method: "DELETE" });
    setConfirmDelete(null);
    fetchExams();
  };

  const startEditUrl = (exam: ExamItem) => {
    setEditingExam(exam.id);
    setForm({ title: "", description: "", courseId: "", formUrl: exam.formUrl || "" });
    setShowForm(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingExam(null);
    setForm({ title: "", description: "", courseId: "", formUrl: "" });
  };

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#075aae]" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Exams</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500">Add exams and quizzes via Google Forms.</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingExam(null); setForm({ title: "", description: "", courseId: "", formUrl: "" }); }}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Exam
            </button>
          </div>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Add New Exam</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. PPTTC Mid-Term Quiz"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the exam"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Google Form URL</label>
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="url"
                    value={form.formUrl}
                    onChange={(e) => setForm((p) => ({ ...p, formUrl: e.target.value }))}
                    placeholder="https://docs.google.com/forms/d/e/..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400">Paste the Google Form link. Leave empty to add later.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.title || !form.description || !form.courseId}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Add Exam
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exam List */}
        {exams.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No exams yet</h3>
            <p className="text-gray-500 mt-1">Click &quot;Add Exam&quot; to create your first exam.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#075aae]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{exam.course.title}</p>
                        {exam.formUrl ? (
                          <a
                            href={exam.formUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#075aae] hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Google Form
                          </a>
                        ) : (
                          <span className="text-xs text-amber-500 mt-1 block">No form URL — students see &quot;Coming Soon&quot;</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditUrl(exam)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#075aae] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit URL
                      </button>

                      <button
                        onClick={() => toggleActive(exam.id, exam.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          exam.isActive
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {exam.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {exam.isActive ? "Active" : "Hidden"}
                      </button>

                      {confirmDelete === exam.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(exam.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit URL Panel */}
                <AnimatePresence>
                  {editingExam === exam.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-gray-400 shrink-0" />
                          <input
                            type="url"
                            value={form.formUrl}
                            onChange={(e) => setForm((p) => ({ ...p, formUrl: e.target.value }))}
                            placeholder="https://docs.google.com/forms/d/e/..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                          />
                          <button
                            onClick={() => handleUpdateUrl(exam.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingExam(null); }}
                            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
