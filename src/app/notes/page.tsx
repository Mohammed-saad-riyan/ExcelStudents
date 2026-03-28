"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { StickyNote, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  pdfUrl: string | null;
  pdfName: string | null;
  createdAt: string;
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/notes")
        .then((res) => res.json())
        .then((data) => {
          setNotes(data.notes || []);
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

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-[#fafbfc]">
        <div className="px-8 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-display text-2xl text-gray-900 mb-1">Class Notes</h1>
            <p className="text-sm text-gray-500">Notes and study material from your classes</p>
          </motion.div>

          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated rounded-xl p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StickyNote className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes available</h3>
              <p className="text-sm text-gray-500">
                Class notes will appear here once your instructor posts them
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-elevated rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#075aae] to-[#0ea5e9] rounded-lg flex items-center justify-center shrink-0">
                        <StickyNote className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{note.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {expandedNote === note.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {expandedNote === note.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                        {note.pdfUrl && (
                          <a
                            href={note.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0652a0] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
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
    </>
  );
}
