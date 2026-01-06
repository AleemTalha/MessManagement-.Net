"use client"
import { useState } from 'react'
import Image from 'next/image'
import { ChefHat, Coffee, Utensils } from 'lucide-react'
import { useInView } from '@/hooks/useAnimatedCounter'

function MenuTabButton({ active, onClick, icon, label, sublabel }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-amber-500 text-white shadow-lg scale-105' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-102'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-white' : 'text-amber-500'}`}>
        {icon}
      </div>
      <div className="text-left">
        <small className={`text-xs block ${active ? 'text-amber-100' : 'text-slate-500'}`}>
          {sublabel}
        </small>
        <h6 className={`text-sm sm:text-base font-semibold mb-0 ${active ? 'text-white' : 'text-slate-900'}`}>
          {label}
        </h6>
      </div>
    </button>
  )
}

function MenuItem({ item, index }) {
  const [ref, isInView] = useInView({ threshold: 0.2 })

  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:shadow-xl hover:border-amber-200 transition-all duration-700 group ${
        isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
        <Image
          src={item.image}
          alt={item.name}
          width={80}
          height={80}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h5 className="text-base sm:text-lg font-bold text-slate-900 mb-0 group-hover:text-amber-600 transition-colors">
            {item.name}
          </h5>
          <span className="shrink-0 px-2 sm:px-3 py-1 bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
            {item.price}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  )
}

export default function MenuSection() {
  const [activeTab, setActiveTab] = useState('breakfast')

  const menuItems = {
    breakfast: [
      { name: "Real-time Attendance", price: "Free", image: "/assets/menu-1.jpg", description: "Track attendance instantly with biometric integration and automated meal distribution" },
      { name: "Smart Billing System", price: "Auto", image: "/assets/menu-2.jpg", description: "Automated billing based on actual consumption with transparent pricing" },
      { name: "Meal Planning", price: "Custom", image: "/assets/menu-3.jpg", description: "Comprehensive meal scheduling with nutritional tracking and dietary preferences" },
      { name: "Analytics Dashboard", price: "Real-time", image: "/assets/menu-4.jpg", description: "Detailed insights into consumption patterns and operational efficiency" },
      { name: "Mobile App Access", price: "24/7", image: "/assets/menu-5.jpg", description: "Access system features anytime with our user-friendly mobile application" },
      { name: "Inventory Management", price: "Smart", image: "/assets/menu-6.jpg", description: "Automated inventory tracking with low-stock alerts and procurement suggestions" },
      { name: "Payment Integration", price: "Secure", image: "/assets/menu-7.jpg", description: "Multiple payment options with secure transaction processing" },
      { name: "Customer Support", price: "Priority", image: "/assets/menu-8.jpg", description: "Dedicated support team available for technical assistance and training" },
    ],
    lunch: [
      { name: "User Management", price: "Advanced", image: "/assets/menu-1.jpg", description: "Comprehensive user profiles with role-based access and permission controls" },
      { name: "Report Generation", price: "Custom", image: "/assets/menu-2.jpg", description: "Generate detailed reports for attendance, billing, and consumption analytics" },
      { name: "Notification System", price: "Instant", image: "/assets/menu-3.jpg", description: "Real-time notifications for meal schedules, payments, and system updates" },
      { name: "Data Backup", price: "Automatic", image: "/assets/menu-4.jpg", description: "Secure cloud backup with disaster recovery and data restoration" },
      { name: "API Integration", price: "Flexible", image: "/assets/menu-5.jpg", description: "Seamless integration with existing systems and third-party applications" },
      { name: "Multi-location Support", price: "Enterprise", image: "/assets/menu-6.jpg", description: "Manage multiple mess facilities from a single centralized dashboard" },
      { name: "Compliance Tracking", price: "Automated", image: "/assets/menu-7.jpg", description: "Ensure regulatory compliance with automated audit trails and reporting" },
      { name: "Performance Metrics", price: "Detailed", image: "/assets/menu-8.jpg", description: "Track key performance indicators and operational efficiency metrics" },
    ],
    dinner: [
      { name: "Feedback System", price: "Interactive", image: "/assets/menu-1.jpg", description: "Collect and analyze user feedback to improve service quality" },
      { name: "Menu Customization", price: "Flexible", image: "/assets/menu-2.jpg", description: "Create custom menus based on dietary requirements and preferences" },
      { name: "Staff Scheduling", price: "Optimized", image: "/assets/menu-3.jpg", description: "Automated staff scheduling with shift management and attendance tracking" },
      { name: "Quality Control", price: "Monitored", image: "/assets/menu-4.jpg", description: "Maintain food quality standards with automated monitoring systems" },
      { name: "Vendor Management", price: "Integrated", image: "/assets/menu-5.jpg", description: "Manage suppliers and vendors with automated ordering and delivery tracking" },
      { name: "Energy Monitoring", price: "Smart", image: "/assets/menu-6.jpg", description: "Track energy consumption and implement cost-saving measures" },
      { name: "Waste Management", price: "Sustainable", image: "/assets/menu-7.jpg", description: "Monitor and reduce food waste with intelligent portion control" },
      { name: "Training Module", price: "Comprehensive", image: "/assets/menu-8.jpg", description: "Built-in training programs for staff development and certification" },
    ]
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h5 className="text-amber-500 font-semibold mb-2 text-sm sm:text-base uppercase tracking-wide">
            Our Features
          </h5>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            System <span className="text-amber-500">Capabilities</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Explore our comprehensive suite of features designed to revolutionize your mess management operations
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex flex-col sm:flex-row gap-3 sm:gap-4 p-2 bg-white rounded-2xl shadow-lg">
            <MenuTabButton
              active={activeTab === 'breakfast'}
              onClick={() => setActiveTab('breakfast')}
              icon={<Coffee className="w-6 h-6 sm:w-8 sm:h-8" />}
              label="Core Features"
              sublabel="Essential"
            />
            <MenuTabButton
              active={activeTab === 'lunch'}
              onClick={() => setActiveTab('lunch')}
              icon={<Utensils className="w-6 h-6 sm:w-8 sm:h-8" />}
              label="Advanced Tools"
              sublabel="Professional"
            />
            <MenuTabButton
              active={activeTab === 'dinner'}
              onClick={() => setActiveTab('dinner')}
              icon={<ChefHat className="w-6 h-6 sm:w-8 sm:h-8" />}
              label="Premium Services"
              sublabel="Enterprise"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {menuItems[activeTab].map((item, index) => (
            <MenuItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}