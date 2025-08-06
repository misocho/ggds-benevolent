import { BanknotesIcon, DevicePhoneMobileIcon, BuildingLibraryIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

export default function Contribute() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">How to Contribute</h1>
          <p className="mt-4 max-w-2xl text-xl text-secondary-600 lg:mx-auto">
            Supporting each other through regular monthly contributions
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="bg-primary-50 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Monthly Contribution Amount</h2>
              <div className="text-5xl font-bold text-primary-700 mb-2">KES 200</div>
              <p className="text-primary-700">per member, per month</p>
              <p className="mt-4 text-secondary-600 max-w-2xl mx-auto">
                This affordable amount ensures that all members can participate while building a substantial fund to support those in need.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Payment Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-lg font-semibold text-secondary-900">M-PESA</h3>
                </div>
                <div className="space-y-2 text-secondary-600">
                  <p className="font-medium">Paybill: XXXXXX</p>
                  <p>Account: Your Member Number</p>
                  <p className="text-sm mt-3">Quick and convenient mobile money transfer available 24/7</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BuildingLibraryIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-lg font-semibold text-secondary-900">Bank Transfer</h3>
                </div>
                <div className="space-y-2 text-secondary-600">
                  <p className="font-medium">Bank: XXXXXX Bank</p>
                  <p>Account: XXXXXXXXXX</p>
                  <p>Branch: XXXXXX</p>
                  <p className="text-sm mt-3">Direct bank transfers or standing orders</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BanknotesIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-lg font-semibold text-secondary-900">Payroll Deduction</h3>
                </div>
                <div className="space-y-2 text-secondary-600">
                  <p>Available for participating employers</p>
                  <p className="text-sm mt-3">Automatic monthly deduction from your salary - contact HR for setup</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Contribution Deadlines</h2>
            <div className="bg-accent-50 border-l-4 border-accent-500 rounded-r-lg p-6">
              <div className="flex items-start">
                <CalendarDaysIcon className="h-6 w-6 text-accent-700 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Monthly Deadline: 5th of Every Month</h3>
                  <p className="text-secondary-600">
                    All contributions must be received by the 5th of each month to maintain active membership status and ensure eligibility for benefits.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Important Reminders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-2">Consistent Contributions</h3>
                <p className="text-secondary-600">
                  Regular monthly contributions are essential to maintain your eligibility for benefits. Missing payments may affect your ability to claim.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-2">Reference Your Member Number</h3>
                <p className="text-secondary-600">
                  Always include your member number as a reference when making payments to ensure proper crediting to your account.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-2">Keep Payment Records</h3>
                <p className="text-secondary-600">
                  Save all payment confirmations and receipts. These may be required when applying for benefits.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-2">Update Payment Details</h3>
                <p className="text-secondary-600">
                  Inform us immediately if your payment method changes to avoid any interruption in your contributions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-primary-100 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Setting Up Automatic Payments</h2>
              <p className="text-primary-800 mb-6">
                We recommend setting up a standing order or automatic payment to ensure you never miss a contribution. This can be done through:
              </p>
              <ul className="space-y-2 text-primary-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Your bank's online platform or mobile app</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>M-PESA standing order service</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Payroll deduction (where available)</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Need Help with Contributions?</h3>
              <p className="text-secondary-600 mb-4">
                Our team is here to assist you with any payment-related queries.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Contact Support
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}