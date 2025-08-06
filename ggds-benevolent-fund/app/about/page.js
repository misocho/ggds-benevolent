import Image from 'next/image'

export default function About() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">About the Benevolent Fund</h1>
          <p className="mt-4 max-w-2xl text-xl text-secondary-600 lg:mx-auto">
            Supporting our community through collective care and compassion
          </p>
        </div>

        <div className="mt-10">
          <div className="prose prose-lg max-w-none text-secondary-600">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Overview</h2>
              <p className="mb-4">
                The Grand Granite Diaspora Sacco (GGDS) Benevolent Fund is a member-driven welfare initiative established to provide financial support to our members during times of hardship. Built on the principles of mutual aid and community solidarity, the fund ensures that no member faces life's challenges alone.
              </p>
              <p className="mb-4">
                Through modest monthly contributions from all members, we create a safety net that provides immediate financial assistance when it matters most. This collective approach embodies the spirit of Ubuntu - "I am because we are."
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Our Purpose</h2>
              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <p className="text-lg font-medium text-primary-900 mb-2">
                  "To provide timely financial support to members and their families during bereavement, medical emergencies, and other qualifying hardships."
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Offer immediate financial relief during family bereavements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Support members facing serious medical conditions requiring hospitalization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Assist members who become permanently disabled</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Foster a culture of mutual support within our SACCO community</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">History & Philosophy</h2>
              <p className="mb-4">
                The GGDS Benevolent Fund was established in response to the expressed needs of our members who recognized the importance of having a structured support system during difficult times. Drawing from traditional African welfare systems like "harambee" and modern cooperative principles, the fund represents our commitment to collective well-being.
              </p>
              <p className="mb-4">
                Our philosophy is simple: when one member suffers, we all feel the impact. By pooling our resources, we transform individual vulnerability into collective strength, ensuring that every member has dignity and support during their most challenging moments.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-secondary-900 mb-2">1. Regular Contributions</h3>
                  <p className="text-sm">
                    All members contribute a fixed monthly amount to build and maintain the fund
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-secondary-900 mb-2">2. Qualifying Event</h3>
                  <p className="text-sm">
                    When a member experiences a qualifying hardship, they submit an application with supporting documents
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-secondary-900 mb-2">3. Quick Disbursement</h3>
                  <p className="text-sm">
                    Upon verification, funds are disbursed quickly to provide timely support
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Our Commitment</h2>
              <div className="bg-accent-50 border-l-4 border-accent-500 p-6 rounded-r-lg">
                <p className="font-medium text-secondary-900">
                  We are committed to transparent management, fair distribution, and sustainable growth of the Benevolent Fund. Every contribution is valued, every claim is handled with compassion, and every member is treated with dignity and respect.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}