"use client";

import React, { useEffect } from "react";
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
  useEffect(() => {
    let mounted = true;
    // Dynamically import AOS and its styles on the client to avoid SSR issues
    Promise.all([import("aos"), import("aos/dist/aos.css")])
      .then(([AOSModule]) => {
        if (!mounted) return;
        const AOS = AOSModule.default || AOSModule;
        if (AOS && typeof AOS.init === "function") {
          AOS.init({ duration: 800, once: true, disable: "mobile" });
        }
      })
      .catch((e) => {
        // ignore client-only animation errors
        // console.warn("AOS failed to load", e);
      });

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen">
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
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              Home
            </a>
            <a
              href="/gallery"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              Gallery
            </a>
            <a
              href="/about"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-white transform transition-transform duration-300 hover:scale-105 hover:text-SuccessGreen"
            >
              Contact
            </a>
          </nav>

          {/* Get Start Button */}
          <Link href={"/login"}>
            <button className="bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue px-6 py-2 rounded-full font-semibold transform transition duration-300 hover:scale-105 hover:shadow-lg">
              GET START
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-SecondaryBlue to-PrimaryBlue">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center px-4 lg:px-0 pt-5 lg:pt-0">
          {/* Left Content */}
          <div className="text-white space-y-6" data-aos="fade-right">
            <blockquote
              className={`text-2xl md:text-5xl leading-relaxed ${rougeScript.className}`}
              data-aos="fade-up"
            >
              "One child, one teacher, one book, and one pen can change the
              world."
            </blockquote>

            <span
              className={`opacity-90 ${rougeScript.className} text-2xl`}
              data-aos="fade-up"
              data-aos-delay="120"
            >
              - Malala Yousafzai
            </span>

            <br />
            <br />

            <Link href="/login" className="pt-6">
              <button
                className="bg-SuccessGreen hover:bg-green-600 text-PrimaryBlue px-8 py-2 rounded-full text-lg font-semibold transform transition duration-300 hover:scale-105 hover:shadow-lg md:mb-5"
                data-aos="zoom-in"
              >
                GET START NOW
              </button>
            </Link>
          </div>

          {/* Right Content - Graduate Image */}
          <div className="flex justify-center" data-aos="zoom-in">
            <div className="relative top-4 md:top-6 hover:scale-105 transform transition duration-500">
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
        <div className="max-w-7xl mx-auto" data-aos="fade-up">
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
              className="text-white p-8 text-center flex flex-col justify-center items-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-700 hover:to-green-400 hover:border-green-400 border-[3px] border-[#005580] bg-[#036] cursor-pointer"
              style={{
                borderRadius: "0 30px",
                boxShadow: "7px 5px 4px 0 #69B6DD",
              }}
              data-aos="zoom-in"
            >
              <h3 className="text-xl font-semibold mb-4">
                Write your Project Proposal
                <br />& Save PDF
              </h3>
            </div>

            {/* Feature 2 */}
            <div
              className="text-white p-8 text-center flex flex-col justify-center items-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-700 hover:to-green-400 hover:border-green-400 border-[3px] border-[#005580] bg-[#036] cursor-pointer"
              style={{
                borderRadius: "0 30px",
                boxShadow: "7px 5px 4px 0 #69B6DD",
              }}
              data-aos="zoom-in"
              data-aos-delay="80"
            >
              <h3 className="text-xl font-semibold mb-4">Upload</h3>
            </div>

            {/* Feature 3 */}
            <div
              className="text-white p-8 text-center flex flex-col justify-center items-center transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-700 hover:to-green-400 hover:border-green-400 border-[3px] border-[#005580] bg-[#036] cursor-pointer"
              style={{
                borderRadius: "0 30px",
                boxShadow: "7px 5px 4px 0 #69B6DD",
              }}
              data-aos="zoom-in"
              data-aos-delay="160"
            >
              <h3 className="text-xl font-semibold mb-4">Wait For Review</h3>
            </div>
          </div>

          {/* Pagination Dots */}
          <div
            className="flex justify-center mt-8 space-x-2"
            data-aos="fade-up"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full transform transition duration-300 hover:scale-125 cursor-pointer"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full transform transition duration-300 hover:scale-125 cursor-pointer"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full transform transition duration-300 hover:scale-125 cursor-pointer"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-PrimaryBlue px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="grid md:grid-cols-2 gap-8 items-center"
            data-aos="fade-up"
          >
            {/* Contact Section */}
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
