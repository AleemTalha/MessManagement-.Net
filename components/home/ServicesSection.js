"use client"
import { Users, Utensils, UserCheck, Headset } from 'lucide-react'
import { useInView } from '@/hooks/useAnimatedCounter'

function ServiceCard({ icon, title, description, index }) {
  const [ref, isInView] = useInView({ threshold: 0.3 })

  return (
    <div
      ref={ref}
      className={`shrink-0 w-70 sm:w-111.25 md:w-auto text-center p-6 sm:p-8 rounded-2xl bg-linear-to-br from-white to-slate-50 border border-slate-200 shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-5 bg-amber-50 rounded-full transition-transform duration-300 hover:rotate-12">
        <div className="scale-110">
          {icon}
        </div>
      </div>
      <h5 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{title}</h5>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

export default function ServicesSection() {
  const services = [
    {
      icon: <Users className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />,
      title: "Attendance Tracking",
      description: "Automated attendance system with biometric integration and real-time monitoring to ensure accurate meal distribution and billing."
    },
    {
      icon: <Utensils className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />,
      title: "Meal Management",
      description: "Comprehensive meal planning and scheduling system with nutritional tracking and customizable menu options for different dietary needs."
    },
    {
      icon: <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />,
      title: "Smart Billing",
      description: "Automated billing system that calculates charges based on actual consumption with transparent pricing and payment integration."
    },
    {
      icon: <Headset className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />,
      title: "24/7 Support",
      description: "Round-the-clock technical support and maintenance services to ensure uninterrupted mess operations and system reliability."
    }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-linear-to-b from-slate-50 to-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            Our <span className="text-amber-500">Services</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive solutions designed to streamline your mess management operations
          </p>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide px-2">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                index={index}
              />
            ))}
          </div>
          {/* Scroll Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {services.map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-slate-300"></div>
            ))}
          </div>
        </div>

        {/* Tablet & Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mx-auto">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Smooth scroll snap */
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-mandatory > * {
          scroll-snap-align: center;
        }
      `}</style>
    </section>
  )
}