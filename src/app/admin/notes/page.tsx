"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  StickyNote,
  Plus,
  Trash2,
  Pencil,
  X,
  Send,
  FileText,
  Upload,
  BookOpen,
  Filter,
  AlertCircle,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string | null;
  courseName: string | null;
  pdfUrl: string | null;
  pdfName: string | null;
  createdAt: string;
}

export default function AdminNotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({ title: "", content: "", pdfUrl: "", pdfName: "", courseId: "" });
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetchNotes();
    }
  }, [session]);

  const fetchNotes = async () => {
    const res = await fetch("/api/admin/notes");
    const data = await res.json();
    setNotes(data.notes || []);
    setCourses(data.courses || []);
    setLoading(false);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setForm((prev) => ({ ...prev, pdfUrl: data.url, pdfName: data.name }));
      } else {
        setUploadError(data.error || "Failed to upload file");
      }
    } catch {
      setUploadError("Failed to upload file. Please try again.");
    }
    setUploading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", content: "", pdfUrl: "", pdfName: "", courseId: "" });
    setShowForm(false);
    setSaving(false);
    fetchNotes();
  };

  const handleUpdate = async (noteId: string) => {
    if (!form.title || !form.content) return;
    setSaving(true);
    await fetch("/api/admin/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, ...form }),
    });
    setEditingNote(null);
    setForm({ title: "", content: "", pdfUrl: "", pdfName: "", courseId: "" });
    setSaving(false);
    fetchNotes();
  };

  const handleDelete = async (noteId: string) => {
    await fetch(`/api/admin/notes?id=${noteId}`, { method: "DELETE" });
    setConfirmDelete(null);
    fetchNotes();
  };

  const startEdit = (note: Note) => {
    setEditingNote(note.id);
    setForm({
      title: note.title,
      content: note.content,
      pdfUrl: note.pdfUrl || "",
      pdfName: note.pdfName || "",
      courseId: note.courseId || "",
    });
    setShowForm(false);
    setUploadError("");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setForm({ title: "", content: "", pdfUrl: "", pdfName: "", courseId: "" });
    setUploadError("");
  };

  const removePdf = () => {
    setForm((prev) => ({ ...prev, pdfUrl: "", pdfName: "" }));
  };

  // Filter notes by course
  const filteredNotes = filterCourse === "all"
    ? notes
    : filterCourse === "uncategorized"
      ? notes.filter((n) => !n.courseId)
      : notes.filter((n) => n.courseId === filterCourse);

  // Get counts for each course
  const noteCounts: Record<string, number> = {
    all: notes.length,
    uncategorized: notes.filter((n) => !n.courseId).length,
  };
  courses.forEach((course) => {
    noteCounts[course.id] = notes.filter((n) => n.courseId === course.id).length;
  });

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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Class Notes</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-500">Create and manage notes for different courses.</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingNote(null); setForm({ title: "", content: "", pdfUrl: "", pdfName: "", courseId: "" }); setUploadError(""); }}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
        </motion.div>

        {/* Course Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by course:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCourse("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCourse === "all"
                  ? "bg-[#075aae] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              All ({noteCounts.all})
            </button>
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setFilterCourse(course.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCourse === course.id
                    ? "bg-[#075aae] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {course.title} ({noteCounts[course.id] || 0})
              </button>
            ))}
            <button
              onClick={() => setFilterCourse("uncategorized")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCourse === "uncategorized"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              Uncategorized ({noteCounts.uncategorized})
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(showForm || editingNote) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {editingNote ? "Edit Note" : "Create New Note"}
                </h3>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Session 1: Introduction"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Course
                  </label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select a course (optional)</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your class notes here..."
                  rows={8}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PDF Attachment (optional)</label>
                {uploadError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </div>
                )}
                {form.pdfUrl ? (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <FileText className="w-5 h-5 text-[#075aae] shrink-0" />
                    <span className="text-sm text-[#075aae] font-medium flex-1 truncate">{form.pdfName}</span>
                    <button
                      onClick={removePdf}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#075aae] rounded-full animate-spin" />
                        <span className="text-sm">Uploading to cloud...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload a PDF file</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelForm}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingNote ? handleUpdate(editingNote) : handleCreate()}
                  disabled={saving || uploading || !form.title || !form.content}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#075aae] text-white text-sm font-medium rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {editingNote ? "Update Note" : "Publish Note"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              {filterCourse === "all" ? "No notes yet" : "No notes in this category"}
            </h3>
            <p className="text-gray-500 mt-1">
              {filterCourse === "all"
                ? 'Click "Add Note" to create your first class note.'
                : "Try selecting a different course filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                      {note.courseName && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#075aae] rounded-full font-medium">
                          {note.courseName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                    {note.pdfUrl && (
                      <a
                        href={note.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-50 text-[#075aae] text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {note.pdfName || "View PDF"}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-2 text-gray-400 hover:text-[#075aae] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {confirmDelete === note.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-medium"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(note.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
