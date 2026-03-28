"use client";

import { Phone, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="bg-white rounded-lg p-2">
              <Image
                src="/logo.jpg"
                alt="Excel Academy"
                width={120}
                height={35}
                style={{ height: 'auto' }}
                className="object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              A Forum of Excellence in Teachers Training
            </p>
          </div>

          {/* Contact & Links */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Phone */}
            <a
              href="tel:+919885096365"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <div className="w-9 h-9 bg-[#075aae]/20 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#60a5fa]" />
              </div>
              <span className="text-sm font-medium">+91 9885096365</span>
            </a>

            {/* Main Website */}
            <a
              href="https://excelteacherstraining.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#075aae] hover:bg-[#0652a0] rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Visit Main Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Excel Academy. All rights reserved.</p>
            <p>Student Portal - Hyderabad, India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
