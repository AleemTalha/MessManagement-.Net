"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

export default function HeroSection() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

return (
    <>
        <section
            className="max-h-[80vh] lg:max-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/assets/bg-hero.jpg)" }}
        >
            <section className=" bg-slate-900/80 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-10 min-h-screen max-h-[80vh] lg:max-h-screen">
                    <div className="col-span-6 p-4 sm:p-5">
                        <div className="flex flex-col justify-center items-center text-center h-full px-4 sm:px-8 py-8 lg:py-0">
                            <h1
                                className="text-4xl md:text-5xl lg:text-7xl flex flex-col font-bold text-white mb-6"
                                data-aos="fade-up"
                                data-aos-delay="100"
                            >
                                <span className="text-amber-500"> Enjoy Our</span>
                                <span className="text-white"> Delicious Meals</span>
                            </h1>
                            <p
                                className="md:hidden text-sm sm:text-base text-white/90 mb-8 max-w-3xl leading-relaxed"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                Enjoy hygienic, freshly prepared meals with our smart mess management system for easy meal planning and tracking.
                            </p>
                            <p
                                className="hidden md:block text-xs sm:text-base lg:text-lg text-white/90 mb-8 max-w-3xl leading-relaxed"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                Enjoy hygienic, freshly prepared meals with a smart mess
                                management system that simplifies meal planning, attendance
                                tracking, and billing — all in one seamless platform. Our
                                innovative approach ensures personalized meal options tailored
                                to your dietary needs, while providing real-time updates on
                                menu changes and nutritional information for a healthier
                                lifestyle.
                            </p>

                            <div
                                className="flex flex-row space-x-2 md:space-x-4"
                                data-aos="fade-up"
                                data-aos-delay="300"
                            >
                                <Link
                                    href="#reservation"
                                    className="px-4 py-2 md:px-6 md:py-3 bg-white text-amber-500 font-semibold rounded hover:bg-amber-100 transition"
                                >
                                    Book a Table
                                </Link>
                                <Link
                                    href="#about"
                                    className="px-4 py-2 md:px-6 md:py-3 border border-white text-white font-semibold rounded hover:bg-white hover:text-amber-500 transition"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-4 p-2 hidden md:flex items-center justify-center">
                        <Image src="/assets/hero.png" className="animate-axis" alt="Hero Image" width={500} height={500} data-aos="zoom-in" data-aos-delay="400" />
                    </div>
                </div>
            </section>
        </section>
    </>
);
}
