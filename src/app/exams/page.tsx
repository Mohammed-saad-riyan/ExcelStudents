"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  Clock,
  Award,
  Lock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  FileText,
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string;
  formUrl: string | null;
  type: string;
  examType: string;
  duration: number;
  totalMarks: number;
  course: { title: string };
  hasAccess: boolean;
  attempt: {
    status: string;
    score: number | null;
    completedAt: string | null;
  } | null;
}

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("submitted") === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      // Clear the query param
      router.replace("/exams");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/exams")
        .then((res) => res.json())
        .then((data) => {
          setExams(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const onPlatformExams = exams.filter(e => e.examType === "on_platform" || e.type === "on_platform");
  const googleFormExams = exams.filter(e => e.examType !== "on_platform" && e.type !== "on_platform");

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Your exam has been submitted successfully! Results will be available after grading.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Exams & Assessments</h1>
            <p className="text-sm text-gray-500">Take your online exams and view results</p>
          </motion.div>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No exams available</h3>
            <p className="text-sm text-gray-500">Check back later for new exams and assessments</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* On-Platform Exams */}
            {onPlatformExams.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#075aae]" />
                  Final Examinations
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                  <AnimatePresence>
                    {onPlatformExams.map((exam, i) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden group hover:shadow-lg transition-all"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <BookOpen className="w-6 h-6 text-[#075aae]" />
                            </div>
                            <div className="flex items-center gap-2">
                              {exam.attempt?.status === "graded" && (
                                <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                  Graded
                                </span>
                              )}
                              {exam.attempt?.status === "submitted" && (
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                  Pending
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                {exam.course.title}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#075aae] transition-colors">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                            {exam.description}
                          </p>

                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{exam.duration} mins</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Award className="w-3.5 h-3.5" />
                              <span>{exam.totalMarks} marks</span>
                            </div>
                          </div>

                          {/* Exam Status & Action */}
                          {exam.attempt?.status === "graded" ? (
                            <div className="space-y-3">
                              <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                                <span className="text-sm text-green-700">Your Score</span>
                                <span className="text-lg font-bold text-green-700">
                                  {exam.attempt.score} / {exam.totalMarks}
                                </span>
                              </div>
                              <button
                                onClick={() => router.push(`/exams/${exam.id}`)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                View Results
                              </button>
                            </div>
                          ) : exam.attempt?.status === "submitted" ? (
                            <div className="bg-amber-50 rounded-lg p-4 text-center">
                              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                              <p className="text-sm text-amber-700">Submitted - Awaiting grading</p>
                            </div>
                          ) : exam.attempt?.status === "in_progress" ? (
                            <button
                              onClick={() => router.push(`/exams/${exam.id}`)}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Continue Exam
                            </button>
                          ) : exam.hasAccess ? (
                            <button
                              onClick={() => router.push(`/exams/${exam.id}`)}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#075aae] to-[#0652a0] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Start Exam
                            </button>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Exam access not granted yet</p>
                              <p className="text-xs text-gray-400 mt-1">Contact admin for access</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Google Form Exams */}
            {googleFormExams.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-[#075aae]" />
                  Quizzes & Assessments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                  <AnimatePresence>
                    {googleFormExams.map((exam, i) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 group hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-[#075aae]" />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {exam.course.title}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#075aae] transition-colors">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          {exam.description}
                        </p>

                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>60 mins</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Award className="w-3.5 h-3.5" />
                            <span>100 marks</span>
                          </div>
                        </div>

                        {exam.formUrl ? (
                          <a
                            href={exam.formUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#075aae] to-[#0652a0] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                          >
                            <span>Start Exam</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <div className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium text-sm">
                            Coming Soon
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
