import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import Logo from '/logos/ticketsaver-logo.svg'
import flecha from '../assets/icons/flechita.svg'

export default function Header() {
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0()

  const handleLogout = () => {
    logout()
  }

  const handleLogin = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    })
  }

  return (
    <header className="bg-neutral py-0 sticky top-0 z-50 ">
      <div className="container">
        <div className="navbar px-0">
          <div className="navbar-start space-x-10">
            <a href="/">
              <img src={Logo} className="max-h-12" />
            </a>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal p-0 font-medium">
                <li>
                  <a href="/events">Events</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/Faqs">FAQS</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="navbar-end">
            {isAuthenticated ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <img
                      alt="Tailwind CSS Navbar component"
                      src={isAuthenticated && user?.picture ? user?.picture : '/user.png'}
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <Link to="/dashboard/tickets/upcomingevent" className="justify-between">
                      {user?.name}
                      <span className="badge">user</span>
                    </Link>
                  </li>
                  <li>
                    <a className="justify-between">{user?.phone_number}</a>
                  </li>
                  <li>
                    <Link to="/dashboard/tickets/upcomingevent">My Tickets</Link>
                  </li>

                  <li>
                    <a onClick={handleLogout}>Logout</a>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <h1 className="text-sm hidden sm:block md:block">
                  You will need to create an account to purchase tickets
                </h1>
                <img src={flecha} alt="Arrow" className="w-4 h-4 hidden sm:block md:block" />
                <a>
                  <button
                    className="btn btn-primary btn-outline mr-100 px-10"
                    onClick={handleLogin}
                  >
                    Create account / Log in
                  </button>
                </a>
              </div>
            )}
            <div className="dropdown pl-5">
              <label tabIndex={0} className="btn btn-circle btn-primary lg:hidden mr-1">
                <i className="bi bi-list text-2xl"></i>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content mt-1 w-52 menu menu-compact p-2 bg-base-200 shadow rounded-box right-0 left-auto origin-top-right absolute"
              >
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/events">Events</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/Faqs">FAQS</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
