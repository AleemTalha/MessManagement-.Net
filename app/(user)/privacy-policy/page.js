"use client"
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Shield, Lock, Eye, UserCheck, Database, FileText } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number)",
        "Account credentials and authentication data",
        "Meal preferences and dietary restrictions",
        "Attendance and consumption records",
        "Billing and payment information",
        "Device and browser information",
        "Usage data and analytics"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our services",
        "To process meal bookings and attendance tracking",
        "To calculate and manage billing",
        "To communicate with you about your account",
        "To improve our services and user experience",
        "To detect and prevent fraud or unauthorized access",
        "To comply with legal obligations"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: [
        "We use industry-standard encryption for data transmission",
        "Secure servers with regular security updates",
        "Access controls and authentication mechanisms",
        "Regular security audits and monitoring",
        "Employee training on data protection",
        "Secure backup and disaster recovery procedures",
        "Compliance with data protection regulations"
      ]
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Your Rights",
      content: [
        "Access your personal data",
        "Correct inaccurate information",
        "Request deletion of your data",
        "Export your data",
        "Opt-out of marketing communications",
        "Withdraw consent for data processing",
        "Lodge a complaint with authorities"
      ]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Data Sharing",
      content: [
        "We do not sell your personal information",
        "Limited sharing with service providers",
        "Disclosure when required by law",
        "Sharing with your explicit consent",
        "Aggregated, anonymized data for analytics",
        "Third-party integrations you authorize",
        "Transfer only to countries with adequate protection"
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Cookies and Tracking",
      content: [
        "Essential cookies for authentication",
        "Performance cookies for analytics",
        "Functionality cookies for preferences",
        "You can control cookie settings",
        "Third-party cookies from integrated services",
        "Cookie consent management",
        "Data retention based on cookie type"
      ]
    }
  ]

  return (
    <>
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-slate-900 to-slate-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Your privacy is important to us. Learn how we collect, use, and protect your information.
              </p>
              <p className="text-sm text-slate-400 mt-4">Last updated: January 6, 2026</p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 leading-relaxed">
                At Mess Management System, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mt-4">
                By using our services, you agree to the collection and use of information in accordance with this policy. If you have any questions or concerns, please contact us at privacy@messmanagement.com.
              </p>
            </div>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-slate-900 rounded-full mt-2 shrink-0" />
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Additional Information</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Data Retention</h3>
                <p className="text-slate-600 leading-relaxed">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When data is no longer needed, we securely delete or anonymize it.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Children&apos;s Privacy</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our services are intended for users who are 13 years of age or older. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Changes to This Policy</h3>
                <p className="text-slate-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Contact Us</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-slate-600">
                  <p><strong>Email:</strong> privacy@messmanagement.com</p>
                  <p><strong>Phone:</strong> +92 300 1234567</p>
                  <p><strong>Address:</strong> 123 University Road, Lahore, Punjab 54000, Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Your Trust Matters</h2>
            <p className="text-xl text-slate-300 mb-8">
              We are committed to transparency and protecting your privacy
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all duration-300 font-semibold shadow-lg"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
