import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
