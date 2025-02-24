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
      try {
        // Intentar primero con GitHub
        // const description = await fetchDescription(label!, options)
        //  setDescription(description)
      } catch (error) {
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
        // Comentado temporalmente para depuración
        // console.log('Respuesta de API local:', {
        //   status: localResponse.status,
        //   data: localData,
        //   description: localData.description
        // });

        setDescription(
          localData.data.description?.replace(/<\/?[^>]+(>|$)/g, '') ||
            'No hay descripción disponible'
        )
        return
      }
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
      <div className="bg-gray-100 relative">
        {/* Event Header */}
        <div className="absolute inset-0">
          {/* Cover Image */}
          <div className="relative h-96 bg-gray-500">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={image}
                alt="Event Profile"
                className="w-full h-full object-cover overflow-hidden object-top"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Event Description */}
          <div className="text-primary-content relative">
            <h2 className="text-4xl mb-4 bg-black bg-opacity-50 text-neutral-content rounded-lg px-10 py-2 inline-block max-w-full text-left mx-auto">
              {venues?.venue_name}, {venues?.location.city}
            </h2>
            <h2 className="text-4xl mb-4 bg-black bg-opacity-50 text-neutral-content rounded-lg px-10 py-2 inline-block max-w-full text-left mx-auto">
              {hour} hrs
            </h2>
            <h1 className="text-6xl font-bold mb-4 bg-black bg-opacity-50 text-neutral-content rounded-lg px-10 py-2 inline-block max-w-full text-left mx-auto ">
              {name}
            </h1>

            <div className="ml-auto md:w-96 sm:w-full text-black bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-6">Ticket Prices</h2>
              {/* Static Table */}
              <table className="w-full gap-y-2">
                <thead>
                  <tr>
                    <th className="text-left">Type</th>
                    <th className="text-center"></th>

                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Static ticket data */}
                  {zonePriceList.map(zoneItem => (
                    <tr key={zoneItem.zone}>
                      <th className="text-left font-normal">{zoneItem.zone}</th>
                      <th className="text-center font-normal">Starting prices from</th>
                      <th>
                        <a className="font-bold" style={{ fontSize: '14px' }}>
                          {' '}
                          ${Math.min(...zoneItem.prices.map((price: any) => price.priceFinal))} USD
                        </a>
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Buy Tickets Button */}
              <div className="mt-6">
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
                  className={`btn ${isSaleActive ? 'btn-active bg-blue-500 hover:bg-blue-600' : 'btn-disabled bg-gray-400'} text-white py-2 px-4 rounded w-full`}
                >
                  {isSaleActive ? 'Buy Tickets!' : `Tickets available on ${saleStartsAt}`}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/4 mx-auto py-10 sm:px-2 lg:px-20">
        {/* Event Description */}
        <div className="prose lg:prose-xl text-black w-full">
          <h1 className="text-black">{name}</h1>
          <div class="_eventDetail_xh8mx_31">
            <h2 className="text-black">Fecha y hora</h2>
            <div class="_details_xh8mx_36">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="tabler-icon tabler-icon-calendar"
              >
                <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"></path>
                <path d="M16 3v4"></path>
                <path d="M8 3v4"></path>
                <path d="M4 11h16"></path>
                <path d="M11 15h1"></path>
                <path d="M12 15v3"></path>
              </svg>
              <div>
                <span className="text-black">
                  {new Date(date!)
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC'
                    })
                    .replace(',', '')}{' '}
                  - {hour} hrs
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-black">Sobre el evento</h3>
          <p className="text-left">{description}</p>
        </div>

        <div className="prose lg:prose-xl text-black w-full">
          <h2 className="text-black">Ubicación</h2>
          <h3 className="text-black">Sobre el evento</h3>
          {isOnlineEvent ? (
            <p>Este es un evento en línea.</p>
          ) : (
            <div>
              <p className="text-left">Ciudad: {eventSettings?.data?.location_details?.city}</p>
              <p className="text-left">País: {eventSettings?.data?.location_details?.country}</p>
              <p className="text-left">
                Dirección: {eventSettings?.data?.location_details?.address_line_1}
              </p>

              <h3 className="text-black text-lg font-bold mb-6">Mapa</h3>
              <a
                className="text-black text-left"
                href={eventSettings?.data?.maps_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en el mapa
              </a>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDUv83_obzUR6e7lPMmt6kgVGzs67IwWhA&q=${encodeURIComponent(eventSettings?.data?.location_details?.address_line_1)},${encodeURIComponent(eventSettings?.location_details?.city)},${encodeURIComponent(eventSettings?.location_details?.country)}`}
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          )}
        </div>

        <div className="carousel carousel-center flex justify-center max-h-50 min-w-full abs">
          <div className="carousel-item object-scale-down h-2/3 w-2/3 rounded-xl max-h-1/8 object-center">
            <img src={image} />
          </div>
          <div className="carousel-item object-scale-down h-2/3 w-2/3 rounded-xl max-h-1/8 object-center">
            <img src={image} />
          </div>
          <div className="carousel-item object-scale-down h-2/3 w-2/3 rounded-xl max-h-1/8 object-center">
            <img src={image} />
          </div>
          <div className="carousel-item object-scale-down h-2/3 w-2/3 rounded-xl max-h-1/8 object-center">
            <img src={image} />
          </div>
        </div>
      </div>
    </div>
  )
}
