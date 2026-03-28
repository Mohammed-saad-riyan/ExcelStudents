"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  course: { title: string };
  submissions: {
    id: string;
    content: string;
    marks: number | null;
    status: string;
    feedback: string | null;
    submittedAt: string;
  }[];
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitContent, setSubmitContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted">("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAssignments();
    }
  }, [session]);

  const fetchAssignments = () => {
    fetch("/api/assignments")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      });
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!submitContent.trim()) return;
    setSubmitting(true);

    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, content: submitContent }),
    });

    setSubmitContent("");
    setSubmitting(false);
    fetchAssignments();
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const submitted = assignment.submissions.length > 0;
    if (filter === "pending") return !submitted;
    if (filter === "submitted") return submitted;
    return true;
  });

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-[#fafbfc]">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-display text-2xl text-gray-900 mb-1">Assignments</h1>
              <p className="text-sm text-gray-500">View, submit, and track your assignments</p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "submitted", label: "Submitted" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as typeof filter)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filter === tab.value
                      ? "bg-[#075aae] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="text-xs text-gray-500">
              {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? "s" : ""}
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="card-elevated rounded-xl p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                {assignments.length === 0 ? "No assignments yet" : "No assignments found"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {assignments.length === 0
                  ? "Assignments will appear here when assigned."
                  : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((assignment, i) => {
              const submitted = assignment.submissions.length > 0;
              const latestSubmission = assignment.submissions[0];
              const overdue = isOverdue(assignment.dueDate) && !submitted;
              const isExpanded = expandedId === assignment.id;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-elevated rounded-xl overflow-hidden"
                >
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                            submitted
                              ? "bg-emerald-50"
                              : overdue
                              ? "bg-red-50"
                              : "bg-blue-50"
                          }`}
                        >
                          {submitted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : overdue ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#075aae]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                              <p className="text-xs text-gray-500">{assignment.course.title}</p>
                            </div>
                            {submitted ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                                latestSubmission.status === "graded"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {latestSubmission.status === "graded"
                                  ? `${latestSubmission.marks}/${assignment.totalMarks}`
                                  : "Submitted"}
                              </span>
                            ) : overdue ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 shrink-0">
                                Overdue
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#075aae] shrink-0">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due {new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Award className="w-3.5 h-3.5" />
                              <span>{assignment.totalMarks} marks</span>
                            </div>
                            <div className="ml-auto">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {assignment.description}
                        </p>
                      </div>

                      {submitted && latestSubmission.feedback && (
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                          <h4 className="text-xs font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Instructor Feedback
                          </h4>
                          <p className="text-sm text-emerald-700">{latestSubmission.feedback}</p>
                        </div>
                      )}

                      {!submitted && (
                        <div className="space-y-3 pt-2">
                          <label className="text-xs font-semibold text-gray-700">Your Submission</label>
                          <textarea
                            value={submitContent}
                            onChange={(e) => setSubmitContent(e.target.value)}
                            placeholder="Write your assignment submission here..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#075aae] focus:ring-3 focus:ring-[#075aae]/10 transition-all resize-none bg-white"
                          />
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={submitting || !submitContent.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0652a0] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                          >
                            <Send className="w-4 h-4" />
                            {submitting ? "Submitting..." : "Submit Assignment"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
