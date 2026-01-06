"use client"
import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useInView } from '@/hooks/useAnimatedCounter'

function ContactInfoCard({ icon, title, content, index }) {
  const [ref, isInView] = useInView({ threshold: 0.3 })

  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h5 className="font-bold text-slate-900 mb-1 text-lg">{title}</h5>
        <p className="text-slate-600 text-sm">{content}</p>
      </div>
    </div>
  )
}

function ContactForm() {
  const [ref, isInView] = useInView({ threshold: 0.2 })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    // Handle form submission
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-xl p-8 transition-all duration-700 ${
        isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Name
            </label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Email
            </label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Subject
          </label>
          <input 
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="How can we help you?"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Message
          </label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message here..."
            rows={5}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            required
          ></textarea>
        </div>
        <button 
          type="submit"
          className="w-full bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
        >
          <span>Send Message</span>
          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  )
}

export default function ContactSection() {
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-white" />,
      title: "Our Location",
      content: "123 Street, New York, USA"
    },
    {
      icon: <Phone className="w-6 h-6 text-white" />,
      title: "Call Us",
      content: "+012 345 67890"
    },
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      title: "Email Us",
      content: "info@example.com"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h5 className="text-amber-500 font-semibold mb-2 text-lg">Contact Us</h5>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Get In Touch</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Have a question or want to book a table? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <ContactInfoCard
              key={index}
              icon={info.icon}
              title={info.title}
              content={info.content}
              index={index}
            />
          ))}
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
