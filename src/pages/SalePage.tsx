import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import TicketSelectionSeat from './TicketEventSale'
import TicketSelectionNoSeat from './TicketEventSaleNoSeats'

export default function SalePage() {
  const { venue } = useParams<{ venue: string }>()
  const [venues, setVenue] = useState<any>(null)
  const githubApiUrl = `${import.meta.env.VITE_GITHUB_API_URL as string}/venues.json`
  const token = import.meta.env.VITE_GITHUB_TOKEN

  useEffect(() => {
    const fetchVenues = async () => {
      const storedVenues = localStorage.getItem('Venues')
      localStorage.removeItem('Venues')

      if (storedVenues) {
        setVenue(JSON.parse(storedVenues))
      } else {
        try {
          const response = await fetch(githubApiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3.raw'
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          const matchingVenue = data[venue!]
          if (!matchingVenue) {
            const localResponse = await fetch(
              `${import.meta.env.VITE_HIEVENTS_API_URL as string}/events/${venue}/settings`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${import.meta.env.VITE_TOKEN_HIEVENTS}`,
                  'Content-Type': 'application/json'
                }
              }
            )

            // Segundo consumo para verificar seatmap
            const mapResponse = await fetch(
              `${import.meta.env.VITE_HIEVENTS_API_URL as string}/events/${venue}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${import.meta.env.VITE_TOKEN_HIEVENTS}`,
                  'Content-Type': 'application/json'
                }
              }
            )

            if (!localResponse.ok || !mapResponse.ok) {
              throw new Error(`Error en la respuesta local`)
            }

            const localData = await localResponse.json()
            const mapData = await mapResponse.json()
            const hasSeatmap = mapData.data.map === 'map1' || mapData.data.map === 'map2'

            const matchingVenue = {
              capacity: localData.data.capacity || 1000,
              location: {
                address: localData.data.location_details?.address || '',
                city: localData.data.location_details?.city || '',
                country: localData.data.location_details?.country || 'United States',
                maps_url: localData.data.location_details?.maps_url || '',
                zip_code: localData.data.location_details?.zip_code || ''
              },
              seatmap: hasSeatmap,
              venue_label: localData.data.venue_label || venue,
              venue_name: localData.data.location_details?.venue_name || localData.data.title
            }
            setVenue(matchingVenue)
          } else {
            setVenue(matchingVenue)
          }
        } catch (error) {
          console.error('Error fetching data: ', error)
        }
      }
    }
    fetchVenues()
  }, [venue, githubApiUrl, token])

  console.log('venue', venue)

  return <>{venues?.seatmap ? <TicketSelectionSeat /> : <TicketSelectionNoSeat />}</>
}
