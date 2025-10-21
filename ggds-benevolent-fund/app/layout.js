import '../styles/globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Providers from '../components/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'GGDS Benevolent Fund',
  description: 'Grand Granite Diaspora Sacco Benevolent Fund - Supporting our members in times of need',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}