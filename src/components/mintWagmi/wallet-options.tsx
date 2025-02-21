import { useAccount, useDisconnect } from 'wagmi'

export function WalletOptions() {
  const account = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="flex justify-between items-start p-5 border border-gray-300 rounded-lg shadow-md mb-8 w-full max-w-md mx-auto">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-2">Account</h2>
        <div className="text-sm">
          <p>
            <strong>Status:</strong> {account.status}
          </p>
          <p>
            <strong>Address:</strong> {account.address}
          </p>
          <p>
            <strong>Chain ID:</strong> {account.chain?.id}
          </p>
        </div>
      </div>
      {account.status === 'connected' && (
        <button
          className="mt-4 py-2 px-4 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      )}
    </div>
  )
}
