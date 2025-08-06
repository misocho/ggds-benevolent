import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export default function Eligibility() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">Eligibility & Terms</h1>
          <p className="mt-4 max-w-2xl text-xl text-secondary-600 lg:mx-auto">
            Understanding who qualifies and the conditions for support
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Who is Eligible?</h2>
            <div className="bg-primary-50 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Active GGDS Members</h3>
                  <p className="text-secondary-600">
                    You must be a registered and active member of Grand Granite Diaspora Sacco with up-to-date contributions to the Benevolent Fund.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Types of Support Covered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Funeral/Burial Assistance
                </h3>
                <ul className="space-y-2 text-secondary-600">
                  <li>• Death of a member</li>
                  <li>• Death of spouse</li>
                  <li>• Death of children (biological or legally adopted)</li>
                  <li>• Death of parents (member's or spouse's)</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Hospitalization Support
                </h3>
                <ul className="space-y-2 text-secondary-600">
                  <li>• Member hospitalized for 5+ consecutive days</li>
                  <li>• Major surgical procedures</li>
                  <li>• ICU admission</li>
                  <li>• Chronic illness requiring extended treatment</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Disability Support
                </h3>
                <ul className="space-y-2 text-secondary-600">
                  <li>• Permanent disability certified by a medical professional</li>
                  <li>• Loss of limb or eyesight</li>
                  <li>• Conditions preventing normal work activities</li>
                  <li>• One-time payment upon certification</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Dependent Coverage
                </h3>
                <ul className="space-y-2 text-secondary-600">
                  <li>• Spouse (legally married)</li>
                  <li>• Children under 25 years</li>
                  <li>• Parents (biological or adoptive)</li>
                  <li>• Proof of relationship required</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Conditions & Requirements</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary-900">Contributing Member Status</h3>
                  <p className="text-secondary-600 mt-1">
                    Must have made consistent monthly contributions of KES 200 (or current rate) for at least 6 months before claiming.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary-900">Grace Period for New Members</h3>
                  <p className="text-secondary-600 mt-1">
                    New members must wait 6 months from their first contribution before becoming eligible to claim benefits.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary-900">Non-Refundable Contributions</h3>
                  <p className="text-secondary-600 mt-1">
                    All contributions to the Benevolent Fund are non-refundable and cannot be withdrawn for personal use.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary-900">Documentation Required</h3>
                  <p className="text-secondary-600 mt-1">
                    Valid supporting documents must be provided (death certificates, medical reports, marriage certificates, etc.).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Exclusions</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                Cases Not Covered
              </h3>
              <ul className="space-y-2 text-red-800">
                <li>• Self-inflicted injuries or suicide</li>
                <li>• Claims submitted more than 60 days after the event</li>
                <li>• False or fraudulent claims</li>
                <li>• Events occurring during membership suspension</li>
                <li>• Cosmetic or elective procedures</li>
                <li>• Outpatient treatments (except dialysis or chemotherapy)</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="bg-accent-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Have Questions?</h3>
              <p className="text-secondary-600 mb-4">
                If you're unsure about your eligibility or need clarification on any terms, please don't hesitate to contact us.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}