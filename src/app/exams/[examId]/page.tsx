"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  CheckCircle,
  BookOpen,
  FileText,
  AlertTriangle,
  Loader2,
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
  instructions: string;
  totalMarks: number;
  requiredQuestions?: number;
  questions: Question[];
}

interface ExamData {
  id: string;
  title: string;
  course: { title: string };
  totalMarks: number;
  duration: number;
  instructions: string;
  sections: Section[];
}

interface AttemptData {
  id: string;
  status: string;
  startedAt: string;
  answers: Record<string, string>;
  score?: number;
  totalMarks?: number;
  feedback?: string;
  sectionScores?: Record<string, number>;
}

export default function TakeExamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [canTakeExam, setCanTakeExam] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exam data
  const fetchExam = useCallback(async () => {
    try {
      const res = await fetch(`/api/exam/${examId}`);
      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setCanTakeExam(false);
        setLoading(false);
        return;
      }

      setExam(data.exam);
      setCanTakeExam(data.canTakeExam);
      setCanStart(data.canStart);
      setMessage(data.message || "");

      if (data.attempt) {
        setAttempt(data.attempt);
        if (data.attempt.answers) {
          setAnswers(data.attempt.answers);
        }
      }

      if (data.remainingMinutes !== undefined) {
        setRemainingTime(data.remainingMinutes * 60);
      }

      setLoading(false);
    } catch {
      setMessage("Failed to load exam");
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchExam();
    }
  }, [session, fetchExam]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime > 0 && attempt?.status === "in_progress") {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [remainingTime, attempt?.status]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (attempt?.status === "in_progress" && Object.keys(answers).length > 0) {
      autoSaveRef.current = setInterval(() => {
        handleAutoSave();
      }, 30000);

      return () => {
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      };
    }
  }, [attempt?.status, answers]);

  // Warn before leaving
  useEffect(() => {
    if (attempt?.status === "in_progress") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [attempt?.status]);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exam/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setLoading(false);
        return;
      }

      // Refresh to get exam questions
      await fetchExam();
    } catch {
      setMessage("Failed to start exam");
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (saving) return;
    setAutoSaveStatus("Saving...");
    try {
      await fetch(`/api/exam/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", answers }),
      });
      setAutoSaveStatus("Saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    } catch {
      setAutoSaveStatus("Save failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/exam/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", answers }),
      });
      setAutoSaveStatus("Saved!");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    } catch {
      setAutoSaveStatus("Save failed");
    }
    setSaving(false);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);

    try {
      const res = await fetch(`/api/exam/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", answers }),
      });
      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setSubmitting(false);
        return;
      }

      // Redirect to results or show success
      if (autoSubmit) {
        setMessage("Time's up! Your exam has been auto-submitted.");
      }
      router.push("/exams?submitted=true");
    } catch {
      setMessage("Failed to submit exam");
      setSubmitting(false);
    }
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = (section: Section) => {
    return section.questions.filter((q) => answers[q.id]?.trim()).length;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#075aae] mx-auto mb-4" />
          <p className="text-gray-500">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Exam already submitted or graded
  if (attempt && attempt.status !== "in_progress") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              attempt.status === "graded" ? "bg-green-100" : "bg-amber-100"
            }`}>
              {attempt.status === "graded" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {exam?.title}
            </h1>

            {attempt.status === "graded" ? (
              <>
                <p className="text-gray-500 mb-6">Your exam has been graded</p>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="text-4xl font-bold text-[#075aae] mb-2">
                    {attempt.score} / {attempt.totalMarks}
                  </div>
                  <p className="text-sm text-gray-500">Your Score</p>
                </div>

                {attempt.sectionScores && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {Object.entries(attempt.sectionScores).map(([section, score]) => (
                      <div key={section} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-semibold text-gray-900">{score}</div>
                        <div className="text-xs text-gray-500 capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    ))}
                  </div>
                )}

                {attempt.feedback && (
                  <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Instructor Feedback</h4>
                    <p className="text-sm text-blue-800">{attempt.feedback}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-6">Your exam has been submitted and is pending grading</p>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    You will be able to see your results once the instructor has graded your submission.
                  </p>
                </div>
              </>
            )}

            <button
              onClick={() => router.push("/exams")}
              className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Exams
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show start exam screen
  if (canStart && !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#075aae] to-[#0ea5e9] p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">{exam?.title}</h1>
              <p className="text-blue-100">{exam?.course?.title}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-[#075aae] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{exam?.duration}</div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <FileText className="w-6 h-6 text-[#075aae] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{exam?.totalMarks}</div>
                  <div className="text-xs text-gray-500">Total Marks</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <BookOpen className="w-6 h-6 text-[#075aae] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{exam?.sections?.length || 0}</div>
                  <div className="text-xs text-gray-500">Sections</div>
                </div>
              </div>

              {exam?.instructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Important Instructions
                  </h3>
                  <pre className="text-sm text-amber-800 whitespace-pre-wrap font-sans">
                    {exam.instructions}
                  </pre>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Before You Start
                </h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• The exam will auto-submit when time runs out</li>
                  <li>• Do not refresh or close the browser during the exam</li>
                  <li>• Your progress is auto-saved every 30 seconds</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/exams")}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleStartExam}
                  className="flex-1 py-3 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Start Exam
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // No access or error
  if (!canTakeExam || !exam?.sections) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Access Exam</h2>
            <p className="text-gray-500 mb-6">{message || "You don't have access to this exam."}</p>
            <button
              onClick={() => router.push("/exams")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Exams
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main exam taking interface
  const section = exam.sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header with Timer */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#075aae]" />
            <div>
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                {exam.title}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">{exam.course?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {autoSaveStatus && (
              <span className="text-xs text-gray-500 hidden sm:block">{autoSaveStatus}</span>
            )}

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
              remainingTime < 300 ? "bg-red-100 text-red-600" : "bg-blue-100 text-[#075aae]"
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(remainingTime)}
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2">
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
                  ({getAnsweredCount(s)}/{s.questions.length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-gray-50 border-b border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{section.instructions}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {section.totalMarks} marks
                </span>
                {section.requiredQuestions && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    Answer any {section.requiredQuestions}
                  </span>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="p-4 sm:p-6 space-y-6">
              {section.questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    answers[q.id]?.trim() ? "border-green-200 bg-green-50/50" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                      {qIndex + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{q.question}</p>
                      <span className="text-xs text-gray-400 mt-1">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {section.type === "mcq" && q.options && (
                    <div className="ml-11 space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            answers[q.id] === opt
                              ? "bg-[#075aae] text-white"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => updateAnswer(q.id, opt)}
                            className="sr-only"
                          />
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            answers[q.id] === opt
                              ? "border-white bg-white text-[#075aae]"
                              : "border-gray-300"
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Fill in the Blanks */}
                  {section.type === "fillBlanks" && (
                    <div className="ml-11">
                      <input
                        type="text"
                        value={answers[q.id] || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Short Answer */}
                  {section.type === "shortAnswer" && (
                    <div className="ml-11">
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        placeholder="Write your answer (keep it concise)..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {(answers[q.id] || "").split(/\s+/).filter(Boolean).length} words
                      </p>
                    </div>
                  )}

                  {/* Long Answer */}
                  {section.type === "longAnswer" && (
                    <div className="ml-11">
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        placeholder="Write your detailed answer..."
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {(answers[q.id] || "").split(/\s+/).filter(Boolean).length} words
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentSection((p) => Math.max(0, p - 1))}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>

          <button
            onClick={() => setCurrentSection((p) => Math.min(exam.sections.length - 1, p + 1))}
            disabled={currentSection === exam.sections.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Submit Exam?
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to submit? You cannot make changes after submission.
              </p>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Answer Summary</h4>
                <div className="space-y-2">
                  {exam.sections.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{s.title.split(":")[0]}</span>
                      <span className={`font-medium ${
                        getAnsweredCount(s) === s.questions.length ? "text-green-600" : "text-amber-600"
                      }`}>
                        {getAnsweredCount(s)} / {s.questions.length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Exam
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
