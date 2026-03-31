"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StickyNote, ChevronDown, ChevronUp, FileText, Filter, BookOpen } from "lucide-react";

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

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/notes")
        .then((res) => res.json())
        .then((data) => {
          setNotes(data.notes || []);
          setCourses(data.courses || []);
          setLoading(false);
        });
    }
  }, [session]);

  // Filter notes by course
  const filteredNotes = filterCourse === "all"
    ? notes
    : notes.filter((n) => n.courseId === filterCourse);

  // Get unique courses that have notes
  const coursesWithNotes = courses.filter((course) =>
    notes.some((note) => note.courseId === course.id)
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Class Notes</h1>
          <p className="text-sm text-gray-500">Notes and study material from your classes</p>
        </motion.div>

        {/* Course Filter - only show if there are multiple courses with notes */}
        {coursesWithNotes.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
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
                  All Courses
                </button>
                {coursesWithNotes.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setFilterCourse(course.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterCourse === course.id
                        ? "bg-[#075aae] text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-xl p-8 sm:p-12 text-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <StickyNote className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filterCourse === "all" ? "No notes available" : "No notes for this course"}
            </h3>
            <p className="text-sm text-gray-500">
              {filterCourse === "all"
                ? "Class notes will appear here once your instructor posts them"
                : "Try selecting a different course filter"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#075aae] to-[#0ea5e9] rounded-lg flex items-center justify-center shrink-0">
                      <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{note.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                        {note.courseName && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#075aae] rounded-full font-medium flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {note.courseName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedNote === note.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  )}
                </button>

                {expandedNote === note.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50/50 space-y-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                      {note.pdfUrl && (
                        <a
                          href={note.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0652a0] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                        >
                          <FileText className="w-4 h-4" />
                          {note.pdfName || "View PDF"}
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
