import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
const Return = () => {
  const [status, setStatus] = useState(null)
  const [customerEmail, setCustomerEmail] = useState('')

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const sessionId = urlParams.get('session_id')

    fetch(`session-status?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.status)
        setCustomerEmail(data.customer_email)
        localStorage.removeItem('local_cart')
      })
  }, [])

  if (status === 'open') {
    return <Navigate to="/checkout" />
  }
  // Mejorar formato, corregir correo:
  if (status === 'complete') {
    return (
      <section className="w-full h-auto bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-xl p-6 flex flex-col justify-center items-center">
          <div className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-4">
            Payment Successful!
          </div>
          <div className="w-full h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551] my-4"></div>
          <div className="text-base md:text-lg text-center text-gray-600">
            <p className="mb-4">
              Thank you for your purchase! A confirmation email will be sent to{' '}
              <strong className="text-gray-800">{customerEmail}</strong>. If you have any questions
              or need assistance, please feel free to email us at{' '}
              <a href="mailto:ticketing@ticketsaver.net" className="text-[#E779C1] hover:underline">
                ticketing@ticketsaver.net
              </a>
              .
            </p>
            <p>
              <a href="/" className="text-[#221551] hover:underline">
                Back to Home
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8">
          <img src="/logos/ticketsaver-logo.svg" alt="Your Logo" className="max-w-xs" />
        </div>
      </section>
    )
  }

  return null
}

export default Return
