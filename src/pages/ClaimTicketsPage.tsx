import { useParams, Link, Outlet } from 'react-router-dom'
import { BlueCreateWalletButton } from '../components/mintWagmi/SmartWalletButton/walletButton'

export default function ClaimTicketPage() {
  const { eventName } = useParams()

  return (
    <div className="space-y-5">
      <div className="w-full bg-neutral rounded-xl flex flex-col justify-between p-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-5">
          <div className="flex flex-col sm:flex-row justify-start items-center space-y-3 sm:space-y-0 space-x-0 sm:space-x-5">
            <Link to="/dashboard/tickets/pastevent">
              <button className="btn btn-primary btn-outline rounded-full h-12 w-12 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </Link>
            <div className="text-xl sm:text-3xl font-semibold text-center sm:text-left">
              Claim Tickets for {eventName}
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <BlueCreateWalletButton />
          </div>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551] my-4"></div>
        <div className="text-center sm:text-left">
          <ul>Claim your collectible tickets for {eventName} now!</ul>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
