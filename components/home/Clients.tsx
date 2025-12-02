// app/components/TrustedGrid.tsx
"use client";

import React from "react";
import Image from "next/image";

type TrustedGridProps = {
  heading?: string;
};

const logos = [
  { src: "/client1.png", alt: "Consetetur" },
  { src: "/client2.png", alt: "Auder Speacy" },
  { src: "/client3.png", alt: "Solitudir" },
  { src: "/client4.png", alt: "PulvinarAuty" },
  { src: "/client5.png", alt: "Viability" },
  { src: "/client6.png", alt: "Bibendum" },
];

export default function TrustedGrid({ heading = "Trusted by" }: TrustedGridProps) {
  return (
    <>
      <section className="py-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg p-4">
            <ul className="grid grid-cols-3 sm:grid-cols-6 gap-4 items-center">
              {logos.map((logo, idx) => (
                <li key={`${logo.src}-${idx}`} className="flex items-center justify-center p-2">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={140}
                    height={40}
                    className="max-h-20 object-contain opacity-90 hover:opacity-100 transition-opacity"
                    priority={false}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white/80 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left image (overlap) */}
            <div className="hidden lg:block lg:col-span-3 relative">
              <div className="rounded-xl overflow-hidden shadow-xl w-full h-[340px]">
                <Image
                  src="/feature.webp"
                  alt="feature left"
                  width={420}
                  height={340}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div className="absolute -bottom-6 left-6 flex items-center gap-3 bg-white rounded-full px-3 py-2 shadow-md translate-y-6">
                <Image src="/avatar1.webp" alt="avatar" width={36} height={36} className="rounded-full" />
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">Username</div>
                  <div className="text-xs text-slate-500">Nice course!</div>
                </div>
              </div>

              <div className="absolute top-6 left-6 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full shadow">
                Marco U.
              </div>
            </div>

            {/* Heading column */}
            <div className="col-span-1 lg:col-span-6 text-center lg:text-left">
              <div className="inline-block mb-3">
                <span className="text-xs bg-sky-50 text-sky-600 px-3 py-1 rounded-full">+55,000 BUSINESSES TRUST</span>
              </div>

              <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                {heading}
              </h1>

              <div className="mx-auto lg:mx-0 mt-3 w-28 h-2 bg-amber-300 rounded-full" />

              <p className="mt-4 text-sm md:text-base text-slate-500 max-w-xl mx-auto lg:mx-0">
                In minim mollit exercitation deserunt proident officia sint excepteur aute eiusmod. Aute ullamco.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0">
                <FeatureItem title="Key feature" />
                <FeatureItem title="Key feature" />
                <FeatureItem title="Key feature" />
              </div>
            </div>

            {/* Right image */}
            <div className="hidden lg:block lg:col-span-3 relative">
              <div className="rounded-xl overflow-hidden shadow-xl w-full h-[340px]">
                <Image
                  src="/feature2.webp"
                  alt="feature right"
                  width={420}
                  height={340}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div className="absolute -bottom-6 right-6 flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md translate-y-6">
                <Image src="/avatar1.webp" alt="a" width={30} height={30} className="rounded-full ring-2 ring-white" />
                <Image src="/avatar2.webp" alt="b" width={30} height={30} className="rounded-full ring-2 ring-white" />
                <Image src="/avatar3.webp" alt="c" width={30} height={30} className="rounded-full ring-2 ring-white" />
              </div>

              <div className="absolute top-6 right-6 bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-md shadow">
                Tom B.
              </div>
            </div>
          </div>

          {/* Bottom feature cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Dynamic Subject Allocation"
              desc="Subjects are intelligently assigned based on student progress and individual learning pace, ensuring a tailored curriculum."
            />
            <FeatureCard
              title="Level-Based Content"
              desc="Content adapts to each student's current proficiency level, providing challenges that are just right for optimal growth."
            />
            <FeatureCard
              title="Interactive Quizzes & Assignments"
              desc="Engage with fun, interactive quizzes and challenging assignments designed to solidify understanding and track mastery."
            />
          </div>
        </div>
      </section>
    </>
  );
}

const FeatureItem: React.FC<{ title?: string }> = ({ title = "Key feature" }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-none w-9 h-9 rounded-md bg-sky-50 text-sky-600 grid place-items-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-sky-600">
          <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">Esse irure proident cillum anim id sunt aliqua.</div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 grid place-items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="mt-2 text-sm text-slate-500">{desc}</p>
        </div>
      </div>
    </article>
  );
};
