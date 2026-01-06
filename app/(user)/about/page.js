"use client"
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Target, Eye, Award, Users, TrendingUp, Shield } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Our Mission",
      description: "To revolutionize mess management by providing an efficient, transparent, and user-friendly platform that simplifies meal planning, attendance tracking, and billing processes."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Our Vision",
      description: "To become the leading mess management solution trusted by educational institutions and organizations worldwide, setting new standards in food service administration."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our service, continuously improving and innovating to meet the evolving needs of our users."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security",
      description: "We prioritize data security and privacy, implementing robust measures to protect user information and ensure compliance with industry standards."
    }
  ]

  const team = [
    {
      name: "John Doe",
      role: "CEO & Founder",
      description: "Visionary leader with 10+ years of experience in EdTech and food service management."
    },
    {
      name: "Jane Smith",
      role: "CTO",
      description: "Tech expert passionate about creating scalable solutions for complex operational challenges."
    },
    {
      name: "Mike Johnson",
      role: "Head of Operations",
      description: "Operations specialist ensuring smooth service delivery and customer satisfaction."
    }
  ]

  return (
    <>
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">About Us</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Transforming mess management through innovation, efficiency, and dedication to excellence
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    Founded in 2024, Mess Management System was born out of a need to modernize and streamline the traditional mess operations in educational institutions and organizations.
                  </p>
                  <p>
                    We recognized the challenges faced by administrators in managing meal planning, tracking attendance, and handling billing processes manually. These inefficiencies led to errors, wasted resources, and frustrated users.
                  </p>
                  <p>
                    Our team of experienced developers and domain experts came together to create a comprehensive solution that addresses these pain points while being intuitive and easy to use.
                  </p>
                  <p>
                    Today, we serve hundreds of institutions, helping them save time, reduce costs, and improve the overall mess management experience for thousands of users.
                  </p>
                </div>
              </div>
              <div className="bg-slate-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">1000+ Happy Users</h3>
                  <p className="text-slate-600 mt-2">Across multiple institutions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Dedicated professionals committed to your success
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-16 h-16 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-slate-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">5+</div>
                <div className="text-slate-400">Years Experience</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">100+</div>
                <div className="text-slate-400">Institutions</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">1000+</div>
                <div className="text-slate-400">Active Users</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50K+</div>
                <div className="text-slate-400">Meals Tracked</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
