import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { extractZonePrices } from '../components/Utils/priceUtils'
import { fetchDescription, fetchGitHubImage } from '../components/Utils/FetchDataJson'

export default function EventPage() {
  const navigate = useNavigate()
  const { venue, name, date, label, delete: deleteParam } = useParams()

  const [venues, setVenue] = useState<any>(null)
  const [description, setDescription] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const [hour, setHour] = useState<string>('')
  const [saleStartsAt, setSaleStartsAt] = useState<string>('')
  const [isOnlineEvent, setIsOnlineEvent] = useState<boolean>(false)
  const [locationDetails, setLocationDetails] = useState<any>(null)
  const [eventSettings, setEventSettings] = useState<any>(null)

  const githubApiUrl = `${import.meta.env.VITE_GITHUB_API_URL as string}/venues.json`
  const githubApiUrl2 = `${import.meta.env.VITE_GITHUB_API_URL as string}/events.json`
  const hieventsUrl = `${import.meta.env.VITE_HIEVENTS_API_URL as string}events/`

  const token = import.meta.env.VITE_GITHUB_TOKEN
  const token2 = import.meta.env.VITE_TOKEN_HIEVENTS
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.raw'
    }
  }

  useEffect(() => {
    const fetchHour = async () => {
      try {
        const localResponse = await fetch(`${hieventsUrl}${venue}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token2}`,
            'Content-Type': 'application/json'
          }
        })

        if (!localResponse.ok) {
          throw new Error(`Error en la respuesta local: ${localResponse.status}`)
        }
        const localData = await localResponse.json()
        const local_date = new Date(localData.data.start_date).toISOString().split('T')[0] // Convertir y formatear la fecha
        const dateTime = new Date(localData.data.start_date)
        const hour = dateTime.getHours().toString().padStart(2, '0') // Obtiene la hora en formato 24h
        setHour(`${hour}:00`)
        setSaleStartsAt(local_date)
        // console.log('hora',localData );
        return
      } catch (error) {
        console.error('Failed to fetch event hour:', error)
      }
    }

    if (label) {
      fetchHour()
    }
  }, [label, githubApiUrl2, options])

  useEffect(() => {
    if (deleteParam === 'delete') {
      navigate('/')
      return
    }

    const currentDate = new Date()
    const endDate = date ? new Date(date) : new Date()

    endDate.setDate(endDate.getDate() + 2)

    if (currentDate.getTime() > endDate.getTime()) {
      navigate('/')
      return
    }

    const fetchVenues = async () => {
      const storedVenues = localStorage.getItem('Venues')
      localStorage.removeItem('Venues')

      if (storedVenues) {
        setVenue(JSON.parse(storedVenues))
      } else {
        try {
          const localResponse = await fetch(`${hieventsUrl}${venue}/settings`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token2}`,
              'Content-Type': 'application/json'
            }
          })
          const localData = await localResponse.json()

          const mapResponse = await fetch(`${hieventsUrl}${venue}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token2}`,
              'Content-Type': 'application/json'
            }
          })

          if (!mapResponse.ok) {
            throw new Error(`Error en la respuesta local`)
          }

          const mapData = await mapResponse.json()
          // console.log('mapData', mapData.data.map);
          const hasSeatmap = mapData.data.map === 'map1' || mapData.data.map === 'map2'

          //  console.log('localData', localData.data);
          setVenue(localData.data.location_details.venue_name)
          const matchingVenue = {
            capacity: localData.data.capacity || 1000,
            location: {
              address: localData.data.settings?.location_details?.address || '',
              city: localData.data.location_details?.city || '',
              country: localData.data.location_details?.country || 'United States',
              maps_url: localData.data.location_details?.maps_url || '',
              zip_code: localData.data.location_details?.zip_code || ''
            },
            seatmap: hasSeatmap,
            venue_label: localData.data.venue_label || venue,
            venue_name: localData.data.location_details?.venue_name || localData.data.title
          }
          //  console.log('matchingVenue', matchingVenue)
          setVenue(matchingVenue)
        } catch (error) {
          console.error('Error fetching data: ', error)
        }
      }
    }
    fetchVenues()
  }, [venue, githubApiUrl, token])

  const customUrl = `${import.meta.env.VITE_HIEVENTS_API_URL as string}events/${venue}/`
  const [zonePriceList, setZonePriceList] = useState<any[]>([])

  useEffect(() => {
    const fetchZonePrices = async () => {
      try {
        const response = await fetch(customUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token2}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          throw new Error('response error')
        }
        const zonePrices = await response.json()
        const counterPrices = zonePrices.data.tickets
        const zonePriceListData = extractZonePrices(counterPrices)
        //console.log('este es counter :', zonePriceListData);
        setZonePriceList(zonePriceListData)
      } catch (error) {
        console.error('Error fetching zone prices', error)
      }
    }
    fetchZonePrices()
  }, [])

  useEffect(() => {
    const fetchDescriptions = async () => {
      // Si no hay descripción de GitHub, intentar con la API local
      const localResponse = await fetch(`${hieventsUrl}${venue}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token2}`,
          'Content-Type': 'application/json'
        }
      })

      if (!localResponse.ok) {
        throw new Error(`Error en la respuesta local: ${localResponse.status}`)
      }

      const localData = await localResponse.json()
      console.log('Respuesta de API local:', {
        status: localResponse.status,
        data: localData,
        description: localData.description
      })

      setDescription(
        localData.data.description?.replace(/<\/?[^>]+(>|$)/g, '') ||
          'No hay descripción disponible'
      )
      return
    }

    if (label) {
      fetchDescriptions()
    }
  }, [label])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const image = await fetchGitHubImage(label!)
        setImage(image)
      } catch (error) {
        // Si no hay descripción de GitHub, intentar con la API local
        const localResponse = await fetch(`${hieventsUrl}${venue}/images`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token2}`,
            'Content-Type': 'application/json'
          }
        })

        if (!localResponse.ok) {
          throw new Error(`Error en la respuesta local: ${localResponse.status}`)
        }

        const localData = await localResponse.json()
        //console.log('localData', localData);
        // console.log('Respuesta de API local:', {
        //   status: localResponse.status,
        //   data: localData,
        //   description: localData.description
        // });
        if (localData.data) {
          setImage(localData.data[0].url || '')
        }

        return
      }
    }

    if (label) {
      fetchImages()
    }
  }, [label])

  useEffect(() => {
    const fetchVenues = async () => {
      // ... lógica existente para obtener venues ...

      // Después de obtener los detalles del venue, también obtenemos los detalles del evento
      try {
        const eventDetailsResponse = await fetch(`${hieventsUrl}${venue}/settings`, {
          headers: {
            Authorization: `Bearer ${token2}`,
            'Content-Type': 'application/json'
          }
        })

        if (!eventDetailsResponse.ok) {
          throw new Error(`Error en la respuesta local`)
        }

        const eventDetails = await eventDetailsResponse.json()
        setIsOnlineEvent(eventDetails.is_online_event)
        setLocationDetails(eventDetails.location_details)
        setEventSettings(eventDetails) // Guardamos la configuración del evento
      } catch (error) {
        console.error('Error fetching event details:', error)
      }
    }

    fetchVenues()
  }, [venue, githubApiUrl, token])

  const currentDate = new Date()
  const saleStartsAtDate = saleStartsAt ? new Date(saleStartsAt) : null
  const isSaleActive = saleStartsAtDate ? currentDate >= saleStartsAtDate : false
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-[80vh] bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
          <img src={image} alt="Event Cover" className="w-full h-full object-cover object-center" />
        </div>

        {/* Content Container */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-end pb-16">
            <div className="flex flex-col md:flex-row gap-8 items-end w-full">
              {/* Event Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <span className="text-lg font-medium">
                    {venues?.venue_name}, {venues?.location.city}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">{name}</h1>

                <div className="flex items-center gap-2 text-white/90">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    />
                  </svg>
                  <span className="text-lg">
                    {new Date(date!).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}{' '}
                    - {hour} hrs
                  </span>
                </div>
              </div>

              {/* Ticket Card */}
              <div className="w-full md:w-96 bg-white rounded-xl shadow-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ticket Information</h2>
                <div className="space-y-4">
                  {zonePriceList.length > 0 ? (
                    zonePriceList.map(zoneItem => (
                      <div
                        key={zoneItem.zone}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{zoneItem.zone}</p>
                          <p className="text-sm text-gray-500">Starting from</p>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          ${Math.min(...zoneItem.prices.map((price: any) => price.priceFinal))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-gray-900">All Zones</p>
                        <p className="text-sm text-gray-500">Various locations available</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Map
                      </button>
                    </div>
                  )}

                  <Link
                    to={`/sale/${name}/${venues?.venue_label}/${venues?.location.city}/${date}/${label}/${deleteParam}`}
                    state={{
                      eventName: name,
                      eventHour: hour,
                      eventDescription: description,
                      venueName: venues?.venue_name,
                      venueCity: venues?.location.city,
                      saleStartsAt: saleStartsAt
                    }}
                    className={`w-full mt-4 px-6 py-3 rounded-lg text-center font-semibold transition-all
                      ${
                        isSaleActive
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {isSaleActive
                      ? 'Get Tickets'
                      : `Sales start ${new Date(saleStartsAt!).toLocaleDateString()}`}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Event Details */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900">Date & Time</h2>
                </div>
                <p className="text-lg text-gray-700">
                  {new Date(date!).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC'
                  })}
                </p>
                <p className="text-lg text-gray-700">{hour} hrs</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900">About the Event</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Right Column - Location */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                </div>
                {isOnlineEvent ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 text-blue-600 mx-auto mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xl text-gray-700">This is an online event</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">Address:</span>{' '}
                        {eventSettings?.data?.location_details?.address_line_1}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">City:</span>{' '}
                        {eventSettings?.data?.location_details?.city}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Country:</span>{' '}
                        {eventSettings?.data?.location_details?.country}
                      </p>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-md">
                      <iframe
                        className="w-full h-[400px]"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDUv83_obzUR6e7lPMmt6kgVGzs67IwWhA&q=${encodeURIComponent(
                          eventSettings?.data?.location_details?.address_line_1
                        )},${encodeURIComponent(eventSettings?.location_details?.city)},${encodeURIComponent(
                          eventSettings?.location_details?.country
                        )}`}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <a
                      href={eventSettings?.data?.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <span>View on Google Maps</span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Gallery */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Event Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(index => (
                <div
                  key={index}
                  className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <img
                    src={image}
                    alt={`Event image ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
