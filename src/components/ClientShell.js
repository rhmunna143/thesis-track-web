"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Home, FolderOpen, Info, Phone } from "lucide-react";

export default function ClientShell({ children }) {
  const pathname = usePathname() || "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // toggle mobile menu
  const toggleMenu = () => setIsMenuOpen((s) => !s);

  // close mobile menu when route changes
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // pages or route prefixes that should not show header/footer (auth pages + dashboard group)
  const hideShellFor = ["/login", "/signup"];
  const hidePrefixes = ["/admin", "/teacher", "/student"];
  const hide =
    hideShellFor.includes(pathname) ||
    hidePrefixes.some((p) => pathname.startsWith(p));

  if (hide) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r bg-PrimaryBlue px-4 py-2 max-h-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Thesis Track Logo"
              width={160}
              height={60}
            />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="sm:hidden text-white p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            {isMenuOpen ? <span></span> : <Menu size={24} />}
          </button>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-50 sm:hidden">
              {/* Background Overlay */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={toggleMenu}
              ></div>

              {/* Menu Panel */}
              <div
                className="absolute left-0 top-4 h-full w-80 shadow-xl transform transition-transform duration-300 ease-in-out"
                style={{
                  borderRadius: "0 35px 0 0",
                  background: "rgba(0, 51, 102, 0.90)",
                  boxShadow: "1px 1px 5px 0 #F4F6F9 inset",
                }}
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-blue-700">
                  <h2 className="text-white text-xl font-bold">MENU</h2>
                  <button
                    onClick={toggleMenu}
                    className="text-white p-2 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex flex-col p-6 space-y-6">
                  <Link
                    href="/"
                    className="flex items-center space-x-4 text-white hover:text-SuccessGreen transition-colors group"
                    onClick={toggleMenu}
                  >
                    <div className="p-2 bg-blue-700 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Home size={20} />
                    </div>
                    <span className="text-lg font-medium">Home</span>
                  </Link>

                  <Link
                    href="/gallery"
                    className="flex items-center space-x-4 text-white hover:text-SuccessGreen transition-colors group"
                    onClick={toggleMenu}
                  >
                    <div className="p-2 bg-blue-700 rounded-lg group-hover:bg-green-600 transition-colors">
                      <FolderOpen size={20} />
                    </div>
                    <span className="text-lg font-medium">Gallery</span>
                  </Link>

                  <Link
                    href="/about"
                    className="flex items-center space-x-4 text-white hover:text-SuccessGreen transition-colors group"
                    onClick={toggleMenu}
                  >
                    <div className="p-2 bg-blue-700 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Info size={20} />
                    </div>
                    <span className="text-lg font-medium">About</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="flex items-center space-x-4 text-white hover:text-SuccessGreen transition-colors group"
                    onClick={toggleMenu}
                  >
                    <div className="p-2 bg-blue-700 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Phone size={20} />
                    </div>
                    <span className="text-lg font-medium">Contact</span>
                  </Link>
                </nav>

                {/* Mobile Get Start Button */}
                <div className="absolute bottom-8 left-6 right-6">
                  <Link href="/login" onClick={toggleMenu}>
                    <button className="w-full bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue py-3 rounded-full font-semibold transform transition duration-300 hover:scale-105 hover:shadow-lg">
                      GET START NOW
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Desktop / Tablet Navigation */}
          <nav className="hidden sm:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              Home
            </Link>
            <Link
              href="/gallery"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              Gallery
            </Link>
            <Link
              href="/about"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              Contact
            </Link>
          </nav>

          <Link href="/login">
            <button className="hidden sm:inline-flex bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue px-6 py-2 rounded-full font-semibold transform transition duration-300 hover:scale-105 hover:shadow-lg">
              GET START
            </button>
          </Link>

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Thesis Track Logo"
              width={160}
              height={60}
            />
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-PrimaryBlue px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="grid md:grid-cols-2 gap-8 items-center"
            data-aos="fade-up"
          >
            <div>
              <h3 className="text-white text-xl font-semibold mb-6">
                CONTACT WITH US
              </h3>
              <div className="flex space-x-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3"
                  data-aos="fade-up"
                >
                  <Facebook size={20} />
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3"
                  data-aos="fade-up"
                  data-aos-delay="60"
                >
                  <Twitter size={20} />
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3"
                  data-aos="fade-up"
                  data-aos-delay="120"
                >
                  <Instagram size={20} />
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform duration-300 hover:scale-110 hover:rotate-3"
                  data-aos="fade-up"
                  data-aos-delay="180"
                >
                  <Linkedin size={20} />
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Image
                    src="/images/logo.png"
                    alt="Thesis Track Logo"
                    width={160}
                    height={60}
                  />
                </div>
              </div>

              <p className="text-gray-300 text-sm">
                ©2025 THESIS TRACK. ALL RIGHT RESERVED
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
