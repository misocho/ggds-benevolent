'use client'

import { useState } from 'react'
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your message. We will get back to you within 24-48 hours.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-4 text-xl text-secondary-600">
            Get in touch with our Benevolent Fund administrators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-secondary-900">Phone</h3>
                    <p className="text-secondary-600 mt-1">+254 XXX XXX XXX</p>
                    <p className="text-sm text-secondary-500 mt-1">Monday - Friday, 9AM - 5PM EAT</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-secondary-900">Email</h3>
                    <p className="text-secondary-600 mt-1">benevolentfund@grandgranitediasporasacco.com</p>
                    <p className="text-sm text-secondary-500 mt-1">We respond within 24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-secondary-900">Office Location</h3>
                    <p className="text-secondary-600 mt-1">
                      GGDS Headquarters<br />
                      Nairobi, Kenya
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-medium text-secondary-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a
                    href="https://grandgranitediasporasacco.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm block"
                  >
                    Main SACCO Website →
                  </a>
                  <a
                    href="/faqs"
                    className="text-primary-600 hover:text-primary-700 text-sm block"
                  >
                    Frequently Asked Questions →
                  </a>
                  <a
                    href="/apply"
                    className="text-primary-600 hover:text-primary-700 text-sm block"
                  >
                    Apply for Support →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-1">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="claim">Claim Status</option>
                      <option value="contribution">Contribution Issues</option>
                      <option value="eligibility">Eligibility Questions</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 bg-accent-50 rounded-lg p-6">
              <h3 className="font-medium text-secondary-900 mb-2">Response Time</h3>
              <p className="text-secondary-600">
                We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters related to active claims, please call us directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}