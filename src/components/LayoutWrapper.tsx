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
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {/* Main content - adjust for sidebar on desktop and mobile header */}
        <main className={`flex-1 ${showSidebar ? "lg:ml-64 pt-16 lg:pt-0" : ""}`}>
          {children}
        </main>
        {/* Footer - adjust for sidebar on desktop */}
        <div className={showSidebar ? "lg:ml-64" : ""}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
