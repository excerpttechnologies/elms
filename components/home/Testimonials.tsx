"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Parallax, Pagination, EffectFade, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper CSS
import "swiper/css";
import "swiper/css/parallax";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const testimonialSlides = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Product Designer, UI Labs",
    rating: 5,
    image: "/testimonials/user1.jpg",
    testimonial:
      "This platform transformed my workflow. The attention to detail, smooth animations, and usability is unmatched!",
    gradient: "from-[#ffffff] via-[#f7f7f7] to-[#ffffff]",
  },
  {
    id: 2,
    name: "David Chen",
    role: "Founder, Creative Suite",
    rating: 5,
    image: "/testimonials/user2.jpg",
    testimonial:
      "The best UX experience I’ve ever had. Everything feels intuitive, clean, and beautifully crafted.",
    gradient: "from-[#ffffff] via-[#fafafa] to-[#ffffff]",
  },
  {
    id: 3,
    name: "Emily Carter",
    role: "Marketing Director, NovaTech",
    rating: 5,
    image: "/testimonials/user3.jpg",
    testimonial:
      "Amazing attention to detail and functionality. It elevated our brand experience massively.",
    gradient: "from-[#ffffff] via-[#f5f5f5] to-[#ffffff]",
  },
  {
    id: 4,
    name: "James Parker",
    role: "CEO, MotionWave",
    rating: 5,
    image: "/testimonials/user4.jpg",
    testimonial:
      "Beautiful design with flawless user experience. Highly recommended for modern UI needs.",
    gradient: "from-[#ffffff] via-[#f4f4f4] to-[#ffffff]",
  },
];

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);


  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 50);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    setProgress(0);
  };

  return (
    <div className="relative h-140 mx-auto max-w-6xl overflow-hidden bg-white">
         <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl lg:text-center font-extrabold text-slate-900 leading-tight">
              Testimonial
            </h1>

      <Swiper
        modules={[Parallax, Pagination, EffectFade, Autoplay]}
        parallax={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1200}
        onSwiper={(s) => (swiperRef.current = s)}
        onSlideChange={handleSlideChange}
        className="h-100 w-full"
      >
        {testimonialSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            {/* Light Background */}
            <div
              className={`absolute inset-0  ${slide.gradient}`}
              data-swiper-parallax="-300"
            />

            {/* Subtle background circles */}
          <div
  className="absolute inset-0 opacity-[0.10]"
  data-swiper-parallax="-200"
>
  {/* Soft Blue Glow Circles */}
  <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-300 rounded-full blur-3xl" />
  <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-blue-200 rounded-full blur-3xl" />
</div>


            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center h-full px-6">
              <div className="text-center max-w-3xl">

                {/* Testimonial */}
                <p
                  className="text-xl md:text-3xl text-gray-700 font-light leading-relaxed mb-6"
                  data-swiper-parallax="-200"
                >
                  “{slide.testimonial}”
                </p>

                {/* Name */}
                <h2
                  className="text-2xl md:text-3xl text-gray-900 font-semibold"
                  data-swiper-parallax="-300"
                >
                  {slide.name}
                </h2>

                {/* Role */}
                <p
                  className="text-gray-500 mt-1 text-sm"
                  data-swiper-parallax="-300"
                >
                  {slide.role}
                </p>

                {/* Rating */}
                <div
                  className="mt-4 flex justify-center gap-1"
                  data-swiper-parallax="-300"
                >
                  {Array.from({ length: slide.rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 0 0-1.176 0l-3.37 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-4">
          {testimonialSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                swiperRef.current?.slideTo(i);
                setProgress(0);
              }}
              className={`relative transition ${
                i === activeIndex ? "scale-110" : "scale-95"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  i === activeIndex
                    ? "border-blue bg-blue"
                    : "border-blue-400 bg-transparent hover:border-blue-500"
                }`}
              />

              {/* progress circle */}
              {i === activeIndex && (
                <div className="absolute inset-0 -m-2">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="rgba(8, 0, 109, 0.2)"
                      strokeWidth="1"
                      fill="none"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="black"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 10}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 10 * (1 - progress / 100)
                      }`}
                      className="transition-all duration-100"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20"
      >
        <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center bg-white/70 hover:bg-white shadow transition">
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20"
      >
        <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center bg-white/70 hover:bg-white shadow transition">
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}
