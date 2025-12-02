// src/app/contact/page.tsx
'use client'
import Breadcrumb from "../../components/layout/Breadcrumb";
import Navbar from "@/components/layout/Navbar";

export default function ContactPage() {
  return (
    <>
    <Navbar/>
     <div className="flex jz3o6 items-center gap-4 mt-3">
                <h1 className="text-2xl font-bold ">Contact US</h1>
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Contact Us" }
                ]}
              />
        
              
            </div>

       <div className=" i3xre sm:py-16 lg:py-24">
    <div className="wpaot owca9 j2be9 sm:px-6 lg:px-8">
      <div className="fr5x1 rdi5h sm:mb-16 lg:mb-24">
        <h2 className="text-base-content w3dp6 waiii t3mfo md:text-3xl lg:text-4xl">Stay Connected with Us</h2>
        <p className="text-base-content/80 bk5oo">
          Reach out for inquiries, support, or collaboration—we’d love to hear from you!
        </p>
      </div>
    
      <div className="zq390 lynk2 nwdq3">
        <div className="nqxya dpzny k6gdi md:grid-cols-2">
        
          <form className="o63tj" >
            <div>
              <label className="wqwbi" >Name</label>
              <input type="text" id="name" className="ljn0d fo8mv w-full" placeholder="Enter your name here..." />
            </div>
            <div>
              <label className="wqwbi" >Email</label>
              <input type="email" id="email" className="ljn0d fo8mv w-full" placeholder="Enter your Email here..." />
            </div>
            <div>
              <label className="wqwbi" >Phone Number</label>
              <input
                type="number"
                id="phone"
                className="ljn0d fo8mv w-full"
                placeholder="Enter your Phone number here..."
              />
            </div>
            <div>
              <label className="wqwbi" >Message</label>
              <textarea id="message" className="ystrl mekyd w-full" placeholder="Type here"></textarea>
            </div>
           
            <div>
              <p className="text-base-content w3dp6 font-medium">Services</p>
              <div className="dpzny vu1rt ikjxw sm:grid-cols-2">
                <div className="flex items-center rsqkx">
                  <input type="checkbox" className="d5jfq" id="websitedesign" />
                  <label className="wqwbi text-base" >Website Design</label>
                </div>
                <div className="flex items-center rsqkx">
                  <input type="checkbox" className="d5jfq" id="contentcreation" />
                  <label className="wqwbi text-base" >Content Creation</label>
                </div>
                <div className="flex items-center rsqkx">
                  <input type="checkbox" className="d5jfq" id="ux-design" />
                  <label className="wqwbi text-base" >UX Design</label>
                </div>
                <div className="flex items-center rsqkx">
                  <input type="checkbox" className="d5jfq" id="strategy-consulting" />
                  <label className="wqwbi text-base" >Strategy & Consulting</label>
                </div>
              </div>
            </div>
            <button type="submit" className="btn y1dss btn-primary w-full">
              Send Message
              <span className="icon-[tabler--send] size-5"></span>
            </button>
          </form>
        
          <div>
            
            <a href="https://www.betriebshaftpflicht.at/cyber-versicherung/">Cyber-Versicherung</a>
           
          </div>
        </div>
      </div>
     
      <div className="gdsae dpzny w-full ip6vv md:grid-cols-2 xl:grid-cols-4">
       
        <div className="zq390 bg-primary siqxi nwdq3">
          <div className="nqxya justify-center ip6vv">
            <div className="nfjpm rmjll">
              <div className="text-primary rounded-box ju8ky qr9u1">
                <span className="icon-[tabler--message-circle-2] lpbrp"></span>
              </div>
            </div>
            <div className="vi1oq">
              <h3 className="iqv7o c9rvi n7g25">Chat to Sales</h3>
              <p className="u7qxt">Speak to our friendly team</p>
            </div>
            <a href="#" className="btn text-base-content [--btn-color:var(--color-base-200)]">sales@gmail.com</a>
          </div>
        </div>
       
        <div className="zq390 lynk2 nwdq3">
          <div className="nqxya justify-center ip6vv">
            <div className="nfjpm rmjll">
              <div className="uyq3n text-primary rounded-box ju8ky">
                <span className="icon-[tabler--messages] lpbrp"></span>
              </div>
            </div>
            <div className="vi1oq">
              <h3 className="iqv7o c9rvi">Chat to Support</h3>
              <p className="text-base-content/80">We're here to help you</p>
            </div>
            <a href="#" className="btn g2v48">johndoe@gmail.com</a>
          </div>
        </div>
      
        <div className="zq390 lynk2 nwdq3">
          <div className="nqxya justify-center ip6vv">
            <div className="nfjpm rmjll">
              <div className="uyq3n text-primary rounded-box ju8ky">
                <span className="icon-[tabler--map-pin] lpbrp"></span>
              </div>
            </div>
            <div className="vi1oq">
              <h3 className="iqv7o c9rvi">Visit Us</h3>
              <p className="text-base-content/80">Visit our office</p>
            </div>
            <a href="#" className="btn g2v48">View on maps</a>
          </div>
        </div>
        
        <div className="zq390 lynk2 nwdq3">
          <div className="nqxya justify-center ip6vv">
            <div className="nfjpm rmjll">
              <div className="uyq3n text-primary rounded-box ju8ky">
                <span className="icon-[tabler--phone-call] lpbrp"></span>
              </div>
            </div>
            <div className="vi1oq">
              <h3 className="iqv7o c9rvi">Call Us</h3>
              <p className="text-base-content/80">Mon to Fri from 8am to 5pm</p>
            </div>
            <a href="#" className="btn g2v48">+124-2589-7854</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
  )
}