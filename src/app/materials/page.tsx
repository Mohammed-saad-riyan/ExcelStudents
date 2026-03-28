"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Lock, BookOpen } from "lucide-react";

interface Material {
  courseId: string;
  courseTitle: string;
  label: string;
}

export default function MaterialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/materials")
        .then((res) => res.json())
        .then((data) => {
          setMaterials(data.materials || []);
          setLoading(false);
        });
    }
  }, [session]);

  const handleView = (courseId: string) => {
    window.open(`/api/materials?courseId=${courseId}`, "_blank");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-6 h-6 text-[#075aae]" />
            <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          </div>
          <p className="text-gray-500">Access study materials for your enrolled courses.</p>
        </motion.div>

        {materials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center border border-gray-100"
          >
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No materials available</h3>
            <p className="text-gray-500 mt-1">
              You need to be enrolled in a course to access its materials. Please contact the admin.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {materials.map((material, i) => (
              <motion.div
                key={material.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#075aae] to-[#0ea5e9] rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{material.label}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{material.courseTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleView(material.courseId)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    View PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
