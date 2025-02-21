import { useState } from 'react'
import { useConnect, Connector } from 'wagmi'

export function ConnectWalletButton() {
  const [showConnectOptions, setShowConnectOptions] = useState(false)
  const { connect, connectors } = useConnect()

  const handleButtonClick = () => {
    setShowConnectOptions(prev => !prev)
  }

  const handleConnect = async (connector: Connector) => {
    await connect({ connector })
    setShowConnectOptions(false)
  }

  return (
    <div className="flex flex-col items-center p-5 bg-transparent rounded-lg shadow-none w-full max-w-md mx-auto text-white">
      <button
        className={`mt-4 py-3 px-8 text-lg font-bold border-none rounded-lg cursor-pointer transition duration-300 transform ${showConnectOptions ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-400 hover:scale-105'}`}
        onClick={handleButtonClick}
      >
        {showConnectOptions ? 'Close' : 'Connect Wallet'}
      </button>

      {showConnectOptions && (
        <div className="flex flex-col items-center mt-5 w-full">
          <h3 className="mb-5 text-xl">Connect your wallet</h3>
          {connectors.map(connector => (
            <button
              key={connector.id}
              className="flex items-center justify-center py-2 px-4 mb-2 w-full text-base font-bold bg-gray-800 border border-gray-700 rounded-lg cursor-pointer transition duration-300 transform hover:bg-green-500 hover:scale-105 sm:text-lg sm:py-3 sm:px-6"
              onClick={() => handleConnect(connector)}
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
