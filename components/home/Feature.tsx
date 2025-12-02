"use client";


export default function Feature() {
 

  return (
    <section >



      <div className="i3xre sm:py-16 lg:py-21">
        <div className="wpaot owca9 j2be9 sm:px-6 lg:px-8">

          {/* Hero Section */}
          <div className="fr5x1 hqh7v rdi5h sm:mb-16 lg:mb-24">
            <h2 className="text-base-content wpaot eihgh waiii t3mfo md:text-3xl lg:text-4xl">
              Learning That Feels Effortless
            </h2>

            <p className="text-base-content/80 bk5oo">
              Build beautiful courses, engage students, and grow your education business with a powerful all-in-one LMS.
            </p>

          </div>

          {/* Feature Cards */}
          <div className="dpzny ip6vv md:grid-cols-2 lg:grid-cols-3">

            {/* Card 1 */}
            <div className="zq390 lynk2 intersect-once intersect:motion-preset-slide-left intersect:motion-ease-spring-bouncier intersect:motion-duration-800 intersect:motion-opacity-in-0 nwdq3">
              <div className="nqxya njdg2">
                <div className="dhabr rounded-box flex oqa1y jz3o6 items-center justify-center">
                  <div className="rdi5h">
                    <h5 className="text-primary text-[50px] t3mfo">12K</h5>
                    <p className="text-base-content/80 s7x45 c9rvi">happy users</p>

                    <div className="rp44n flex vaa4r">
                      <div className="nfjpm">
                        <div className="gk701">
                          <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" alt="avatar" />
                        </div>
                      </div>

                      <div className="nfjpm rmjll">
                        <div className="bg-primary gk701 lmn89">
                          <span className="icon-[tabler--star-filled] pbo9w shrink-0"></span>
                        </div>
                      </div>

                      <div className="nfjpm">
                        <div className="gk701">
                          <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-6.png" alt="avatar" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="vi1oq">
                  <h5 className="iqv7o c9rvi t3mfo">Course Management</h5>
                  <p className="text-base-content/80">
                    Easily create, organize, and manage courses with modules, lessons, quizzes, and assignments — all from one intuitive dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="zq390 lynk2 intersect-once intersect:motion-preset-slide-left intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-[400ms] nwdq3">
              <div className="nqxya njdg2">
                <div className="dhabr rounded-box flex oqa1y yxg8d w-full jz3o6 items-center justify-center">
                  <div className="o63tj">
                    <div className="rp44n vaa4r">
                      {[1,2,3,4].map((n) => (
                        <div key={n} className="nfjpm">
                          <div className="kxiyb">
                            <img src={`https://cdn.flyonui.com/fy-assets/avatar/avatar-${n}.png`} alt="avatar" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <h5 className="text-primary w3dp6 bk5oo t3mfo">Video Learning & Tracking</h5>
                    <p className="text-base-content text-xs font-medium">
                      Track student progress through videos with auto-save, <br /> resume playback, and completion analytics.
                    </p>

                    <div className="flex items-center bglhu">
                      {["Product","Design","UX","UI"].map((tag) => (
                        <div key={tag} className="j8sol rounded-field bg-base-100 border px-3 py-2">
                          <p className="text-base-content text-xs t3mfo">{tag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="vi1oq">
                  <h5 className="iqv7o c9rvi t3mfo">Assessments & Quizzes</h5>
                  <p className="text-base-content/80">
                    Build multiple question types, automate grading, and provide instant feedback to enhance learning outcomes.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="zq390 lynk2 intersect-once intersect:motion-preset-slide-left intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-[800ms] nwdq3 md:max-lg:col-span-2">

              <div className="nqxya njdg2">
                <div className="dhabr rounded-box flex oqa1y jz3o6 items-center justify-center overflow-hidden">

                  {/* Top marquee */}
                  <div className="relative ue53s w-full rotate-[-6deg] overflow-hidden">
                    <div className="xikcl rtl:animate-marqueeRight clone absolute flex qaqgz">
                      {[1,2,3,4,5,6].map((n)=>(
                        <div key={n} className="flex kf4wy items-center justify-center">
                          <img src={`https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/features/workflow-icon-${n}.png`} alt="icon" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom marquee */}
                  <div className="relative ue53s w-full rotate-[-6deg] overflow-hidden">
                    <div className="p4iql rtl:animate-marqueeLeft clone absolute flex qaqgz">
                      {[1,2,3,4,5,6,7,8].map((n)=>(
                        <div key={n} className="flex kf4wy items-center justify-center">
                          <img src={`https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/features/workflow-icon-${n}.png`} alt="icon" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="vi1oq">
                  <h5 className="iqv7o c9rvi t3mfo">Certificates & Reports</h5>
                  <p className="text-base-content/80">
                    Generate auto-certificates, monitor class performance, and access detailed student progress reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="zq390 lynk2 intersect-once intersect:motion-preset-slide-left intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-[1000ms] nwdq3 lg:col-span-2">

              <div className="nqxya njdg2">
                <div className="dhabr rounded-box relative flex oqa1y jz3o6 items-center">
                  <img
                    src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/features/features-18.png"
                    alt="Real Estate Branding"
                    className="absolute afw8k ymv10"
                  />
                </div>

                <div className="vi1oq">
                  <h5 className="iqv7o c9rvi t3mfo">Smart Learning Analytics</h5>
                  <p className="text-base-content/80">
                    Track completion rates, student engagement, quiz scores, and learning patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="zq390 lynk2 intersect-once intersect:motion-preset-slide-left intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-[1200ms] nwdq3">

              <div className="nqxya njdg2">
                <div className="dhabr rounded-box flex oqa1y jz3o6 items-center justify-center overflow-hidden">
                  <div className="relative rdi5h">

                    <div className="uyq3n absolute top-1/2 rzn4a e6fa4 hd2p4 rounded-full"></div>
                    <div className="ppfk6 absolute top-1/2 qt469 e6fa4 hd2p4 rounded-full"></div>
                    <div className="xr3vv absolute top-1/2 ew5bq e6fa4 hd2p4 rounded-full"></div>

                    <div className="p77uj bg-primary absolute top-1/2 v45dd e6fa4 rounded-full daip9">
                      <div className="absolute i0uht">
                        <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
                          <path
                            d="M15.5288 20.5968C16.0513 19.935 17.0459 19.9092 17.602 20.5431L21.3891 24.8605C22.1537 25.7327 21.5345 27.0998 20.3745 27.0998H13.1792C12.0519 27.0998 11.4216 25.7991 12.1196 24.9142L15.5288 20.5968ZM15.5395 5.07732C16.0768 4.40671 17.0963 4.40241 17.6391 5.06853L30.6303 21.0099C31.3487 21.8914 30.7216 23.2121 29.5844 23.2121H26.5952C26.1886 23.2121 25.8035 23.0287 25.5473 22.7131L17.6587 12.9894C17.1097 12.3134 16.0739 12.3268 15.5424 13.0168L8.39596 22.2931C8.1406 22.6246 7.74604 22.8194 7.32761 22.8195H4.13425C3.00257 22.8192 2.37392 21.5094 3.08151 20.6261L15.5395 5.07732Z"
                            fill="url(#paint0_linear)"
                          />
                        </svg>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="vi1oq">
                  <h5 className="iqv7o c9rvi t3mfo">Integrated Communication</h5>
                  <p className="text-base-content/80">
                    Announcements, notifications, email alerts, and discussion threads for improved engagement.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>


    </section>
  );
}
