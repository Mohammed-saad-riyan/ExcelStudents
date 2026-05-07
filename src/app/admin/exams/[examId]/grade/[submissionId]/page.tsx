"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Clock,
  Save,
  CheckCircle,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options?: string[];
  marks: number;
}

interface Section {
  type: "mcq" | "fillBlanks" | "shortAnswer" | "longAnswer";
  title: string;
  totalMarks: number;
  questions: Question[];
}

interface SubmissionData {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string;
  score: number;
  totalMarks: number;
  feedback: string | null;
  sectionScores: Record<string, number>;
  answers: Record<string, string>;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
}

interface ExamData {
  id: string;
  title: string;
  totalMarks: number;
  sections: Section[];
}

export default function GradeSubmissionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;
  const submissionId = params.submissionId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, Record<string, number>>>({});
  const [feedback, setFeedback] = useState("");
  const [currentSection, setCurrentSection] = useState(0);

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
  }, [session, submissionId]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/exam-submissions?submissionId=${submissionId}`);
    const data = await res.json();

    if (data.error) {
      setLoading(false);
      return;
    }

    setSubmission(data.submission);
    setStudent(data.student);
    setExam(data.exam);
    setFeedback(data.submission.feedback || "");

    // Initialize section scores from existing grades or create new
    const initialScores: Record<string, Record<string, number>> = {};
    data.exam.sections.forEach((section: Section) => {
      initialScores[section.type] = {};
      section.questions.forEach((q: Question) => {
        // Use existing score if graded, otherwise 0
        const existingScore = data.submission.sectionScores?.[`${section.type}_${q.id}`];
        initialScores[section.type][q.id] = existingScore ?? 0;
      });
    });
    setSectionScores(initialScores);

    setLoading(false);
  };

  const calculateTotalScore = () => {
    let total = 0;
    Object.values(sectionScores).forEach((section) => {
      Object.values(section).forEach((score) => {
        total += score;
      });
    });
    return total;
  };

  const calculateSectionTotal = (sectionType: string) => {
    return Object.values(sectionScores[sectionType] || {}).reduce((a, b) => a + b, 0);
  };

  const handleSave = async () => {
    setSaving(true);

    // Flatten section scores for storage
    const flatScores: Record<string, number> = {};
    Object.entries(sectionScores).forEach(([sectionType, questions]) => {
      Object.entries(questions).forEach(([qId, score]) => {
        flatScores[`${sectionType}_${qId}`] = score;
      });
    });

    // Also store section totals
    exam?.sections.forEach((section) => {
      flatScores[section.type] = calculateSectionTotal(section.type);
    });

    await fetch("/api/admin/exam-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId,
        sectionScores: flatScores,
        totalScore: calculateTotalScore(),
        feedback: feedback || null,
      }),
    });

    setSaving(false);
    router.push(`/admin/exams/${examId}`);
  };

  const updateQuestionScore = (sectionType: string, questionId: string, score: number, maxMarks: number) => {
    const validScore = Math.max(0, Math.min(score, maxMarks));
    setSectionScores((prev) => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        [questionId]: validScore,
      },
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#075aae]" />
      </div>
    );
  }

  if (!submission || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Submission not found</h2>
          <button
            onClick={() => router.push(`/admin/exams/${examId}`)}
            className="mt-4 text-[#075aae] hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const section = exam.sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/admin/exams/${examId}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exam
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{student?.name}</h1>
                <p className="text-sm text-gray-500">{student?.email}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-[#075aae]">
                {calculateTotalScore()} / {exam.totalMarks}
              </div>
              <p className="text-xs text-gray-500">Total Score</p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {exam.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentSection(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  i === currentSection
                    ? "bg-[#075aae] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.type === "mcq" ? "MCQ" : s.type === "fillBlanks" ? "Fill Blanks" : s.type === "shortAnswer" ? "Short" : "Long"}
                <span className="ml-2 text-xs opacity-75">
                  ({calculateSectionTotal(s.type)}/{s.totalMarks})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50 border-b border-gray-100 p-4">
            <h2 className="font-bold text-gray-900">{section.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Section Total: {calculateSectionTotal(section.type)} / {section.totalMarks}
            </p>
          </div>

          <div className="p-4 space-y-6">
            {section.questions.map((q, qIndex) => {
              const studentAnswer = submission.answers[q.id] || "";
              const currentScore = sectionScores[section.type]?.[q.id] || 0;

              return (
                <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                      {qIndex + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{q.question}</p>
                      <span className="text-xs text-gray-400">Max: {q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* MCQ - Show options with selected answer */}
                  {section.type === "mcq" && q.options && (
                    <div className="ml-11 space-y-2 mb-4">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg text-sm ${
                            studentAnswer === opt
                              ? "bg-blue-100 border-2 border-blue-500"
                              : "bg-gray-50"
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          {opt}
                          {studentAnswer === opt && (
                            <span className="ml-2 text-blue-600 font-medium">(Selected)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Answer Display */}
                  {section.type !== "mcq" && (
                    <div className="ml-11 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Student&apos;s Answer:</p>
                        {studentAnswer ? (
                          <p className="text-gray-800 whitespace-pre-wrap">{studentAnswer}</p>
                        ) : (
                          <p className="text-gray-400 italic">No answer provided</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Score Input */}
                  <div className="ml-11 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Score:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={q.marks}
                        value={currentScore}
                        onChange={(e) =>
                          updateQuestionScore(section.type, q.id, parseInt(e.target.value) || 0, q.marks)
                        }
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                      <span className="text-gray-500">/ {q.marks}</span>
                    </div>

                    {/* Quick score buttons */}
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => updateQuestionScore(section.type, q.id, 0, q.marks)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        0
                      </button>
                      {q.marks > 1 && (
                        <button
                          onClick={() => updateQuestionScore(section.type, q.id, Math.floor(q.marks / 2), q.marks)}
                          className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded hover:bg-amber-100"
                        >
                          {Math.floor(q.marks / 2)}
                        </button>
                      )}
                      <button
                        onClick={() => updateQuestionScore(section.type, q.id, q.marks, q.marks)}
                        className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        {q.marks}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Feedback */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Feedback for Student</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add optional feedback or comments for the student..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#075aae]">{calculateTotalScore()}</div>
              <div className="text-xs text-gray-500">Total Score</div>
            </div>
            <div className="text-gray-300">/</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{exam.totalMarks}</div>
              <div className="text-xs text-gray-500">Max Marks</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {submission.status === "graded" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Already graded
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {submission.status === "graded" ? "Update Grades" : "Save & Submit Grades"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
