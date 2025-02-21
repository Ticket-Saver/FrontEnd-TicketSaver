import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import TicketIcon from '../../assets/icons/ticket.svg'
/*
import ProfileIcon from '../../assets/icons/profile.svg'
import SettingsIcon from '../../assets/icons/settings.svg'
import HelpIcon from '../../assets/icons/help.svg'
import WalletIcon from '../../assets/icons/wallet.svg'
*/
import { useState } from 'react'

export default function Sidebar() {
  const { isAuthenticated, user } = useAuth0()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <button
        className="p-4 fixed z-10 bottom-5 left-5 btn btn-primary btn-circle px-10 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? 'Close' : 'Menu'}
      </button>
      <div
        className={`${
          isSidebarOpen ? 'flex' : 'lg:flex hidden'
        } fixed lg:static top-19 left-0 flex-col bg-[#180F3C] text-white w-80 min-h-screen h-full p-4`}
      >
        <div className="flex flex-col items-center py-8">
          <img
            src={isAuthenticated && user?.picture ? user?.picture : '/user.png'}
            alt="Profile"
            className="w-40 h-40 rounded-full mb-4"
          />
          <h2 className="text-lg mb-4">{user?.name}</h2>
        </div>
        <nav className="flex flex-col space-y-3 px-4">
          <Link
            to="/dashboard/tickets/upcomingevent"
            className="p-2 px-5 rounded-xl flex items-center bg-[#1A0F40] text-white hover:bg-[#221551] focus:bg-[#221551] font-semibold"
          >
            <img src={TicketIcon} alt="Ticket Icon" className="h-6 w-6 text-white mr-2" />
            My Tickets
          </Link>
          <div className="border-b border-[#221551]"></div>
        </nav>
      </div>
    </>
  )
}
/*
<Link
            to='/dashboard/profile'
            className='p-2 px-5 rounded-xl flex items-center text-white bg-[#1A0F40] hover:bg-[#221551] focus:bg-[#221551] font-semibold'
          >
            <img src={ProfileIcon} alt='Profile Icon' className='h-6 w-6 text-white mr-2' />
            My Profile
          </Link>
*/

/* 
          <div className='border-b border-[#221551]'></div>
          <Link
            to='/dashboard/settings'
            className='p-2 px-5 rounded-xl flex items-center text-white bg-[#1A0F40] hover:bg-[#221551] focus:bg-[#221551] font-semibold'
          >
            <img src={SettingsIcon} alt='Settings Icon' className='h-6 w-6 text-white mr-2' />
            Settings
          </Link>
          <div className='border-b border-[#221551]'></div>
          <Link
            to='/dashboard/web3'
            className='p-2 px-5 rounded-xl flex items-center text-white bg-[#1A0F40] hover:bg-[#221551] focus:bg-[#221551] font-semibold'
          >
            <img src={WalletIcon} alt='Settings Icon' className='h-6 w-6 text-white mr-2' />
            Web3
          </Link>
          <div className='border-b border-[#221551]'></div>
          <Link
            to='/dashboard/help'
            className='p-2 px-5 rounded-xl flex items-center text-white bg-[#1A0F40] hover:bg-[#221551] focus:bg-[#221551] font-semibold'
          >
            <img src={HelpIcon} alt='Help Icon' className='h-6 w-6 text-white mr-2' />
            You need help?
          </Link>
          */
