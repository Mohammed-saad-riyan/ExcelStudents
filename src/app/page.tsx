"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Shield, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  "Access course materials & notes",
  "Take exams & track progress",
  "Submit assignments online",
  "Get instant feedback",
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg"
          >
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/logo.jpg"
                alt="Excel Academy"
                width={180}
                height={50}
                style={{ height: 'auto' }}
                className="object-contain"
              />
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Student Portal
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Access your courses, track your progress, and excel in your teaching career journey.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Continue as
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login?role=student" className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between bg-gradient-to-r from-[#075aae] to-[#0652a0] text-white rounded-xl px-5 py-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold">Student</span>
                        <p className="text-xs text-blue-100">Access your courses</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Link>

                <Link href="/login?role=admin" className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between bg-white border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Admin</span>
                        <p className="text-xs text-gray-500">Manage portal</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Register link */}
            <p className="mt-8 text-sm text-gray-500">
              New student?{" "}
              <Link href="/register" className="text-[#075aae] font-medium hover:underline">
                Register for admission
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right side - Hero Image */}
        <div className="hidden lg:block lg:w-[55%] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#075aae]/5 to-transparent" />
          <Image
            src="/hero-teachers.png"
            alt="Teachers in training session"
            fill
            sizes="55vw"
            className="object-cover"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent w-32" />

          {/* Stats overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#075aae]">500+</p>
                <p className="text-xs text-gray-600">Students Trained</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-2xl font-bold text-[#075aae]">4</p>
                <p className="text-xs text-gray-600">Courses Offered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#075aae]">100%</p>
                <p className="text-xs text-gray-600">Placement Support</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Hero Image */}
      <div className="lg:hidden relative h-64 -mt-4">
        <Image
          src="/hero-teachers.png"
          alt="Teachers in training session"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>
    </div>
  );
}
