import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SeatchartJS, { CartChangeEvent } from 'seatchart'
import Seatchart from '../components/Seatchart'
import InteractiveMap from '../components/InteractiveMap'

import { eventData, mapConfig } from '../components/maps/DataMap'

import { v4 as uuidv4 } from 'uuid'
import { fetchGitHubImage } from '../components/Utils/FetchDataJson'
import { extractZonePrices } from '../components/Utils/priceUtils'

import { ticketId } from '../components/TicketUtils'
import { useAuth0 } from '@auth0/auth0-react'
import { extractLatestPrices, find_price, zoneseatToPrice } from '../components/Utils/priceUtils'

interface Cart {
  price_base: number
  price_final: number
  zoneName: string
  seatLabel: string
  seatType: string
  subZone: string
  coords: { row: number; col: number }
  priceType: string
  ticketId: string
}

export default function TicketSelection() {
  const { name, venue, date, location, label, delete: deleteParam } = useParams()
  const githubApiUrl = `${import.meta.env.VITE_GITHUB_API_URL as string}/events/${label}/zone_price.json`
  const githubApiUrl2 = `${import.meta.env.VITE_GITHUB_API_URL as string}/venues.json`
  const hieventsUrl = `${import.meta.env.VITE_HIEVENTS_API_URL as string}/events/`
  const token2 = import.meta.env.VITE_TOKEN_HIEVENTS
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.raw'
    }
  }

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [zonePriceList, setZonePriceList] = useState<any[]>([])
  const [priceTagList, setPriceTags] = useState<any>([])
  const [zoneData, setZoneData] = useState<any>([])
  const [venueInfo, setVenue] = useState<any>(null)
  const [eventSelected, setEventSelected] = useState<string | ''>('las_leonas.02')
  const [, setSessionId] = useState<string>('')

  // Load image when label changes
  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await fetchGitHubImage(label!)
        setImageUrl(url)
      } catch (error) {
        console.error('Error loading image:', error)
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
        console.log('localData', localData)
        if (localData.data) {
          setImageUrl(localData.data[0].url || '')
        }

        return
      }
    }
    if (label) loadImage()
  }, [label])

  // Fetch zone data when label changes
  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        const response = await fetch(githubApiUrl, options)
        if (!response.ok) throw new Error('response error')
        const data = await response.json()

        setZoneData(data)
        setPriceTags(extractLatestPrices(data))
        setZonePriceList(extractZonePrices(data))
      } catch (error) {
        console.error('Error fetching zone data:', error)
      }
    }

    if (label) fetchZoneData()
  }, [githubApiUrl])

  // Fetch venue data when venue changes
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(githubApiUrl2, options)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        setVenue(data[venue!])
      } catch (error) {
        console.error('Error fetching data: ', error)
      }
    }
    if (venue) fetchVenues()
  }, [githubApiUrl2, venue])

  useEffect(() => {
    // Limpia el localStorage al montar el componente
    localStorage.removeItem('local_cart')
    localStorage.removeItem('cart_checkout')
  }, [])

  const getCookieStart = (name: string) => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=')
      if (cookieName.trim() === name) {
        return cookieValue
      }
    }
    return null
  }
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

    // Check if sessionId already exists in cookies
    const existingSessionId = getCookieStart('sessionId')

    // If sessionId doesn't exist, generate a new one and store it as a cookie
    if (!existingSessionId) {
      const newSessionId = uuidv4()
      setSessionId(newSessionId)
      document.cookie = `sessionId=${newSessionId}; path=/` // Set the cookie with name 'sessionId'
    } else {
      // Use existing sessionId if it exists
      setSessionId(existingSessionId)
    }
  }, [])

  useEffect(() => {
    if (label) setEventSelected(label.replace(/\./g, ''))
    console.log('labelllll', label)
  }, [label])

  const [eventZoneSelected, setEventZoneSelected] = useState<string>('')

  const { user } = useAuth0()

  const customer = {
    name: user?.name,
    email: user?.email,
    phone: user?.phone_number
  }

  const [cart, setCart] = useState<Cart[]>([])
  const navigate = useNavigate()

  const totalCost = cart?.reduce((acc, crr) => (acc = acc + crr.price_final), 0) || 0

  const handleCheckout = async () => {
    const cartLength = (cart || []).length
    if (cartLength > 10) {
      alert(
        'You cannot proceed with more than 10 tickets. / No puedes continuar con más de 10 boletos.'
      )
      return
    }
    localStorage.setItem(
      'cart_checkout',
      JSON.stringify({
        cart: cart,
        eventInfo: {
          id: label,
          name: name,
          venue: venueInfo?.venue_name || 'Venue Name Not Available',
          venueId: venue,
          date: date,
          location: location
        },
        customer: customer
      })
    )
    navigate('/checkout')
  }

  const [seatchartCurrentOptions, setSeatchartCurrentOptions] = useState<any>(null)
  const [seatchartCurrentArea, setSeatchartCurrentArea] = useState<any>(null)

  let seatchartRef = useRef<SeatchartJS>()

  function ArraysplitSeatLabel(seatLabel: string): [string, number] {
    const match = seatLabel.match(/^([A-Za-z🧏♿🚹🦽]+)(\d+)$/)
    if (match) {
      const letters = match[1]
      const numbers = parseInt(match[2], 10)
      return [letters, numbers]
    } else {
      throw new Error('Invalid seat label format')
    }
  }

  const getCookie = (name: string) => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=')
      if (cookieName.trim() === name) {
        return cookieValue
      }
    }
    return null
  }

  const [, setIsError] = useState(false)
  const [, setErrorMessage] = useState('')

  const handleOnSeatClick = async (e: CartChangeEvent) => {
    const sessionId = getCookie('sessionId')
    const currentCart = cart || []

    if (e.action === 'add') {
      if (currentCart.length >= 10) {
        // Intentar desbloquear el asiento si el carrito ya tiene 10 elementos

        confirm(
          'Maximum of 10 tickets allowed per order. The seat you attempted to add has been unlocked.'
        )

        return
      }

      const globalSeat = ArraysplitSeatLabel(e.seat.label)
      const lockingSeat = {
        Seat: e.seat.label,
        row: e.seat.index.row,
        col: e.seat.index.col,
        subZone: seatchartCurrentArea.title,
        sessionId: sessionId,
        Event: label
      }

      try {
        // Esperar a que lockSeats se complete
        await lockSeats(lockingSeat)

        // Proceder solo si lockSeats fue exitoso
        if (eventSelected !== '') {
          const issuedAt = Date.now()
          const newTicketId = ticketId(label || '', eventSelected, currentCart.length + 1, issuedAt)

          const zoneColorType_ = seatchartCurrentArea?.name as string // Referente a los nombres de cada zona del mapa
          const eventInfo = eventData[eventSelected]

          // Determinar el tipo de zona (orquesta o loge)
          const zoneType =
            Object.keys(eventData[eventSelected] || {}).find(zone =>
              eventData[eventSelected][zone]?.zones.includes(zoneColorType_)
            ) || ''

          // Obtener la información para el tipo de zona seleccionado
          const zoneInfo = eventInfo[zoneType]

          if (zoneInfo) {
            const zoneColors = zoneInfo.zones
            const colorIndex = zoneColors.indexOf(zoneColorType_)

            let price_base: number
            let priceType: string

            if (colorIndex !== -1) {
              priceType = zoneInfo.priceTag[colorIndex]
              price_base = (priceTagList[priceType]?.price_base || 2000) / 100
            } else {
              priceType = zoneseatToPrice(zoneData.zones, seatchartCurrentArea.title, globalSeat)
              price_base = find_price(zoneData, seatchartCurrentArea.title, globalSeat)
            }

            // Actualizar el carrito
            setCart((prev: Cart[] | []) => {
              if ((prev?.length || 0) >= 10) {
                confirm(
                  'Maximum of 10 tickets allowed per order.\n \n' +
                    'Máximo de 10 boletos permitidos por pedido.'
                )
                return prev
              }
              const existingSeatIndex = (prev || []).findIndex(
                item => item.seatLabel === e.seat.label
              )
              if (existingSeatIndex !== -1) {
                // Si el asiento ya existe, devolver el carrito actual sin cambios
                return prev
              }

              const newCart = [
                ...(prev || []),
                {
                  price_base: price_base,
                  price_final: (priceTagList[priceType]?.price_final || 2000) / 100,
                  zoneName: eventSelected,
                  seatLabel: e.seat.label,
                  seatType: zoneColorType_,
                  subZone: seatchartCurrentArea.title,
                  coords: { row: e.seat.index.row, col: e.seat.index.col },
                  priceType: priceType,
                  ticketId: newTicketId,
                  issuedAt: issuedAt
                }
              ]

              return newCart
            })
          }
        }
      } catch (error) {
        console.error('Failed to lock seat:', error)
        setErrorMessage('Failed to lock the seat. Please reload map by clicking it.')
        setIsError(true)
      }
    } else if (e.action === 'remove') {
      const lockingSeat = {
        Seat: e.seat.label,
        row: e.seat.index.row,
        col: e.seat.index.col,
        subZone: seatchartCurrentArea.title,
        sessionId: sessionId,
        Event: label
      }

      try {
        await lockSeats(lockingSeat)

        setCart(prev => prev?.filter(cart => cart.seatLabel !== e.seat.label))
      } catch (error) {
        console.error('Failed to unlock seat:', error)
      }
    }
  }

  const [windowSize, setWindowSize] = useState(0)

  const handleWindowResize = useCallback(() => {
    setWindowSize(window.innerWidth)
  }, [])

  useEffect(() => {
    setWindowSize(window.innerWidth)
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const handleGetAreaSeats = async (areaTitle: any, label: any) => {
    try {
      const response = await fetch('/api/fetchTakenSeats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subZone: areaTitle, Event: label })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      const takenSeats = result.data

      return takenSeats
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const lockSeats = async (seat: any) => {
    // Simular un pequeño delay para que parezca real
    await new Promise(resolve => setTimeout(resolve, 100))

    // Log para debugging
    console.log('Simulando bloqueo de asiento:', seat)

    // Retornar una respuesta dummy exitosa
    return {
      success: true,
      message: 'Seat locked successfully (dummy response)',
      data: {
        seat: seat.Seat,
        sessionId: seat.sessionId,
        status: 'locked',
        timestamp: new Date().toISOString()
      }
    }

    /* Código original comentado para referencia futura
    try {
      const response = await fetch('/api/lockSeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seat)
      })

      if (!response.ok) {
        throw new Error('Failed to insert seats')
      }

      const data = await response.json()
      console.log('Data--->', data)
    } catch (error) {
      throw new Error('error locking seats')
    } 
    */
  }

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('local_cart') as string))
  }, [])
  useEffect(() => {
    localStorage.setItem('local_cart', JSON.stringify(cart))
  }, [cart])

  const [selectedSeats, setSelectedSeats] = useState<{ seatLabel: string; seatType: string }[]>([])

  const onTicketClick = (ticket: { seatLabel: string; seatType: string }) => {
    setCart(prev =>
      prev?.filter(cart => cart.seatLabel !== ticket.seatLabel && cart.seatType === ticket.seatType)
    )
    const newSelectedSeats = selectedSeats.filter(
      seat => seat.seatLabel !== ticket.seatLabel || seat.seatType !== ticket.seatType
    )
    setSelectedSeats(newSelectedSeats)

    const newOptions = { ...seatchartCurrentOptions, reservedSeats: newSelectedSeats }
    setSeatchartCurrentOptions(newOptions)
  }

  useEffect(() => {
    const selectedEventData = eventData[eventSelected]
    const zones = selectedEventData ? Object.keys(selectedEventData) : []

    if (zones.length === 1) {
      setEventZoneSelected(zones[0])
    } else if (!eventZoneSelected) {
      setEventZoneSelected('')
    }
  }, [eventData, eventSelected])

  return (
    <div className="bg-base-200">
      <div className="bg-base-200 relative">
        {/* Event Header */}
        <div className="absolute inset-0">
          {/* Cover Image */}
          <div className="relative h-96 bg-gray-800">
            {/* Event Profile Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={imageUrl!}
                alt="Event banner"
                className="w-full h-full object-cover overflow-hidden  object-top  mx-auto p-[10px] rounded-[40px]"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className=" max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Event Description */}
          <div className="text-primary-content relative">
            <h1 className="text-6xl font-bold mb-4 bg-black bg-opacity-50 text-neutral-content rounded-lg px-10 py-2 inline-block max-w-full text-left mx-auto ">
              {name}
            </h1>
            <div className="block">
              {venueInfo ? (
                <h2 className="text-4xl mb-4 bg-black bg-opacity-50 text-neutral-content rounded-lg px-10 py-2 inline-block max-w-full text-left mx-auto">
                  {venueInfo.venue_name}, {location}
                </h2>
              ) : (
                <h2 className="text-4xl mb-4 bg-black bg-opacity-50 text-neutral-content rounded-lg px-10 py-2 inline-block max-w-full text-left mx-auto"></h2>
              )}
            </div>
            <div className="ml-auto sm:w-full md:w-96 text-black bg-white rounded-lg shadow-sm p-6">
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
                          $
                          {Math.min(...zoneItem.prices.map((price: any) => price.priceFinal)) /
                            100}{' '}
                          USD
                        </a>
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-200  max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Event Description */}
        <div className="relative justify-center text-black">
          {/* Selection Elements */}
          <div className="md:flex sm:flex-row justify-left w-full bg-white rounded-lg p-4  m-4 mx-auto">
            <div className="w-full md:w-1/2 px-8">
              <h2 className="text-4xl font-bold mb-10">Choose your tickets</h2>
              {/* Ticket Type */}
              <div>
                {Object.keys(eventData[eventSelected] || {}).length > 1 && (
                  <div className="mb-4">
                    <label htmlFor="ticketType" className="block text-xl mb-4 font-bold">
                      Select a Venue Floor
                    </label>

                    <select
                      id="ticketType"
                      name="ticketType"
                      value={eventZoneSelected}
                      onChange={e => setEventZoneSelected(e.target.value)}
                      className="mt-1 bg-white block w-3/4 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select zone</option>
                      {Object.keys(eventData[eventSelected] || {}).map(zone => (
                        <option key={zone} value={zone}>
                          {zone.charAt(0).toUpperCase() + zone.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="w-full justify-center items-center">
                  {eventZoneSelected !== '' && (
                    <>
                      <div className="mt-4 font-bold text-xl">
                        Click on the map to select a Zone
                      </div>
                      <InteractiveMap
                        key={eventZoneSelected}
                        handleClickImageZone={async area => {
                          try {
                            const parsedSeats = await handleGetAreaSeats(area.title, label)

                            let selectedOptions = area.Options
                            selectedOptions.map.reservedSeats = parsedSeats
                            setSeatchartCurrentOptions(selectedOptions)
                            setSeatchartCurrentArea(area)
                          } catch (error) {
                            console.error('Error fetching area seats:', error)
                          }
                        }}
                        getDefaultMap={
                          mapConfig[label!]?.zones?.[eventZoneSelected]?.defaultMap ||
                          mapConfig[label!]?.defaultMap ||
                          (() => ({ name: '', areas: [] })) // Default empty map
                        }
                        width={windowSize < 768 ? (windowSize * 7) / 8 : windowSize / 2}
                        src={
                          mapConfig[label!]?.zones?.[eventZoneSelected]?.src ||
                          mapConfig[label!]?.src ||
                          ''
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {seatchartCurrentOptions && (
              <div className="mt-4 w-auto">
                <div className="bg-gray-300 rounded-xl p-4  m-4">
                  <div className="text-xl font-bold">Select your seat</div>
                  <Seatchart
                    options={seatchartCurrentOptions}
                    ref={seatchartRef}
                    onSeatClick={handleOnSeatClick}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Receipt */}
          <div className="w-full p-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Summary</h2>
              {cart?.length > 0 ? (
                <>
                  {cart?.map((ticket, index) => {
                    return (
                      <div
                        key={index}
                        className={`mb-4 pb-4 border-b-2 border-gray flex justify-between flex-row`}
                      >
                        <div>
                          <a className="pr-5">
                            Ticket {ticket.subZone} -{' '}
                            {ticket.seatLabel.includes('♿')
                              ? `${ticket.seatLabel} - ADA`
                              : ticket.seatLabel.includes('🚹')
                                ? `${ticket.seatLabel} - COMP`
                                : ticket.seatLabel.includes('🦽')
                                  ? `${ticket.seatLabel} - Limited Mobility Seat`
                                  : ticket.seatLabel}{' '}
                          </a>
                          <button
                            className="btn btn-circle bg-red-700 text-white"
                            onClick={() => {
                              const sessionIdCookie = getCookie('sessionId')
                              const lockingSeat = {
                                Seat: ticket.seatLabel,
                                row: ticket.coords.row,
                                col: ticket.coords.col,
                                subZone: seatchartCurrentArea.title,
                                sessionId: sessionIdCookie
                              }
                              lockSeats(lockingSeat)
                              onTicketClick(ticket)
                            }}
                          >
                            {' '}
                            X
                          </button>

                          <p className="font-bold">Ticket Total</p>
                        </div>

                        <div>
                          <br />
                          <br />
                          <p className="font-bold">${ticket.price_final.toFixed(2)} USD</p>
                        </div>
                      </div>
                    )
                  })}

                  {/* Total Cost */}
                  <div className="mt-8 flex justify-between">
                    <div>
                      <p className="text-xl font-bold">Total</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">${totalCost.toFixed(2)} USD</p>
                    </div>
                  </div>
                  {/* Proceed to Checkout Button */}
                  <div className="flex justify-center">
                    <button
                      className="bg-green-500 w-1/3 hover:bg-green-600 text-white py-2 px-4 rounded mt-4"
                      onClick={() => handleCheckout()}
                      disabled={!cart || cart.length == 0 || cart.length > 10}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-red-600 text-xl font-bold">
                  {' '}
                  You haven't selected any tickets yet!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
