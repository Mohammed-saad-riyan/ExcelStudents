"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  Play,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Baby,
  School,
  Heart,
  Lightbulb,
  Globe,
  Calendar,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const courses = [
  {
    title: "PPTTC",
    fullTitle: "Diploma in Pre & Primary Teachers Training",
    duration: "1 Year",
    description: "Master child psychology, teaching techniques, and classroom management for ages 2-10.",
    features: ["Child Psychology", "Language Learning", "Teaching Process", "School Administration"],
    color: "from-[#075aae] to-[#0ea5e9]",
    icon: Baby,
  },
  {
    title: "Montessori",
    fullTitle: "Montessori Teacher Training Course",
    duration: "1 Year",
    description: "Learn Dr. Maria Montessori's child-centered methodology and practical life activities.",
    features: ["Montessori Philosophy", "Sensorial Activities", "Practical Life", "Classroom Management"],
    color: "from-[#0ea5e9] to-[#06b6d4]",
    icon: Heart,
  },
  {
    title: "ECCE",
    fullTitle: "Diploma in Early Childhood Care & Education",
    duration: "1 Year",
    description: "Specialize in cognitive, social, and psycho-motor development in early childhood years.",
    features: ["Child Psychology", "Pedagogical Approaches", "Play & Learning", "Child-Centered Curriculum"],
    color: "from-[#06b6d4] to-[#14b8a6]",
    icon: Sparkles,
  },
  {
    title: "D.El.Ed",
    fullTitle: "Diploma in Elementary Education",
    duration: "1 Year",
    description: "Build competencies for primary and upper primary level teaching with modern pedagogy.",
    features: ["Elementary Education", "Pedagogic Process", "Special Needs", "Teaching Materials"],
    color: "from-[#075aae] to-[#7c3aed]",
    icon: School,
  },
  {
    title: "DSEN",
    fullTitle: "Diploma in Special Educational Needs",
    duration: "1 Year",
    description: "Understand and support children with special needs through inclusive education techniques.",
    features: ["Learning Disabilities", "ADHD & Autism", "Inclusive Education", "Remedial Techniques"],
    color: "from-[#7c3aed] to-[#ec4899]",
    icon: Lightbulb,
  },
  {
    title: "Communicative English",
    fullTitle: "Communicative English Program",
    duration: "Flexible",
    description: "Intensive English program covering grammar, vocabulary, speaking, writing, and listening.",
    features: ["Grammar & Vocabulary", "Speaking Skills", "Writing Skills", "Listening Practice"],
    color: "from-[#ec4899] to-[#f43f5e]",
    icon: Globe,
  },
];

const stats = [
  { icon: Users, value: "2,500+", label: "Trained Teachers" },
  { icon: BookOpen, value: "6+", label: "Diploma Courses" },
  { icon: Award, value: "100%", label: "Placement Support" },
  { icon: Star, value: "20+", label: "Years Experience" },
];

const features = [
  {
    icon: Shield,
    title: "Govt. Registered",
    description: "Registered by Government of India. Authorized Training Center under JNNYC.",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Experienced educators with 20+ years of cumulative teaching experience.",
  },
  {
    icon: Calendar,
    title: "Flexible Learning",
    description: "Choose from regular sessions, weekend classes, or live online sessions.",
  },
  {
    icon: TrendingUp,
    title: "100% Placement",
    description: "Complete placement assistance with interview training and career guidance.",
  },
  {
    icon: BookOpen,
    title: "Practical Training",
    description: "Hands-on teaching practice with real classroom experience and projects.",
  },
  {
    icon: Award,
    title: "Recognized Certification",
    description: "Diplomas recognized across schools, playschools, and educational institutions.",
  },
];

