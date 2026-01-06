"use client";
import Image from "next/image";
import Link from "next/link";
import { Utensils } from "lucide-react";
import { useAnimatedCounter, useInView } from "@/hooks/useAnimatedCounter";

function AnimatedStat({ number, label, sublabel, index }) {
  const [ref, isInView] = useInView({ threshold: 0.3 });
  const count = useAnimatedCounter(number, 2000, isInView);

  return (
    <div className="flex flex-col">
      <div
        ref={ref}
        className={`flex items-start gap-4 border-l-4 border-amber-500 pl-4 transition-all duration-700 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        style={{ transitionDelay: `${index * 200}ms` }}
      ></div>
      <div>
        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-500 mb-1">
          {count}
        </div>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 mb-0">{label}</p>
      <h6 className="text-slate-900 font-semibold uppercase text-xs sm:text-sm mb-0">
        {sublabel}
      </h6>
    </div>
  );
}

function ImageGridItem({ src, alt, index, paddingClass = "" }) {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`overflow-hidden p-1 ${paddingClass} transition-all duration-700 ${
        isInView ? "opacity-100 scale-100" : "opacity-0 scale-75"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="relative w-full h-full aspect-square">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover hover:scale-110 transition-transform duration-500"
        />
      </div>
    </div>
  );
}

export default function AboutSection() {
  const stats = [
    { number: "500", label: "Happy", sublabel: "Customers" },
    { number: "50", label: "Mess", sublabel: "Facilities" },
  ];

  const images = [
    { src: "/assets/about-1.jpg", alt: "About 1", paddingClass: "" },
    { src: "/assets/about-2.jpg", alt: "About 2", paddingClass: "pt-20 pr-20" },
    { src: "/assets/about-3.jpg", alt: "About 3", paddingClass: "pl-20 pb-20" },
    { src: "/assets/about-4.jpg", alt: "About 4", paddingClass: "" },
  ];

  return (
    <section className="bg-amber-100/35 min-h-[80vh] flex justify-center items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="grid grid-cols-2 gap-0 bg-transparent overflow-hidden">
            {images.map((image, index) => (
              <ImageGridItem
                key={index}
                src={image.src}
                alt={image.alt}
                index={index}
                paddingClass={image.paddingClass}
              />
            ))}
          </div>

          <div>
            <h5 className="text-amber-500 font-semibold mb-2 text-sm sm:text-base uppercase tracking-wide">
              About Us
            </h5>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              Smart <span className="text-amber-500">Mess</span> Solutions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 leading-relaxed">
              We revolutionize mess management with cutting-edge technology and
              streamlined processes. Our comprehensive platform handles
              everything from attendance tracking to meal planning, ensuring
              efficient operations and satisfied customers.
            </p>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed">
              Experience the future of dining facility management with automated
              billing, real-time analytics, and seamless integration. Join
              hundreds of satisfied institutions that trust our system for their
              daily operations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {stats.map((stat, index) => (
                <AnimatedStat
                  key={index}
                  number={stat.number}
                  label={stat.label}
                  sublabel={stat.sublabel}
                  index={index}
                />
              ))}
            </div>

            <Link
              href="/about"
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 hover:shadow-xl transition-all duration-300 font-semibold shadow-lg text-sm sm:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
