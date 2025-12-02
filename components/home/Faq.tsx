"use client";

import { useEffect } from "react";

export default function Faq() {
    return (
       
      <div className="dhabr i3xre sm:py-16 lg:py-24">
    <div className="wpaot owca9 j2be9 sm:px-6 lg:px-8">
      <div className="dpzny wfsyj items-center k6gdi lg:grid-cols-2">
       
        <div className="m4hp4 jfin8 relative fbde0 overflow-hidden z9y4i fbpri sm:h-143 xl:h-118">
          <div className="absolute e4bmm o4bwf">
            <img
              src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/faq/gradient-bg.png"
              className="opcwj w-full"
              alt="gradient bg circle"
            />
          </div>
          <div className="kf6hd">
            <p className="text-sm font-medium lmn89">FAQS</p>
            <h2 className="cxzfk t3mfo lmn89">Frequently Asked Questions❔</h2>
          </div>
          <div className="absolute end-0 o4bwf">
            <img
              src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/faq/faq-5.png"
              alt="Alena Lubin"
              className="gvwu7 qzwp2"
            />
          </div>
        </div>
       
        <div className="accordion ivnnl *:accordion-item-active:shadow-md">
          <div className="accordion-item active" id="what-is-larasaas">
            <button
              className="accordion-toggle inline-flex w-full items-center justify-between zvd9e egd50 ao5al"
              aria-controls="what-is-larasaas-content"
              aria-expanded="true"
            >
              What is LaraSaas? Why do I need a LaraSaas Boilerplate?
              <span
                className="icon-[tabler--chevron-right] accordion-item-active:rotate-90 qmuz4 shrink-0 ciihs duration-300 rtl:rotate-180"
              ></span>
            </button>
            <div
              id="what-is-larasaas-content"
              className="accordion-content transition-height w-full overflow-hidden duration-300"
            >
              <div className="wbxg2 vcmtr">
                <p className="text-base-content/80 text-base">
                  LaraSaas is a Laravel boilerplate specifically designed to help you launch your SaaS application
                  quickly and efficiently.
                </p>
              </div>
            </div>
          </div>
          <div className="accordion-item" id="is-demo-available">
            <button
              className="accordion-toggle inline-flex w-full items-center justify-between zvd9e egd50 ao5al"
              aria-controls="is-demo-available-content"
              aria-expanded="false"
            >
              Is there a demo available?
              <span
                className="icon-[tabler--chevron-right] accordion-item-active:rotate-90 qmuz4 shrink-0 ciihs duration-300 rtl:rotate-180"
              ></span>
            </button>
            <div
              id="is-demo-available-content"
              className="accordion-content transition-height hidden w-full overflow-hidden duration-300"
            >
              <div className="wbxg2 vcmtr">
                <p className="text-base-content/80 text-base">
                  Yes, we offer a comprehensive demo that showcases all the features and capabilities of our platform.
                  You can access it through our website and explore the interface firsthand.
                </p>
              </div>
            </div>
          </div>
          <div className="accordion-item" id="payment-providers">
            <button
              className="accordion-toggle inline-flex w-full items-center justify-between zvd9e egd50 ao5al"
              aria-controls="payment-providers-content"
              aria-expanded="false"
            >
              Which payment providers are supported?
              <span
                className="icon-[tabler--chevron-right] accordion-item-active:rotate-90 qmuz4 shrink-0 ciihs duration-300 rtl:rotate-180"
              ></span>
            </button>
            <div
              id="payment-providers-content"
              className="accordion-content transition-height hidden w-full overflow-hidden duration-300"
            >
              <div className="wbxg2 vcmtr">
                <p className="text-base-content/80 text-base">
                  We support major payment providers including Stripe, PayPal, and Square. Our platform is designed to
                  be flexible and can be integrated with additional payment gateways based on your needs.
                </p>
              </div>
            </div>
          </div>
          <div className="accordion-item" id="codebase-distribution">
            <button
              className="accordion-toggle inline-flex w-full items-center justify-between zvd9e egd50 ao5al"
              aria-controls="codebase-distribution-content"
              aria-expanded="false"
            >
              How is the codebase distributed?
              <span
                className="icon-[tabler--chevron-right] accordion-item-active:rotate-90 qmuz4 shrink-0 ciihs duration-300 rtl:rotate-180"
              ></span>
            </button>
            <div
              id="codebase-distribution-content"
              className="accordion-content transition-height hidden w-full overflow-hidden duration-300"
            >
              <div className="wbxg2 vcmtr">
                <p className="text-base-content/80 text-base">
                  The codebase is distributed through a private repository system. Upon purchase, you'll receive access
                  to the full source code and all future updates through our version control system.
                </p>
              </div>
            </div>
          </div>
          <div className="accordion-item" id="integration-question">
            <button
              className="accordion-toggle inline-flex w-full items-center justify-between zvd9e egd50 ao5al"
              aria-controls="integration-question-content"
              aria-expanded="false"
            >
              I want to integrate LaraSaas into my existing project. Should I buy it?
              <span
                className="icon-[tabler--chevron-right] accordion-item-active:rotate-90 qmuz4 shrink-0 ciihs duration-300 rtl:rotate-180"
              ></span>
            </button>
            <div
              id="integration-question-content"
              className="accordion-content transition-height hidden w-full overflow-hidden duration-300"
            >
              <div className="wbxg2 vcmtr">
                <p className="text-base-content/80 text-base">
                  While it's possible to integrate LaraSaas into existing projects, it's primarily designed as a
                  standalone boilerplate. We recommend starting fresh with LaraSaas for the best experience and to fully
                  utilize all features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    )
}    