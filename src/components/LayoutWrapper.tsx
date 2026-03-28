"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Pages that don't need sidebar (public pages)
const publicPages = ["/", "/login", "/register", "/setup"];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isPublicPage = publicPages.includes(pathname);
  const showSidebar = session && !isPublicPage;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? "ml-64" : ""}`}>
          {children}
        </main>
      </div>
      <div className={showSidebar ? "ml-64" : ""}>
        <Footer />
      </div>
    </div>
  );
}
