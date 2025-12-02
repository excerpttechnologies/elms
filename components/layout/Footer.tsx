"use client";

import Image from "next/image";

export default function Footer() {
  return (
        <footer className="footer bg-base-200/60 px-6 py-4">
  <div className="flex w-full flex-wrap items-center justify-between">
    <div className="flex items-center gap-2 text-xl font-bold text-base-content">
     
      <span>E-Learning</span>
    </div>
    <aside className="grid-flow-col items-center">
      <p> ©2025 <a className="link link-hover font-medium" href="#">E-Learning</a> </p>
    </aside>
    <div className="flex h-5 gap-4">
      <a href="#" className="link" aria-label="Github Link">
        <span className="icon-[tabler--brand-github] size-5"></span>
      </a>
      <a href="#" className="link" aria-label="Facebook Link">
        <span className="icon-[tabler--brand-facebook] size-5"></span>
      </a>
      <a href="#" className="link" aria-label="X Link">
        <span className="icon-[tabler--brand-x] size-5"></span>
      </a>
      <a href="#" className="link" aria-label="Google Link">
        <span className="icon-[tabler--brand-google] size-5"></span>
      </a>
    </div>
  </div>
</footer>
  )
}