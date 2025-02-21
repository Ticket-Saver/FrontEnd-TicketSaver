import { useCallback } from 'react'
import { useConnect } from 'wagmi'
import { CoinbaseWalletLogo } from './CoinbaseWalletLogo'

export function BlueCreateWalletButton() {
  const { connectors, connect } = useConnect()

  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      connector => connector.id === 'coinbaseWalletSDK'
    )
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector })
    }
  }, [connectors, connect])

  return (
    <button className="btn btn-primary btn-outline px-3" onClick={createWallet}>
      <CoinbaseWalletLogo />
      Create Wallet
    </button>
  )
}
