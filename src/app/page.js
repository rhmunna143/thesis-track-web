"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">T</span>
            </div>
            <span className="text-white font-bold text-xl">THESIS TRACK</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-white hover:text-green-400 transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="text-white hover:text-green-400 transition-colors"
            >
              Gallery
            </a>
            <a
              href="#"
              className="text-white hover:text-green-400 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-white hover:text-green-400 transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Get Start Button */}
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
            GET START
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <blockquote className="text-2xl md:text-3xl font-light italic leading-relaxed">
              "One child, one teacher, one book, and one pen can change the
              world."
            </blockquote>
            <p className="text-lg opacity-90">- Malala Yousafzai</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors">
              GET START NOW
            </button>
          </div>

          {/* Right Content - Graduate Image */}
          <div className="flex justify-center">
            <div className="relative top-20">
              <Image
                src="/images/graduate-student.png"
                alt="Graduate student in cap and gown"
                width={400}
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
          {/* Section Header */}
          <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg inline-block">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">📋</span>
              Project Over View
            </h2>
          </div>

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
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-4">
                Write your Project Proposal
                <br />& Save PDF
              </h3>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-4">Upload</h3>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-lg text-center">
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
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-12">
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
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-sm">T</span>
                </div>
                <span className="text-white font-bold text-xl">
                  THESIS TRACK
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                ©2023 THESIS TRACK BY AHMED ALL RIGHT RESERVED
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}