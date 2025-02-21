import { WalletOptions } from '../components/mintWagmi/wallet-options'
import { MintNFT } from '../components/mintWagmi/mint-nft'
import { BlueCreateWalletButton } from '../components/mintWagmi/SmartWalletButton/walletButton'
import { ConnectWalletButton } from '../components/ConnectButton'
import indiaYuridiaImage from '/events/IndiaYuridia.png'
import '../styles/custom.css'

const nftData = [
  {
    id: 1,
    image: indiaYuridiaImage,
    title: 'Ticket 1',
    description: 'evento 1'
  },
  {
    id: 2,
    image: indiaYuridiaImage,
    title: 'Ticket 2',
    description: 'evento 2'
  },
  {
    id: 3,
    image: indiaYuridiaImage,
    title: 'Ticket 3',
    description: 'evento 3'
  }
]

export default function Web3() {
  return (
    <div className="container mx-auto p-5">
      <ConnectWalletButton />
      <BlueCreateWalletButton />
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">Tus Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {nftData.map(nft => (
          <div
            key={nft.id}
            className="relative border-2 border-purple-500 rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-md transition duration-300"
          >
            <img src={nft.image} alt={nft.title} className="w-full h-48 object-cover" />
            <div className="p-5 bg-gray-100">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">{nft.title}</h2>
              <p className="text-gray-700 mb-4">{nft.description}</p>
              <MintNFT />
            </div>

            <div className="absolute top-0 left-0 right-0 bottom-0 border-2 border-gray-300 rounded-lg pointer-events-none"></div>
          </div>
        ))}
      </div>
      <WalletOptions />
    </div>
  )
}