const testimonials = [
  {
    name: "Fatima",
    role: "PPTTC Graduate",
    content: "Excel Academy gave me the skills and confidence to become a successful pre-primary teacher. The practical training was invaluable.",
    rating: 5,
  },
  {
    name: "Shaheen",
    role: "Montessori Graduate",
    content: "The Montessori training program was comprehensive and well-structured. I learned so much about child-centered education approaches.",
    rating: 5,
  },
  {
    name: "Tulsi",
    role: "ECCE Graduate",
    content: "Excellent training institute with very supportive faculty. The placement assistance helped me get placed in a top school.",
    rating: 5,
  },
  {
    name: "Syeda Rabia",
    role: "D.El.Ed Graduate",
    content: "The practical exposure and teaching methodology I learned here transformed my career. Highly recommended for aspiring teachers.",
    rating: 5,
  },
  {
    name: "Shilpa S",
    role: "PPTTC Graduate",
    content: "Best teachers training institute in Hyderabad. The faculty truly cares about each student's growth and development.",
    rating: 5,
  },
  {
    name: "Tabasum",
    role: "DSEN Graduate",
    content: "The Special Needs Education program opened my eyes to inclusive teaching. Now I can support all children in my classroom.",
    rating: 5,
  },
];

const learningModes = [
  {
    title: "Regular Sessions",
    description: "Traditional classroom-based learning with face-to-face interaction, practical sessions, and peer-to-peer learning at our Hyderabad campus.",
    icon: School,
  },
  {
    title: "Weekend Classes",
    description: "Perfect for working professionals. Attend classes on weekends without disrupting your weekday schedule.",
    icon: Calendar,
  },
  {
    title: "Online Sessions",
    description: "Live interactive online classes with experienced faculty. Learn from anywhere with real-time doubt solving.",
    icon: Globe,
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50 via-white to-sky-50/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-50/20 to-sky-50/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-[#075aae] text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Govt. Registered | Authorized Training Center</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900">A Forum of</span>
                <br />
                <span className="gradient-text">Excellence in</span>
                <br />
                <span className="text-gray-900">Teachers Training</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Excel Academy - Hyderabad&apos;s premier institute for Pre-Primary,
                Primary, Montessori, and Special Education teacher training.
                Shape young minds with the right skills.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#075aae] to-[#0ea5e9] rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105"
                >
                  Enroll Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#courses"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <Play className="w-5 h-5 text-[#075aae]" />
                  Explore Courses
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {["F", "S", "T", "R"].map((letter, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#075aae] to-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">Trusted by 2,500+ educators</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] rounded-3xl blur-2xl opacity-20 scale-105" />
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 h-8 bg-gray-50 rounded-lg flex items-center px-3 text-sm text-gray-400">
                      Excel Academy - Student Portal
                    </div>
                  </div>

                  {/* Course cards mini */}
                  <div className="space-y-3">
                    {[
                      { name: "PPTTC - Pre & Primary Training", students: "450+", color: "bg-blue-50 text-blue-700" },
                      { name: "Montessori Teacher Training", students: "380+", color: "bg-purple-50 text-purple-700" },
                      { name: "ECCE - Early Childhood Education", students: "320+", color: "bg-teal-50 text-teal-700" },
                      { name: "D.El.Ed - Elementary Education", students: "290+", color: "bg-indigo-50 text-indigo-700" },
                    ].map((course, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${course.color} flex items-center justify-center`}>
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{course.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{course.students} graduates</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm text-gray-500">Admissions Open 2026</span>
                    </div>
                    <span className="text-sm font-semibold text-[#075aae]">Apply Now →</span>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-4 -right-4 bg-white shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 border border-gray-100"
                >
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">Govt. Certified</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 border border-gray-100"
                >
                  <TrendingUp className="w-5 h-5 text-[#075aae]" />
                  <span className="text-sm font-semibold text-gray-700">100% Placement</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow"
              >
                <stat.icon className="w-8 h-8 text-[#075aae] mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-sky-100 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                      <GraduationCap className="w-8 h-8 text-[#075aae]" />
                      <h4 className="font-semibold text-gray-900">Expert Faculty</h4>
                      <p className="text-sm text-gray-500">20+ years of cumulative teaching experience</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3 mt-8">
                      <BookOpen className="w-8 h-8 text-sky-600" />
                      <h4 className="font-semibold text-gray-900">Updated Curriculum</h4>
                      <p className="text-sm text-gray-500">21st century teaching methodologies</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                      <Users className="w-8 h-8 text-cyan-600" />
                      <h4 className="font-semibold text-gray-900">Personal Attention</h4>
                      <p className="text-sm text-gray-500">Small batch sizes for better learning</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3 mt-8">
                      <Award className="w-8 h-8 text-[#075aae]" />
                      <h4 className="font-semibold text-gray-900">JNNYC Authorized</h4>
                      <p className="text-sm text-gray-500">Govt. recognized certifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-[#075aae] text-sm font-medium">
                About EXCEL Academy
              </div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Shaping the Future of{" "}
                <span className="gradient-text">Education</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Excel Teachers Training Institute is a forum of excellence dedicated to
                training aspiring pre-primary, primary, and Montessori teachers. We provide
                our students with an ultimate learning platform with flexible modes of learning.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We offer a wide range of courses that provide students with comprehensive
                knowledge about teaching techniques and help them become successful,
                certified teachers. Our programs combine theoretical knowledge with
                practical classroom experience.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Registered by Government of India",
                  "Authorized Training Center under JNNYC",
                  "100% placement assistance with interview training",
                  "Practical teaching exposure in partner schools",
                  "Flexible learning: Regular, Weekend & Online modes",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#075aae] shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#075aae] to-[#0ea5e9] rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105 mt-4"
              >
                Join Us Today
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Modes */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-[#075aae] text-sm font-medium mx-auto">
              Mode of Learning
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Learn Your Way, <span className="gradient-text">At Your Pace</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer flexible learning modes so you can pursue your teaching career without
              disrupting your current schedule.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {learningModes.map((mode, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group text-center"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#075aae] transition-colors">
                  <mode.icon className="w-8 h-8 text-[#075aae] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{mode.title}</h3>
                <p className="text-gray-500 leading-relaxed">{mode.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold">See Our Training in Action</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Watch how our programs prepare educators with the skills and confidence to shape young minds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/nqye02H_H6g"
                  title="Teaching Methodology"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="mt-4 text-gray-300 font-medium">Classroom Teaching Techniques</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/UCFg9bcW7Bk"
                  title="Montessori Methods"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="mt-4 text-gray-300 font-medium">Montessori Teaching Methods</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-[#075aae] text-sm font-medium mx-auto">
              Our Courses
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Choose Your <span className="gradient-text">Teaching Path</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive diploma programs designed to make you a confident, skilled, and certified teacher.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
              >
                <div className={`h-2 bg-gradient-to-r ${course.color}`} />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${course.color} flex items-center justify-center`}>
                      <course.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{course.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">{course.fullTitle}</p>
                  <p className="text-sm text-gray-500">{course.description}</p>

                  <ul className="space-y-2">
                    {course.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#075aae] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className="block text-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-gray-50 text-gray-700 hover:bg-[#075aae] hover:text-white transition-all"
                  >
                    Enroll Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Why Choose <span className="gradient-text">EXCEL Academy?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to become a successful, certified teacher.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#075aae] transition-colors">
                  <feature.icon className="w-6 h-6 text-[#075aae] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              What Our <span className="gradient-text">Graduates Say</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from our alumni who are now successful teachers across schools and institutions.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:bg-white transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#075aae] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partner Schools */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Our Partner Institutions</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {["Canopus School", "Suyog Kidz", "Suyog International", "Craft Academy", "Fenix Tutorials", "AI PlaySchool"].map((name, i) => (
              <div key={i} className="px-6 py-3 bg-white rounded-xl border border-gray-200 text-gray-500 font-medium text-sm">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl font-bold">
              Ready to Start Your Teaching Career?
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Join thousands of successful teachers trained at Excel Academy.
              Register today and take the first step towards shaping young minds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-white text-[#075aae] rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Register Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/feedback"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                Read Student Reviews
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Govt. Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>100% Placement Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Admissions Open</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
