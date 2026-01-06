"use client"
import Image from 'next/image'
import { Quote } from 'lucide-react'
import { useInView } from '@/hooks/useAnimatedCounter'

function TestimonialCard({ testimonial, index }) {
  const [ref, isInView] = useInView({ threshold: 0.3 })

  return (
    <div
      ref={ref}
      className={`bg-white border border-slate-200 rounded-lg p-6 hover:shadow-xl transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Quote className="w-8 h-8 text-amber-500 mb-3" />
      <p className="text-slate-600 mb-4">{testimonial.text}</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-900 mb-0">{testimonial.name}</h5>
          <small className="text-xs text-slate-600">{testimonial.profession}</small>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialSection() {
  const testimonials = [
    { 
      text: "The mess management system has transformed our operations completely. Attendance tracking is now seamless, and our billing process is fully automated. Our efficiency has increased by 40%!", 
      name: "Dr. Rajesh Sharma", 
      profession: "Hostel Warden, IIT Delhi",
      image: "/assets/testimonial-1.jpg"
    },
    { 
      text: "Outstanding platform! The real-time analytics help us make data-driven decisions. Our students love the mobile app, and the support team is incredibly responsive.", 
      name: "Priya Patel", 
      profession: "Mess Manager, BITS Pilani",
      image: "/assets/testimonial-2.jpg"
    },
    { 
      text: "We've reduced food waste by 30% and improved meal planning significantly. The inventory management feature alone has saved us thousands of rupees monthly.", 
      name: "Ahmed Khan", 
      profession: "Operations Head, Corporate Mess",
      image: "/assets/testimonial-3.jpg"
    },
    { 
      text: "The system's reliability and security features give us complete peace of mind. Integration with our existing payment systems was seamless and hassle-free.", 
      name: "Dr. Meera Singh", 
      profession: "Dean of Students, JNU",
      image: "/assets/testimonial-4.jpg"
    },
  ]

  return (
    <section className="py-20 bg-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 ">
        <div className="text-center mb-12">
          <h5 className="text-amber-500 font-semibold mb-2">Testimonial</h5>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-5">Our Clients Say!!!</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
