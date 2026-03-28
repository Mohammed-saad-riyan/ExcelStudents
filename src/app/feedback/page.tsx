"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Star,
  Send,
  User,
  ThumbsUp,
  Quote,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  subject: string;
  message: string;
  rating: number;
  category: string;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    rating: 5,
    category: "course",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = () => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);
    setSubmitted(true);
    setForm({ subject: "", message: "", rating: 5, category: "course" });
    fetchFeedbacks();
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 3000);
  };

  const categoryColors: Record<string, string> = {
    course: "bg-blue-50 text-blue-600",
    instructor: "bg-purple-50 text-purple-600",
    platform: "bg-blue-50 text-[#075aae]",
    other: "bg-gray-50 text-gray-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#075aae] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Student Feedback</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              See what our students are saying about their experience.
            </p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
            >
              <MessageSquare className="w-4 h-4" />
              Share Feedback
            </button>
          )}
        </motion.div>

        {/* Feedback Form */}
        {showForm && session && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            {submitted ? (
              <div className="text-center py-8">
                <ThumbsUp className="w-12 h-12 text-[#075aae] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Thank you for your feedback!</h3>
                <p className="text-gray-500 text-sm mt-1">Your feedback helps us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-semibold text-gray-900 text-lg">Share Your Experience</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="course">Course Content</option>
                      <option value="instructor">Instructor</option>
                      <option value="platform">Platform</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm({ ...form, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= form.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief summary of your feedback"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Feedback</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#075aae] to-[#0ea5e9] text-white rounded-xl text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Stats */}
        {feedbacks.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
              <div className="text-sm text-gray-500">Total Reviews</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {feedbacks.filter((f) => f.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-500">Positive Reviews</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-1">Overall Rating</div>
            </div>
          </div>
        )}

        {/* Feedback List */}
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No feedback yet</h3>
            <p className="text-gray-500 mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {feedbacks.map((feedback, i) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#075aae] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm">
                      {feedback.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{feedback.user.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(feedback.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[feedback.category] || categoryColors.other}`}>
                    {feedback.category}
                  </span>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <h4 className="font-semibold text-gray-900 text-sm mb-2">{feedback.subject}</h4>
                <div className="relative">
                  <Quote className="absolute -top-1 -left-1 w-4 h-4 text-gray-200" />
                  <p className="text-sm text-gray-600 leading-relaxed pl-4">{feedback.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA for non-logged users */}
        {!session && (
          <div className="bg-gradient-to-r from-[#075aae] to-[#0ea5e9] rounded-2xl p-8 text-center text-white">
            <h3 className="text-xl font-bold mb-2">Want to share your feedback?</h3>
            <p className="text-blue-100 mb-4">Login to your account to share your experience.</p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#075aae] rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              <User className="w-4 h-4" />
              Login to Share Feedback
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
