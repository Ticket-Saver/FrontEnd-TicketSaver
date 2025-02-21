import EventList from '../../components/EventList'
import { isPastEvent } from '../../components/EventList'
import { BlueCreateWalletButton } from '../../components/mintWagmi/SmartWalletButton/walletButton'
import { MintNFT } from '../../components/mintWagmi/mint-nft'
import { useAccount } from 'wagmi'

export default function PastEvent() {
  const { isConnected } = useAccount()

  return (
    <>
      <div className="space-y-5">
        <div className="w-full h-56 bg-neutral rounded-xl flex flex-col justify-between p-4 py-8">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-semibold">Claim your collectible tickets</div>
            <div className="flex space-x-4">
              {!isConnected ? (
                <a>
                  <BlueCreateWalletButton />
                </a>
              ) : (
                <a>
                  <MintNFT />
                </a>
              )}
              <a>
                <button className="btn btn-primary btn-outline px-10">learn more</button>
              </a>
            </div>
          </div>
          <div className="w-2/5 h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551]"></div>
          <div className="text-xl pb-4">Turn your tickets into lasting memories!!!</div>
          <div className="text-sm w-2/3">
            Don’t let them get lost in a PDF file. Now, you can transform your tickets into
            collectible items and store them forever in your digital wallet. Create your wallet and
            start collecting today.
          </div>
        </div>
      </div>
      <EventList filterFunction={isPastEvent} noEventsMessage="You don't have any past events." />
    </>
  )
}
