import { useState, useEffect } from 'react'
import { EventCard } from './EventCard'
import { Link } from 'react-router-dom'
import { useFetchJson } from './Utils/FetchDataJson'

interface Event {
  eventId: string
  event_date: string
  event_hour: string
  event_name: string
  venue_label: string
  event_label: string
  event_deleted_at: string | null
  sale_starts_at: string
  tricket_url: string
}

interface Location {
  address: string
  city: string
  country: string
  maps_url: string
  zip_code: string
}

interface Venue {
  capacity: number
  venue_label: string
  location: Location
  venue_name: string
  seatmap: boolean
}

interface EventWithVenue extends Event {
  venue: Venue | undefined
  images: { url: string }[]
  city: string
  id: string
  description: string
}

export default function FeaturedEvents() {
  const [events, setEvents] = useState<EventWithVenue[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})

  const githubApiUrl = `${import.meta.env.VITE_GITHUB_API_URL as string}/events.json`
  const hieventsUrl = `${import.meta.env.VITE_HIEVENTS_API_URL as string}/api/events?page=1&per_page=20&query=&sort_by=&sort_direction=&eventsStatus=upcoming`
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const token2 = import.meta.env.VITE_TOKEN_HIEVENTS

  const options = { 
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.raw'
    }
  }

  // Fetch de eventos de la API
  useEffect(() => {
    const fetchEventsFromAPI = async () => {
      try {
        const response = await fetch(hieventsUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token2}`,
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        console.log('Fetched events:', data.data)

        const formattedEvents: EventWithVenue[] = data.data.map((event: any) => ({
          eventId: event.id,
          event_name: event.title,
          event_label: event.map || '',
          event_date: new Date(event.end_date).toISOString().split('T')[0],
          event_hour: event.event_hour || '',
          venue_label: 'default_venue',
          event_deleted_at: null,
          sale_starts_at: '',
          tricket_url: '',
          id: event.id,
          images: event.images || [],
          city: event.settings?.location_details?.city || '-',
          description: event.description?.replace(/<\/?[^>]+(>|$)/g, '') || '',
          venue: {
            venue_name: event.venue_name || 'Default Venue',
            venue_label: 'default_venue',
            capacity: 0,
            seatmap: false,
            location: {
              city: event.settings?.location_details?.city || '-',
              address: '',
              country: '',
              maps_url: '',
              zip_code: ''
            }
          }
        }))

        setEvents(formattedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchEventsFromAPI()
  }, [token2])

  // Fetch de descripciones desde GitHub
  const { data: githubData } = useFetchJson(githubApiUrl, options)

  useEffect(() => {
    if (githubData) {
      const descriptionsDict: Record<string, string> = {}
      Object.values(githubData).forEach((event: any) => {
        if (event.description) {
          descriptionsDict[event.event_label] = event.description.slice(0, 250) + '...'
        }
      })
      setDescriptions(descriptionsDict)
    }
  }, [githubData])

  const optionsDate: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }

  return (
    <section className='py-10 md:py-16 bg-base-300'>
      <div className='container'>
        <div className='text-center'>
          <h2 className='text-3xl sm:text-5xl font-bold mb-4'>Select your city!</h2>
          <p className='text-lg sm:text-2xl mb-6 md:mb-14'>
            Don't miss out! Buy now before tickets sell out!
          </p>
        </div>
        <div className={`grid ${events.length === 1 ? 'grid-cols-1 place-items-center' : 'sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2'} gap-6 lg:gap-8 xl:gap-10 place-items-center items-center`}>
          {events.map((event, index) => (
            <Link
              style={{ width: '100%' }}
              to={`/event/${encodeURIComponent(event.event_name)}/${event.id}/${event.event_date}/${event.event_label}/${event.event_deleted_at}`}
              key={index}
            >
              <EventCard
                key={index}
                id={event.eventId}
                eventId={event.eventId}
                title={event.event_name}
                description={descriptions[event.event_label] || event.description}
                thumbnailURL={event.images[0]?.url || "/default.jpg"}
                venue={event.venue?.venue_name || event.venue_label}
                date={new Date(event.event_date)
                  .toLocaleDateString('en-GB', optionsDate)
                  .replace(',', '')}
                city={event.venue?.location.city || event.city}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
