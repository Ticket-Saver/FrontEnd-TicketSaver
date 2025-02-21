import 'bootstrap-icons/font/bootstrap-icons.css'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  const handleRedirect = () => {
    navigate('/footer/contact')
  }

  return (
    <footer className="bg-base-200 text-base-content ">
      <div className="container ">
        <div className="footer py-10 md:py-16 grid-cols-2 sm:grid-cols-4 lg:grid-cols-auto">
          <div>
            <span className="footer-title">Company</span>
            <a href="/about" className="link link-hover">
              About
            </a>
            <a onClick={handleRedirect} className="link link-hover">
              Contact us
            </a>
          </div>
          <div>
            <span className="footer-title">Legal</span>
            <a href="/footer/terms&conditions" className="link link-hover">
              Terms & Conditions
            </a>
            <a href="/footer/PrivayPolicy" className="link link-hover">
              Privacy policy
            </a>
            <a href="/footer/PCICompliance" className="link link-hover">
              PCI Compliance
            </a>
            <a href="/Faqs" className="link link-hover">
              FAQS
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center border-t border-base-300 py-4 gap-2">
          <div className="flex-grow text-center sm:text-start">
            <p>© 2022 Company, Inc. All rights reserved.</p>
          </div>
          <div className="grid grid-flow-col gap-4">
            <a
              className="link link-secondary"
              href="https://www.facebook.com/ticketsaver1?mibextid=LQQJ4d"
            >
              <i className="bi bi-facebook text-xl"></i>
            </a>
            <a
              className="link link-secondary"
              href="https://www.instagram.com/ticket.saver?igsh=MWdtdXF0b2VudGk5"
            >
              <i className="bi bi-instagram text-xl"></i>
            </a>
            <a className="link link-secondary" href="https://x.com/ticket_saver?s=08">
              <i className="bi bi-twitter text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
