"use client";

import { useEffect } from "react";

export default function BlogSection() {
  useEffect(() => {
    // Theme parameter handling
    const themeParam = new URLSearchParams(window.location.search).get("theme");
    const dirRTL = new URLSearchParams(window.location.search).get("rtl");

    if (themeParam) document.documentElement.setAttribute("data-theme", themeParam);
    if (dirRTL === "true") document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <div className="bg-base-100 i3xre sm:py-10 lg:py-10">
      <div className="wpaot owca9 j2be9 sm:px-6 lg:px-8">
        {/* Blog Grid */}
        <div className="dpzny wfsyj ip6vv md:grid-cols-2 lg:grid-cols-3">
          {/* Heading */}
          <div className="hqh7v dyngc">
            <h2 className="text-base-content waiii t3mfo md:text-3xl lg:text-4xl">
              The Blog Corner
            </h2>
            <p className="text-base-content/80 bk5oo">
              A dedicated space for innovation, learning, and sharing knowledge
              that makes a difference.
            </p>
            <a href="#" className="btn btn-primary kqeru y1dss">
              See All Blogs
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </a>
          </div>

          {/* Blog Card 1 */}
          <BlogCard
            img="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/blog/blog-11.png"
            title="EduInsights"
            desc="Sharing expert advice and insights for educational success."
          />

          {/* Blog Card 2 */}
          <BlogCard
            img="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/blog/blog-12.png"
            title="StudySphere"
            desc="Exploring innovative study techniques and tools for academic success."
            extraClass="md:max-lg:col-span-2"
          />

          {/* Blog Card 3 */}
          <BlogCard
            img="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/blog/blog-13.png"
            title="LearnWise"
            desc="Empowering students and educators with innovative learning solutions."
          />

          {/* Blog Card 4 */}
          <BlogCard
            img="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/blog/blog-14.png"
            title="The Knowledge Hub"
            desc="A comprehensive resource for educational resources and tools."
          />

          {/* Blog Card 5 */}
          <BlogCard
            img="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/blog/blog-15.png"
            title="Scholarly Steps"
            desc="Guiding your journey through educational research and resources."
            extraClass="md:max-lg:col-span-2"
          />
        </div>
      </div>
    </div>
  );
}

function BlogCard({ img, title, desc, extraClass = "" }: any) {
  return (
    <div
      className={`zq390 dh3pr relative overflow-hidden nwdq3 group ${extraClass}`}
    >
      <figure className="v89hs">
        <img src={img} alt={title} className="size-full c7ys3" />
      </figure>

      {/* Overlay 1 */}
      <div className="absolute erng7 o4bwf kasns cd5zd pl3my ywxf9 os7ww duration-500 group-hover:opacity-0"></div>

      {/* Overlay 2 */}
      <div className="mhrum absolute inset-0 opacity-0 os7ww duration-500 group-hover:opacity-100"></div>

      {/* Content */}
      <div className="absolute f35r9 tb5n4 wdogc flex h7vz3 justify-between sly4q">
        <div className="overflow-hidden">
          <h3 className="mb-1 c9rvi font-medium lmn89">{title}</h3>
          <p className="truncate lmn89">{desc}</p>
        </div>
        <a
          href="#"
          className="btn btn-circle text-base-content [--btn-color:var(--color-base-200)]"
          aria-label="Icon Button"
        >
          <span className="icon-[tabler--chevron-right] girx5 rtl:rotate-180"></span>
        </a>
      </div>
    </div>
  );
}
