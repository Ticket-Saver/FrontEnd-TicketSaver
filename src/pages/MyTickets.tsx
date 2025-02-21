import { Outlet } from 'react-router-dom'
import Tabs from '../components/dashboard/Tabs'

export default function MyTickets() {
  return (
    <div className="space-y-5">
      <Tabs />
      <Outlet />
    </div>
  )
}
