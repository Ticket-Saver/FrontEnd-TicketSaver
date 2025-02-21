import { BlueCreateWalletButton } from '../components/mintWagmi/SmartWalletButton/walletButton'
import { MintNFT } from './mintWagmi/mint-nft'
import { useAccount } from 'wagmi'

export interface TickectClaimConfig {
  eventId: string
  id: string
  title: string
  description: string
  thumbnailURL: string
  date: string
  color?: string
  fontColor?: string
  venue?: string
  city?: string
}

export default function TicketsClaim({ title, city, thumbnailURL }: TickectClaimConfig) {
  const { isConnected } = useAccount()

  return (
    <div className="w-full h-72 bg-neutral rounded-xl flex flex-row">
      <div className="flex flex-col justify-between p-4 py-6 w-2/5">
        <div className="text-3xl font-semibold">{title}</div>
        <div className="w-full h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551]"></div>
        <div className="text-xl pb-4">{city}</div>
        <div className="text-sm pb-10">
          You have a collectible ticket to claim! Connect your wallet now to secure it
        </div>
        {!isConnected ? (
          <a>
            <BlueCreateWalletButton />
          </a>
        ) : (
          <a>
            <MintNFT />
          </a>
        )}
      </div>
      <div className="w-3/5 flex justify-center items-center p-4">
        <img
          src={thumbnailURL}
          alt="Event Image"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  )
}
