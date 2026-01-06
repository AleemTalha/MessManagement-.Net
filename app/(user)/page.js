import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import AboutSection from '@/components/home/AboutSection'
import MenuSection from '@/components/home/MenuSection'
import TeamSection from '@/components/home/TeamSection'
import TestimonialSection from '@/components/home/TestimonialSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <MenuSection />
      <TeamSection />
      <TestimonialSection />
      <ContactSection />
      <Footer />
    </>
  )
}
