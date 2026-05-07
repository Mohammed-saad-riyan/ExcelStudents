"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  Circle,
  Type,
  AlignLeft,
  FileText,
  Clock,
  Award,
  Save,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Settings,
} from "lucide-react";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: "mcq" | "fillBlanks" | "shortAnswer" | "longAnswer";
  question: string;
  marks: number;
  options?: MCQOption[];
  correctAnswer?: string; // For fill in blanks
  expanded: boolean;
}

interface CourseOption {
  id: string;
  title: string;
}

export default function CreateExamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Exam settings
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState(90);
  const [passingMarks, setPassingMarks] = useState(40);
  const [instructions, setInstructions] = useState("");

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Section settings (required questions per section)
  const [sectionSettings, setSectionSettings] = useState<Record<string, { required: number | null }>>({
    mcq: { required: null },
    fillBlanks: { required: null },
    shortAnswer: { required: null },
    longAnswer: { required: null },
  });

  // UI state
  const [showSettings, setShowSettings] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === "admin") {
      fetchCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/exams");
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      question: "",
      marks: type === "mcq" || type === "fillBlanks" ? 1 : type === "shortAnswer" ? 2 : 5,
      expanded: true,
      ...(type === "mcq" && {
        options: [
          { id: generateId(), text: "", isCorrect: true },
          { id: generateId(), text: "", isCorrect: false },
          { id: generateId(), text: "", isCorrect: false },
          { id: generateId(), text: "", isCorrect: false },
        ],
      }),
      ...(type === "fillBlanks" && { correctAnswer: "" }),
    };

    // Collapse all other questions
    setQuestions((prev) => [
      ...prev.map((q) => ({ ...q, expanded: false })),
      newQuestion,
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const duplicateQuestion = (q: Question) => {
    const newQ: Question = {
      ...q,
      id: generateId(),
      expanded: true,
      options: q.options?.map((o) => ({ ...o, id: generateId() })),
    };
    setQuestions((prev) => [
      ...prev.map((q) => ({ ...q, expanded: false })),
      newQ,
    ]);
  };

  const toggleExpand = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, expanded: !q.expanded } : q))
    );
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: generateId(), text: "", isCorrect: false },
            ],
          };
        }
        return q;
      })
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    updates: Partial<MCQOption>
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId ? { ...o, ...updates } : o
            ),
          };
        }
        return q;
      })
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.map((o) => ({
              ...o,
              isCorrect: o.id === optionId,
            })),
          };
        }
        return q;
      })
    );
  };

  const deleteOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          const newOptions = q.options.filter((o) => o.id !== optionId);
          // If deleted option was correct, make first one correct
          if (!newOptions.some((o) => o.isCorrect)) {
            newOptions[0].isCorrect = true;
          }
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Calculate total marks considering required questions per section
  const calculateTotalMarks = () => {
    const mcqQuestions = questions.filter((q) => q.type === "mcq");
    const fillQuestions = questions.filter((q) => q.type === "fillBlanks");
    const shortQuestions = questions.filter((q) => q.type === "shortAnswer");
    const longQuestions = questions.filter((q) => q.type === "longAnswer");

    let total = 0;

    // MCQ - all required by default
    const mcqRequired = sectionSettings.mcq.required ?? mcqQuestions.length;
    if (mcqQuestions.length > 0) {
      const avgMarks = mcqQuestions.reduce((sum, q) => sum + q.marks, 0) / mcqQuestions.length;
      total += avgMarks * Math.min(mcqRequired, mcqQuestions.length);
    }

    // Fill blanks - all required by default
    const fillRequired = sectionSettings.fillBlanks.required ?? fillQuestions.length;
    if (fillQuestions.length > 0) {
      const avgMarks = fillQuestions.reduce((sum, q) => sum + q.marks, 0) / fillQuestions.length;
      total += avgMarks * Math.min(fillRequired, fillQuestions.length);
    }

    // Short answer - can be partial
    const shortRequired = sectionSettings.shortAnswer.required ?? shortQuestions.length;
    if (shortQuestions.length > 0) {
      const avgMarks = shortQuestions.reduce((sum, q) => sum + q.marks, 0) / shortQuestions.length;
      total += avgMarks * Math.min(shortRequired, shortQuestions.length);
    }

    // Long answer - can be partial
    const longRequired = sectionSettings.longAnswer.required ?? longQuestions.length;
    if (longQuestions.length > 0) {
      const avgMarks = longQuestions.reduce((sum, q) => sum + q.marks, 0) / longQuestions.length;
      total += avgMarks * Math.min(longRequired, longQuestions.length);
    }

    return Math.round(total);
  };

  const totalMarks = calculateTotalMarks();

  const handleSave = async (publish: boolean = false) => {
    if (!title || !courseId || questions.length === 0) {
      alert("Please fill in all required fields and add at least one question.");
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question.trim()) {
        alert("All questions must have text.");
        return;
      }
      if (q.type === "mcq") {
        if (!q.options || q.options.length < 2) {
          alert("MCQ questions must have at least 2 options.");
          return;
        }
        if (q.options.some((o) => !o.text.trim())) {
          alert("All MCQ options must have text.");
          return;
        }
      }
    }

    setSaving(true);

    // Group questions by type into sections
    const sections = [];
    const mcqQuestions = questions.filter((q) => q.type === "mcq");
    const fillQuestions = questions.filter((q) => q.type === "fillBlanks");
    const shortQuestions = questions.filter((q) => q.type === "shortAnswer");
    const longQuestions = questions.filter((q) => q.type === "longAnswer");

    if (mcqQuestions.length > 0) {
      const required = sectionSettings.mcq.required ?? mcqQuestions.length;
      const avgMarks = mcqQuestions.reduce((sum, q) => sum + q.marks, 0) / mcqQuestions.length;
      sections.push({
        type: "mcq",
        title: "Multiple Choice Questions",
        instructions: "Choose the correct answer for each question.",
        totalMarks: Math.round(avgMarks * Math.min(required, mcqQuestions.length)),
        requiredQuestions: required < mcqQuestions.length ? required : undefined,
        questions: mcqQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          marks: q.marks,
          options: q.options?.map((o) => o.text) || [],
          correctAnswer: q.options?.find((o) => o.isCorrect)?.text || "",
        })),
      });
    }

    if (fillQuestions.length > 0) {
      const required = sectionSettings.fillBlanks.required ?? fillQuestions.length;
      const avgMarks = fillQuestions.reduce((sum, q) => sum + q.marks, 0) / fillQuestions.length;
      sections.push({
        type: "fillBlanks",
        title: "Fill in the Blanks",
        instructions: "Fill in the blanks with the correct answer.",
        totalMarks: Math.round(avgMarks * Math.min(required, fillQuestions.length)),
        requiredQuestions: required < fillQuestions.length ? required : undefined,
        questions: fillQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          marks: q.marks,
          correctAnswer: q.correctAnswer || "",
        })),
      });
    }

    if (shortQuestions.length > 0) {
      const required = sectionSettings.shortAnswer.required ?? shortQuestions.length;
      const avgMarks = shortQuestions.reduce((sum, q) => sum + q.marks, 0) / shortQuestions.length;
      sections.push({
        type: "shortAnswer",
        title: "Short Answer Questions",
        instructions: required < shortQuestions.length
          ? `Answer any ${required} out of ${shortQuestions.length} questions.`
          : "Answer the following questions briefly.",
        totalMarks: Math.round(avgMarks * Math.min(required, shortQuestions.length)),
        requiredQuestions: required < shortQuestions.length ? required : undefined,
        questions: shortQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          marks: q.marks,
        })),
      });
    }

    if (longQuestions.length > 0) {
      const required = sectionSettings.longAnswer.required ?? longQuestions.length;
      const avgMarks = longQuestions.reduce((sum, q) => sum + q.marks, 0) / longQuestions.length;
      sections.push({
        type: "longAnswer",
        title: "Long Answer Questions",
        instructions: required < longQuestions.length
          ? `Answer any ${required} out of ${longQuestions.length} questions.`
          : "Answer the following questions in detail.",
        totalMarks: Math.round(avgMarks * Math.min(required, longQuestions.length)),
        requiredQuestions: required < longQuestions.length ? required : undefined,
        questions: longQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          marks: q.marks,
        })),
      });
    }

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "on_platform",
          title,
          description,
          courseId,
          duration,
          totalMarks,
          passingMarks,
          instructions,
          sections,
          isActive: publish,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setSaving(false);
        return;
      }

      router.push("/admin/exams");
    } catch {
      alert("Failed to save exam. Please try again.");
      setSaving(false);
    }
  };

  const getQuestionTypeLabel = (type: Question["type"]) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice";
      case "fillBlanks":
        return "Fill in the Blank";
      case "shortAnswer":
        return "Short Answer";
      case "longAnswer":
        return "Long Answer";
    }
  };

  const getQuestionTypeIcon = (type: Question["type"]) => {
    switch (type) {
      case "mcq":
        return <CheckCircle className="w-4 h-4" />;
      case "fillBlanks":
        return <Type className="w-4 h-4" />;
      case "shortAnswer":
        return <AlignLeft className="w-4 h-4" />;
      case "longAnswer":
        return <FileText className="w-4 h-4" />;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#075aae]" />
      </div>
    );
  }

  if ((session?.user as { role?: string })?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/exams")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Create New Exam</h1>
                <p className="text-sm text-gray-500">
                  {questions.length} questions · {totalMarks} marks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  previewMode
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Edit" : "Preview"}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#075aae] text-white rounded-lg hover:bg-[#064a8e] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Exam Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">Exam Settings</span>
            </div>
            {showSettings ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Exam Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Mid-Term Examination"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="">Select course...</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the exam"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        Passing Marks
                      </label>
                      <input
                        type="number"
                        value={passingMarks}
                        onChange={(e) => setPassingMarks(parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Instructions for Students
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Any special instructions for students taking this exam..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Questions */}
        {!previewMode ? (
          <>
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(q.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-[#075aae] text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                        {getQuestionTypeIcon(q.type)}
                        {getQuestionTypeLabel(q.type)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 truncate max-w-[200px]">
                      {q.question || "Untitled question"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {q.marks} mark{q.marks !== 1 ? "s" : ""}
                    </span>
                    {q.expanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <AnimatePresence>
                  {q.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
                        {/* Question Text */}
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Question <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={q.question}
                            onChange={(e) =>
                              updateQuestion(q.id, { question: e.target.value })
                            }
                            placeholder="Enter your question here..."
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                          />
                        </div>

                        {/* MCQ Options */}
                        {q.type === "mcq" && q.options && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Options (click to mark correct)
                            </label>
                            {q.options.map((opt, optIndex) => (
                              <div
                                key={opt.id}
                                className="flex items-center gap-2"
                              >
                                <button
                                  onClick={() => setCorrectOption(q.id, opt.id)}
                                  className={`p-1 rounded-full transition-colors ${
                                    opt.isCorrect
                                      ? "text-green-600"
                                      : "text-gray-300 hover:text-gray-400"
                                  }`}
                                >
                                  {opt.isCorrect ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>
                                <span className="text-sm text-gray-500 w-6">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) =>
                                    updateOption(q.id, opt.id, {
                                      text: e.target.value,
                                    })
                                  }
                                  placeholder={`Option ${String.fromCharCode(
                                    65 + optIndex
                                  )}`}
                                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                                    opt.isCorrect
                                      ? "border-green-300 bg-green-50"
                                      : "border-gray-200"
                                  }`}
                                />
                                {q.options!.length > 2 && (
                                  <button
                                    onClick={() => deleteOption(q.id, opt.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {q.options.length < 6 && (
                              <button
                                onClick={() => addOption(q.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#075aae] hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Option
                              </button>
                            )}
                          </div>
                        )}

                        {/* Fill in the Blanks - Correct Answer */}
                        {q.type === "fillBlanks" && (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">
                              Correct Answer (for reference)
                            </label>
                            <input
                              type="text"
                              value={q.correctAnswer || ""}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  correctAnswer: e.target.value,
                                })
                              }
                              placeholder="Enter the correct answer"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                        )}

                        {/* Marks */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              Marks:
                            </label>
                            <input
                              type="number"
                              value={q.marks}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  marks: parseInt(e.target.value) || 1,
                                })
                              }
                              min={1}
                              max={100}
                              className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => duplicateQuestion(q)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteQuestion(q.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Section Settings - Required Questions */}
            {questions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Section Settings - Required Questions</h3>
                <p className="text-xs text-gray-500 mb-4">
                  For sections with optional questions, set how many must be answered. Leave blank to require all.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {questions.filter(q => q.type === "mcq").length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">MCQ</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={questions.filter(q => q.type === "mcq").length}
                          value={sectionSettings.mcq.required ?? ""}
                          onChange={(e) => setSectionSettings(prev => ({
                            ...prev,
                            mcq: { required: e.target.value ? parseInt(e.target.value) : null }
                          }))}
                          placeholder="All"
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center"
                        />
                        <span className="text-xs text-gray-400">/ {questions.filter(q => q.type === "mcq").length}</span>
                      </div>
                    </div>
                  )}
                  {questions.filter(q => q.type === "fillBlanks").length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Fill Blanks</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={questions.filter(q => q.type === "fillBlanks").length}
                          value={sectionSettings.fillBlanks.required ?? ""}
                          onChange={(e) => setSectionSettings(prev => ({
                            ...prev,
                            fillBlanks: { required: e.target.value ? parseInt(e.target.value) : null }
                          }))}
                          placeholder="All"
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center"
                        />
                        <span className="text-xs text-gray-400">/ {questions.filter(q => q.type === "fillBlanks").length}</span>
                      </div>
                    </div>
                  )}
                  {questions.filter(q => q.type === "shortAnswer").length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Short Answer</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={questions.filter(q => q.type === "shortAnswer").length}
                          value={sectionSettings.shortAnswer.required ?? ""}
                          onChange={(e) => setSectionSettings(prev => ({
                            ...prev,
                            shortAnswer: { required: e.target.value ? parseInt(e.target.value) : null }
                          }))}
                          placeholder="All"
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center"
                        />
                        <span className="text-xs text-gray-400">/ {questions.filter(q => q.type === "shortAnswer").length}</span>
                      </div>
                    </div>
                  )}
                  {questions.filter(q => q.type === "longAnswer").length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Long Answer</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={questions.filter(q => q.type === "longAnswer").length}
                          value={sectionSettings.longAnswer.required ?? ""}
                          onChange={(e) => setSectionSettings(prev => ({
                            ...prev,
                            longAnswer: { required: e.target.value ? parseInt(e.target.value) : null }
                          }))}
                          placeholder="All"
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center"
                        />
                        <span className="text-xs text-gray-400">/ {questions.filter(q => q.type === "longAnswer").length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Question Button */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6">
              <p className="text-sm text-gray-500 text-center mb-4">
                Add a new question
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => addQuestion("mcq")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-[#075aae] rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Multiple Choice
                </button>
                <button
                  onClick={() => addQuestion("fillBlanks")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <Type className="w-4 h-4" />
                  Fill in Blank
                </button>
                <button
                  onClick={() => addQuestion("shortAnswer")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                >
                  <AlignLeft className="w-4 h-4" />
                  Short Answer
                </button>
                <button
                  onClick={() => addQuestion("longAnswer")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Long Answer
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{title || "Untitled Exam"}</h2>
              {description && <p className="text-gray-600 mt-2">{description}</p>}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {duration} minutes
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Award className="w-4 h-4" /> {totalMarks} marks
                </span>
              </div>
              {instructions && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">{instructions}</p>
                </div>
              )}
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{q.question || "Question text"}</p>
                    <span className="text-xs text-gray-400">
                      {q.marks} mark{q.marks !== 1 ? "s" : ""}
                    </span>

                    {q.type === "mcq" && q.options && (
                      <div className="mt-3 space-y-2">
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <Circle className="w-4 h-4 text-gray-300" />
                            <span className="text-sm text-gray-700">
                              {String.fromCharCode(65 + optIndex)}. {opt.text || "Option"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === "fillBlanks" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          disabled
                          placeholder="Student's answer..."
                          className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                    )}

                    {q.type === "shortAnswer" && (
                      <div className="mt-3">
                        <textarea
                          disabled
                          placeholder="Student's answer..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                    )}

                    {q.type === "longAnswer" && (
                      <div className="mt-3">
                        <textarea
                          disabled
                          placeholder="Student's detailed answer..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No questions added yet. Switch to Edit mode to add questions.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-[#075aae]">{totalMarks}</div>
              <div className="text-xs text-gray-500">Total Marks</div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-gray-600">{duration} min</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !title || !courseId || questions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Publish Exam
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
