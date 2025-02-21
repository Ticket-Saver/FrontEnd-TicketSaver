import { WagmiProvider } from 'wagmi'
import Sidebar from '../components/dashboard/Sidebar'
import { Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '../components/mintWagmi/wagmi'

const queryClient = new QueryClient()

export default function Dashboard() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col bg-[#130B30] min-h-screen">
          <div className="flex">
            <div>
              <Sidebar />
            </div>
            <div className="flex flex-col flex-grow p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
