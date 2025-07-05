import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import ProfileRedirectHandler from "@/components/ProfileRedirectHandler";
import React from "react";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProfileRedirectHandler />
      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-auto bg-background p-2 sm:p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
};

export default Layout;