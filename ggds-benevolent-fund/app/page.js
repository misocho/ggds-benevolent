import Link from 'next/link'
import { HeartIcon, UserGroupIcon, CurrencyDollarIcon, QuestionMarkCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div>
      {/* PIVOT v2.0: Updated hero section - removed registration CTA, updated messaging */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              GGDS Benevolent Fund
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto">
              Supporting our members through bereavement. United in compassion, standing together when it matters most.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signin"
                className="group rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-700 shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Member Sign In
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="group rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-primary-700 transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                About Us
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PIVOT v2.0: Updated About section - focused on bereavement contribution system */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900">About the Fund</h2>
            <p className="mt-4 text-lg text-secondary-600 max-w-3xl mx-auto">
              The GGDS Benevolent Fund supports members during bereavement. When a member loses an immediate family member (parent, spouse, or child), all members contribute to provide financial assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Immediate Family Coverage</h3>
              <p className="text-secondary-600">
                Support provided for the loss of parents, spouse, or children
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Collective Support</h3>
              <p className="text-secondary-600">
                All active members contribute when a case is approved
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Verified Disbursement</h3>
              <p className="text-secondary-600">
                Funds are verified, collected, and disbursed to the bereaved member
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PIVOT v2.0: Updated Quick Links - removed eligibility, kept FAQ and Contact */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-8">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Link
                href="/faqs"
                className="group relative rounded-lg border border-gray-200 p-6 hover:border-primary-400 transition-colors"
              >
                <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 mb-2">
                  Frequently Asked Questions
                </h3>
                <p className="text-secondary-600">
                  Find answers to common questions about the fund
                </p>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>

              <Link
                href="/contact"
                className="group relative rounded-lg border border-gray-200 p-6 hover:border-primary-400 transition-colors"
              >
                <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 mb-2">
                  Contact Us
                </h3>
                <p className="text-secondary-600">
                  Get in touch with our benevolent fund administrators
                </p>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}