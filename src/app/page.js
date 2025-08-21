"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Rouge_Script } from "next/font/google";

const rougeScript = Rouge_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function HomePage() {
  return (
    <div className="min-h-scree">
      {/* Header */}
      <header className="bg-gradient-to-r bg-PrimaryBlue px-4 py-2 max-h-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Thesis Track Logo"
              width={160}
              height={60}
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-white hover:text-SuccessGreen transition-colors"
            >
              Home
            </a>
            <a
              href="/gallery"
              className="text-white hover:text-SuccessGreen transition-colors"
            >
              Gallery
            </a>
            <a
              href="/about"
              className="text-white hover:text-SuccessGreen transition-colors"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-white hover:text-SuccessGreen transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Get Start Button */}
          <Link href={"/login"}>
            <button className="bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue px-6 py-2 rounded-full font-semibold transition-colors">
              GET START
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-SecondaryBlue to-PrimaryBlue">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center px-4 lg:px-0 pt-5 lg:pt-0">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <blockquote
              className={`text-2xl md:text-5xl leading-relaxed ${rougeScript.className}`}
            >
              "One child, one teacher, one book, and one pen can change the
              world."
            </blockquote>

            <span className={`opacity-90 ${rougeScript.className} text-2xl`}>
              - Malala Yousafzai
            </span>

            <br />
            <br />

            <Link href={"/login"} className="pt-6">
              <button className="bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue px-8 py-2 rounded-full text-lg font-semibold transition-colors md:mb-5">
                GET START NOW
              </button>
            </Link>
          </div>

          {/* Right Content - Graduate Image */}
          <div className="flex justify-center">
            <div className="relative top-4 md:top-6">
              <Image
                src="/images/graduate-student.png"
                alt="Graduate student in cap and gown"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="bg-blue-50 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Description */}
          <div className="bg-white p-6 rounded-b-lg rounded-tr-lg shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              This website provides an online platform for students to submit
              their project proposals. Instructors can easily review the
              proposals and decide whether to accept or reject them. The system
              simplifies the approval process, making it faster and more
              transparent for both teachers and students. Additionally, students
              can check the status of their proposals online anytime. It is a
              modern, user-friendly, and secure web application aimed at
              digitizing the project submission and approval workflow in
              education.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-50 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className="text-white p-8 text-center flex flex-col justify-center items-center"
              style={{
                borderRadius: "0 30px",
                border: "3px solid #005580",
                background: "#036",
                boxShadow: "7px 5px 4px 0 #69B6DD",
              }}
            >
              <h3 className="text-xl font-semibold mb-4">
                Write your Project Proposal
                <br />& Save PDF
              </h3>
            </div>

            {/* Feature 2 */}
            <div
              className="text-white p-8 text-center flex flex-col justify-center items-center"
              style={{
                borderRadius: "0 30px",
                border: "3px solid #005580",
                background: "#036",
                boxShadow: "7px 5px 4px 0 #69B6DD",
              }}
            >
              <h3 className="text-xl font-semibold mb-4">Upload</h3>
            </div>

            {/* Feature 3 */}
            <div
              className="text-white p-8 text-center flex flex-col justify-center items-center"
              style={{
                borderRadius: "0 30px",
                border: "3px solid #005580",
                background: "#036",
                boxShadow: "7px 5px 4px 0 #69B6DD",
              }}
            >
              <h3 className="text-xl font-semibold mb-4">Wait For Review</h3>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-PrimaryBlue px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Contact Section */}
            <div>
              <h3 className="text-white text-xl font-semibold mb-6">
                CONTACT WITH US
              </h3>
              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Facebook size={20} />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Twitter size={20} />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Instagram size={20} />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Linkedin size={20} />
                </button>
              </div>
            </div>

            {/* Logo and Copyright */}
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
    </div>
  );
}
