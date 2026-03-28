"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  AlertCircle,
  ExternalLink,
  Clock,
  Award,
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string;
  formUrl: string | null;
  course: { title: string };
}

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

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

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <div className="p-4 sm:p-6 lg:p-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              <AnimatePresence>
                {exams.map((exam, i) => (
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
        )}
      </div>
    </div>
  );
}
