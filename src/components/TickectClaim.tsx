import { MintNFT } from './mintWagmi/mint-nft'
import LeonasImg from '/events/Leonas.jpg'

const nftData = [
  {
    id: 1,
    image: LeonasImg,
    title: 'Las Leonas',
    user: 'Juan Pedro',
    description: 'Reclaim your ticket now!'
  },
  {
    id: 2,
    image: LeonasImg,
    title: 'Las Leonas',
    user: 'Fernando Martinez',
    description: 'Reclaim your ticket now!'
  },
  {
    id: 3,
    image: LeonasImg,
    title: 'Las Leonas',
    user: 'Maria Perez',
    description: 'Reclaim your ticket now!'
  }
]

export default function TicketClaim() {
  return (
    <div className="flex flex-col items-center space-y-5">
      {nftData.map(nft => (
        <div
          key={nft.id}
          className="w-full bg-neutral rounded-xl overflow-hidden shadow-lg hover:shadow-md transition duration-300 flex flex-col sm:flex-row"
        >
          <div className="flex flex-col justify-between p-4 py-6 w-full sm:w-2/5">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{nft.title}</h2>
            <div className="w-full h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551] mb-4"></div>
            <p className="text-lg sm:text-xl mb-4">{nft.user}</p>
            <p className="text-xs sm:text-sm mb-4">{nft.description}</p>
            <MintNFT />
          </div>
          <div className="w-full sm:w-3/5 flex justify-center items-center p-4">
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
