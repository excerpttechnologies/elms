
import Hero from '../components/home/Hero'
import Teachers from '../components/home/Teachers'
import Testimonials from "../components/home/Testimonials"
import Feature from "../components/home/Feature"
import Faq from '../components/home/Faq'
import Navbar from '@/components/layout/Navbar'

export default function Home() {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen ">
       
        <Hero/>
        <Feature/>
        <Teachers/>
        <Testimonials/>
        <Faq/>
    </div>
    </>
  );
}
