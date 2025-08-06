import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-secondary-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">GGDS Benevolent Fund</h3>
            <p className="text-secondary-300 text-sm">
              Supporting our members in times of need through collective contribution and care.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-secondary-300 hover:text-white text-sm">
                  About the Fund
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="text-secondary-300 hover:text-white text-sm">
                  Eligibility & Terms
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-secondary-300 hover:text-white text-sm">
                  Apply for Support
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-secondary-300 hover:text-white text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <p className="text-secondary-300 text-sm mb-2">
              Email: benevolentfund@grandgranitediasporasacco.com
            </p>
            <p className="text-secondary-300 text-sm mb-4">
              Phone: +254 XXX XXX XXX
            </p>
            <Link 
              href="https://grandgranitediasporasacco.com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-400 hover:text-accent-300 text-sm font-medium"
            >
              Visit Main SACCO Website →
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-secondary-700 text-center text-secondary-400 text-sm">
          © {new Date().getFullYear()} Grand Granite Diaspora Sacco. All rights reserved.
        </div>
      </div>
    </footer>
  )
}