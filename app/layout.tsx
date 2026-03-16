'use client';

import type { Metadata } from "next";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import NavbarS from "./components/layout/Navbar-s";
import AnimatedMain from "./components/layout/AnimatedMain";
import Container from "./components/layout/Container";
import { PageLoader } from "./components/ui/AppleLoader";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./context/ThemeContext";

// export const metadata: Metadata = {
//   title: "OpenKai - Developer Tools",
//   description: "A collection of developer tools including pastebin, URL shortener, and product management",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isProductManagement = pathname.startsWith("/product-management");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col ${isHomePage ? "pt-24" : ""}`}>
        <ThemeProvider>
          {isHomePage ? <Navbar /> : <NavbarS />}
          <AnimatedMain>
            {isProductManagement ? (
              <Suspense fallback={<PageLoader text="Loading..." color="orange" />}>
                {children}
              </Suspense>
            ) : (
              <Container>
                <Suspense fallback={<PageLoader text="Loading..." color="orange" />}>
                  {children}
                </Suspense>
              </Container>
            )}
          </AnimatedMain>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
