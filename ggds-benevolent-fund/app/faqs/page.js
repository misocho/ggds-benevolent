'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    id: 1,
    question: "What is the Benevolent Fund?",
    answer: "The GGDS Benevolent Fund is a member welfare initiative that provides financial support to members and their families during times of hardship, including bereavement, hospitalization, and permanent disability. It operates through monthly contributions from all members."
  },
  {
    id: 2,
    question: "How much do I need to contribute monthly?",
    answer: "The monthly contribution is KES 200 per member. This amount has been set to be affordable for all members while ensuring the fund can provide meaningful support when needed."
  },
  {
    id: 3,
    question: "Can I withdraw my contributions?",
    answer: "No, contributions to the Benevolent Fund are non-refundable and cannot be withdrawn. The fund operates on the principle of mutual support, where all contributions go towards helping members in need."
  },
  {
    id: 4,
    question: "What happens if I miss a contribution?",
    answer: "Missing contributions may affect your eligibility to claim benefits. If you miss payments for 3 consecutive months, your membership may be suspended, and you'll need to clear arrears and wait for the grace period before becoming eligible for benefits again."
  },
  {
    id: 5,
    question: "Who qualifies as a dependent?",
    answer: "Dependents include: your legally married spouse, biological or legally adopted children under 25 years, and your parents or your spouse's parents. You'll need to provide proof of relationship when making a claim."
  },
  {
    id: 6,
    question: "How long do I have to wait before I can claim?",
    answer: "New members must complete a 6-month waiting period from their first contribution before becoming eligible to claim benefits. This ensures the sustainability of the fund."
  },
  {
    id: 7,
    question: "What documents do I need to submit a claim?",
    answer: "Required documents vary by claim type: For bereavement - death certificate, ID copy, and proof of relationship. For hospitalization - medical reports, admission forms, and receipts. For disability - medical certificate and specialist reports."
  },
  {
    id: 8,
    question: "How quickly are claims processed?",
    answer: "Claims are typically processed within 5-7 business days from the date of submission with all required documents. Emergency cases may be expedited where possible."
  },
  {
    id: 9,
    question: "What if my claim is rejected?",
    answer: "If your claim is rejected, you'll receive a written explanation of the reasons. Common reasons include incomplete documentation, ineligibility, or the event not being covered. You can appeal the decision or resubmit with additional information."
  },
  {
    id: 10,
    question: "Are there any exclusions?",
    answer: "Yes, the fund does not cover: self-inflicted injuries or suicide, claims submitted more than 60 days after the event, false or fraudulent claims, events during membership suspension, cosmetic procedures, and routine outpatient treatments (except dialysis or chemotherapy)."
  },
  {
    id: 11,
    question: "Can I contribute more than the minimum amount?",
    answer: "While the standard contribution is KES 200, members who wish to make additional voluntary contributions to strengthen the fund are welcome to do so. However, this doesn't increase individual benefits."
  },
  {
    id: 12,
    question: "How do I update my beneficiary information?",
    answer: "You can update your beneficiary information by contacting the Benevolent Fund administrators through our contact channels. It's important to keep this information current to ensure smooth processing of any future claims."
  }
]

export default function FAQs() {
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (id) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-xl text-secondary-600">
            Find answers to common questions about the Benevolent Fund
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-secondary-900">{faq.question}</span>
                {openItems.includes(faq.id) ? (
                  <ChevronUpIcon className="h-5 w-5 text-secondary-500 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-secondary-500 flex-shrink-0 ml-2" />
                )}
              </button>
              {openItems.includes(faq.id) && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-secondary-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-secondary-600 mb-6">
            Our team is here to help. Contact us for more information about the Benevolent Fund.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}