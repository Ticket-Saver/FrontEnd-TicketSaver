import {
  type BaseError,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  usePublicClient
} from 'wagmi'

import { createCollectorClient } from '@zoralabs/protocol-sdk'

export function MintNFT() {
  const { address, isConnected } = useAccount()
  const { data: hash, error, isPending, writeContract } = useWriteContract()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const collectorClient = createCollectorClient({ chainId, publicClient })

  async function mintNFT() {
    if (!isConnected) {
      alert('Please connect your wallet to mint an NFT.')
      return
    }

    const smartContractAddr = import.meta.env.VITE_SMARTCONTRACT_ADDR as `0x${string}`

    const { parameters } = await collectorClient.mint({
      tokenContract: smartContractAddr,
      quantityToMint: 1,
      mintType: '1155',
      minterAccount: address!,
      tokenId: 1n
    })

    writeContract(parameters)
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const handleButtonClick = () => {
    if (isConnected) {
      mintNFT()
    } else {
      alert('Please connect your wallet to mint an NFT.')
    }
  }

  return (
    <div className="">
      <button
        className={`btn btn-primary btn-outline px-10 ${
          isPending
            ? 'bg-gray-500 cursor-not-allowed'
            : isConnected
              ? 'btn btn-primary btn-outline px-10'
              : 'bg-gray-400'
        }`}
        disabled={!isConnected || isPending} // Deshabilita el botón si no está conectado o está pendiente
        onClick={handleButtonClick}
      >
        {!isConnected ? 'Mint NFT' : isPending ? 'Confirming...' : 'Mint NFT'}
      </button>

      {hash && <div className="mt-2 text-sm sm:text-base">Transaction Hash: {hash}</div>}
      {isConfirming && <div className="mt-2 text-sm sm:text-base">Waiting for confirmation...</div>}
      {isConfirmed && (
        <div className="mt-2 text-sm sm:text-base">Transaction confirmed. Your NFT is minted!</div>
      )}
      {error && (
        <div className="mt-2 p-2 bg-red-400 rounded-lg">
          Error: {(error as BaseError)?.shortMessage || error.message}
        </div>
      )}
    </div>
  )
}
