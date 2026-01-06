"use client"
import Image from 'next/image'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import { useInView } from '@/hooks/useAnimatedCounter'

function TeamMemberCard({ member, index }) {
  const [ref, isInView] = useInView({ threshold: 0.3 })

  return (
    <div
      ref={ref}
      className={`text-center rounded overflow-hidden transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 group">
        <Image
          src={member.image}
          alt={member.name}
          width={192}
          height={192}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h5 className="text-lg font-bold text-slate-900 mb-0">{member.name}</h5>
      <small className="text-slate-600">{member.designation}</small>
      <div className="flex justify-center gap-2 mt-3">
        <a href="#" className="w-10 h-10 bg-amber-500 text-white rounded flex items-center justify-center hover:bg-amber-600 transition-colors transform hover:scale-110 duration-300">
          <Facebook className="w-4 h-4" />
        </a>
        <a href="#" className="w-10 h-10 bg-amber-500 text-white rounded flex items-center justify-center hover:bg-amber-600 transition-colors transform hover:scale-110 duration-300">
          <Twitter className="w-4 h-4" />
        </a>
        <a href="#" className="w-10 h-10 bg-amber-500 text-white rounded flex items-center justify-center hover:bg-amber-600 transition-colors transform hover:scale-110 duration-300">
          <Instagram className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

export default function TeamSection() {
  const teamMembers = [
    { name: "Sarah Johnson", designation: "CEO & Founder", image: "/assets/team-1.jpg" },
    { name: "Michael Chen", designation: "Technical Director", image: "/assets/team-2.jpg" },
    { name: "Emily Rodriguez", designation: "Operations Manager", image: "/assets/team-3.jpg" },
    { name: "David Kumar", designation: "Customer Success Lead", image: "/assets/team-4.jpg" },
  ]

  return (
    <section className="pt-20 pb-12 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h5 className="text-amber-500 font-semibold mb-2">Our Team</h5>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-5">Management Experts</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
