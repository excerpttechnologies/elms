'use client'
import Breadcrumb from "../../components/layout/Breadcrumb";
import Navbar from "@/components/layout/Navbar";


export default function about() {
  return (
    <>
    <Navbar/>
     <div className="flex jz3o6 items-center gap-4 mt-3">
            <h1 className="text-2xl font-bold ">About Us</h1>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "About us" }
            ]}
          />
    
          
        </div>

    <div className="wpaot owca9 j2be9 sm:px-6 lg:px-8 mt-6 mb-6">
      <div className="flex jz3o6 bgp2x tnh37">
        <div className="dpzny djxe2 lg:grid-cols-2">
        
          <div className="flex jz3o6 bgp2x">
            
            <div className="hqh7v">
              <p className="text-primary text-sm font-medium vxiam">About Us</p>
              <h2 className="text-base-content waiii t3mfo md:text-3xl lg:text-4xl">
                Building a Legacy of Excellence
              </h2>
              <p className="text-base-content/80 bk5oo">
                Our story is a testament to the power of collaboration and resilience. Together, we have navigated
                challenges, celebrated milestones, and crafted a narrative of growth and achievement in the construction
                industry.
              </p>
            </div>

         
            <div className="dpzny ip6vv md:grid-cols-2">
              
              <div
                className="zq390 ylqpi hover:border-primary lynk2 m233p nwdq3 u2n5x duration-300"
              >
                <div className="l7s0y er88f">
                  <h5 className="iqv7o bk5oo font-medium">50+ years</h5>
                </div>
                <div className="nqxya hgzwk">Bringing architectural visions to life for 50 years.</div>
              </div>
             
              <div
                className="zq390 ylqpi hover:border-primary lynk2 m233p nwdq3 u2n5x duration-300"
              >
                <div className="l7s0y er88f">
                  <h5 className="iqv7o bk5oo font-medium">100+ Projects</h5>
                </div>
                <div className="nqxya hgzwk">Delivered precisely with quality commitment.</div>
              </div>
             
              <div
                className="zq390 ylqpi hover:border-primary lynk2 m233p nwdq3 u2n5x duration-300"
              >
                <div className="l7s0y er88f">
                  <h5 className="iqv7o bk5oo font-medium">20+ Awards</h5>
                </div>
                <div className="nqxya hgzwk">Recognizing our innovation and dedication.</div>
              </div>
          
              <div
                className="zq390 ylqpi hover:border-primary lynk2 m233p nwdq3 u2n5x duration-300"
              >
                <div className="l7s0y er88f">
                  <h5 className="iqv7o bk5oo font-medium">99% Success</h5>
                </div>
                <div className="nqxya hgzwk">Showing our commitment to client satisfaction.</div>
              </div>
            </div>

           
            <a href="#" className="btn btn-primary y1dss max-md:btn-block q2u0u">
              Read More
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </a>
          </div>

        

          <img
            src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/about/about-4.png"
            alt="Faq-Image-1"
            className="rounded-box n85ea w-full c7ys3"
          />
        </div>

        
        <div className="dpzny k6gdi md:grid-cols-3">
        
          <div className="zq390 border-base-content/20 border m233p nwdq3 md:max-w-sm">
            <div className="l7s0y er88f">
              <h5 className="iqv7o flex items-center sly4q bk5oo">
                <span className="icon-[tabler--circle-check] text-base-content size-6 shrink-0 rtl:rotate-y-180"></span>
                Why Choose Us?
              </h5>
            </div>
            <div className="nqxya hgzwk">Our project management tools boost collaboration and streamline processes.</div>
          </div>
          
          <div className="zq390 border-base-content/20 border m233p nwdq3 md:max-w-sm">
            <div className="l7s0y er88f">
              <h5 className="iqv7o flex items-center sly4q bk5oo">
                <span className="icon-[tabler--circle-check] text-base-content size-6 shrink-0 rtl:rotate-y-180"></span>
                Our Vision
              </h5>
            </div>
            <div className="nqxya hgzwk">Our project management tools boost collaboration and streamline processes.</div>
          </div>
       
          <div className="zq390 border-base-content/20 border m233p nwdq3 md:max-w-sm">
            <div className="l7s0y er88f">
              <h5 className="iqv7o flex items-center sly4q bk5oo">
                <span className="icon-[tabler--circle-check] text-base-content size-6 shrink-0 rtl:rotate-y-180"></span>
                Our Team
              </h5>
            </div>
            <div className="nqxya hgzwk">Our professionals are dedicated to exceptional results and service.</div>
          </div>
        </div>
      </div>
    </div>
  </>
  )}