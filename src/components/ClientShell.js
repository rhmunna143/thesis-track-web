"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ClientShell({ children }) {
  const pathname = usePathname() || "/";

  // pages that should not show header/footer
  const hideShellFor = ["/login", "/signup"];
  const hide = hideShellFor.includes(pathname);

  if (hide) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r bg-PrimaryBlue px-4 py-2 max-h-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="Thesis Track Logo" width={160} height={60} />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen">Home</a>
            <a href="/gallery" className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen">Gallery</a>
            <a href="/about" className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen">About</a>
            <a href="/contact" className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen">Contact</a>
          </nav>

          <Link href="/login">
            <button className="bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue px-6 py-2 rounded-full font-semibold transform transition duration-300 hover:scale-105 hover:shadow-lg">GET START</button>
          </Link>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="bg-PrimaryBlue px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center" data-aos="fade-up">
            <div>
              <h3 className="text-white text-xl font-semibold mb-6">CONTACT WITH US</h3>
              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3" data-aos="fade-up"><Facebook size={20} /></button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3" data-aos="fade-up" data-aos-delay="60"><Twitter size={20} /></button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3" data-aos="fade-up" data-aos-delay="120"><Instagram size={20} /></button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3" data-aos="fade-up" data-aos-delay="180"><Linkedin size={20} /></button>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Image src="/images/logo.png" alt="Thesis Track Logo" width={160} height={60} />
                </div>
              </div>

              <p className="text-gray-300 text-sm">©2025 THESIS TRACK. ALL RIGHT RESERVED</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
