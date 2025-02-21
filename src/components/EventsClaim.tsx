import { useState } from 'react'

export interface EventsClaimConfig {
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
  route?: string
  ticketDetails?: TicketDetail[]
}

interface TicketDetail {
  ticket: string
  zone: string
  price: string
}

function AdditionalInfo({ details }: { details: TicketDetail[] }) {
  return (
    <>
      {details.map((detail, index) => (
        <div key={index} className="w-full bg-neutral rounded-xl flex flex-col sm:flex-row mb-4">
          <div className="flex flex-col justify-between p-4 py-6 w-full sm:w-2/5">
            <p className="text-xl font-bold py-3">Ticket: {detail.ticket}</p>
            <div className="w-full h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551] my-4"></div>
            <p className="text-lg">Zone: {detail.zone}</p>
            <p className="text-lg">Price: {detail.price}</p>
          </div>
        </div>
      ))}
    </>
  )
}

export default function EveClaim({
  title,
  venue,
  thumbnailURL,
  date,
  description,
  ticketDetails
}: EventsClaimConfig) {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)

  const handleViewTicketsClick = () => {
    setShowAdditionalInfo(!showAdditionalInfo)
  }

  return (
    <>
      <div className="w-full bg-neutral rounded-xl flex flex-col sm:flex-row">
        <div className="flex flex-col justify-between p-4 py-6 w-full sm:w-2/5">
          <div className="text-xl sm:text-3xl font-semibold">{title}</div>
          <div className="w-full h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551] my-4"></div>
          <div className="text-lg sm:text-xl font-semibold pb-4">{venue}</div>
          <div className="text-lg sm:text-xl pb-4">{date}</div>
          <div className="text-sm sm:text-lg pb-4">{description}</div>
          {ticketDetails && (
            <div onClick={handleViewTicketsClick} className="cursor-pointer mt-4 text-blue-500">
              {showAdditionalInfo ? '▲ Hide tickets' : '▼ View tickets'}
            </div>
          )}
        </div>
        <div className="w-full sm:w-3/5 flex justify-center items-center p-4">
          <img
            src={thumbnailURL}
            alt="Event Image"
            className="w-full h-auto sm:h-full object-cover rounded-xl"
          />
        </div>
      </div>
      {showAdditionalInfo && ticketDetails && <AdditionalInfo details={ticketDetails} />}
    </>
  )
}
