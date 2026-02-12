import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AnimatedMain from "./components/layout/AnimatedMain";

export const metadata: Metadata = {
  title: "OpenKai - Developer Tools",
  description: "A collection of developer tools including pastebin, URL shortener, and product management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white min-h-screen flex flex-col">
        <Navbar />
        <AnimatedMain>
          {children}
        </AnimatedMain>
        <Footer />
      </body>
    </html>
  );
}
