import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

interface OrderResponse {
  id: number
  short_id: string
  total_gross: number
  status: string
  payment_status: string
  currency: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  public_id: string
  order_items: Array<{
    item_name: string
    quantity: number
    price: number
  }>
  attendees: Array<{
    public_id: string
    ticket_id: string
    email: string
    status: string
    first_name: string
    last_name: string
    created_at: string
    ticket: {
      title: string
      price_final: number
      seat_label?: string
    }
  }>
}

const SuccessCheckout = () => {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { orderId } = useParams()

  useEffect(() => {
    const createAttendeeAndFetchOrder = async () => {
      try {
        setLoading(true)
        const attendeesDataStr = localStorage.getItem('attendees_data')
        console.log('Datos recuperados del localStorage:', attendeesDataStr)

        if (!attendeesDataStr) {
          throw new Error('No se encontraron datos de asistentes en localStorage')
        }

        const attendeesData = JSON.parse(attendeesDataStr)
        console.log('Datos parseados:', attendeesData)

        if (!attendeesData.attendees || !attendeesData.cart || !attendeesData.eventInfo) {
          console.error('Datos incompletos:', attendeesData)
          throw new Error('Datos de asistentes incompletos')
        }

        const token2 = import.meta.env.VITE_TOKEN_HIEVENTS

        // Procesar cada asistente de forma secuencial
        const results = []
        for (let index = 0; index < attendeesData.cart.length; index++) {
          const ticket = attendeesData.cart[index]
          const attendee = attendeesData.attendees[index]

          // Intentar registrar el asistente con reintentos
          let attempts = 0
          let success = false
          let lastError = null

          while (attempts < 3 && !success) {
            try {
              const attendeeData = {
                ticket_id: ticket.priceType.replace('price_', ''),
                email: attendee.email,
                first_name: attendee.firstName,
                last_name: attendee.lastName,
                amount_paid: ticket.price_final,
                send_confirmation_email: true,
                taxes_and_fees: [],
                locale: 'es',
                ticket_price_id: ticket.priceType.replace('price_', '')
              }

              console.log('Registrando asistente:', attendeeData)

              const attendeeResponse = await fetch(
                `${import.meta.env.VITE_HIEVENTS_API_URL}events/${attendeesData.eventInfo.venueId}/attendees`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token2}`
                  },
                  body: JSON.stringify(attendeeData)
                }
              )

              if (!attendeeResponse.ok) {
                const errorData = await attendeeResponse.json()
                console.error('Error en registro:', errorData)
                lastError = errorData
                // Si es un error de versión, esperar un momento antes de reintentar
                if (errorData.message?.includes('version mismatch')) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)))
                } else {
                  throw new Error(JSON.stringify(errorData))
                }
              } else {
                const result = await attendeeResponse.json()
                // Combinar los datos de la respuesta con los datos originales del asistente
                const enrichedResult = {
                  ...result,
                  first_name: attendeeData.first_name,
                  last_name: attendeeData.last_name,
                  email: attendeeData.email,
                  amount_paid: attendeeData.amount_paid,
                  ticket: {
                    ...result.ticket,
                    title: ticket.zoneName || 'Boleto',
                    price_final: attendeeData.amount_paid
                  }
                }
                results.push(enrichedResult)
                success = true
              }
            } catch (error) {
              lastError = error
            }
            attempts++
          }

          if (!success) {
            throw new Error(
              `Error al registrar asistente después de ${attempts} intentos: ${JSON.stringify(lastError)}`
            )
          }

          // Esperar un momento entre registros
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Usar el primer resultado para mostrar en la UI
        if (results.length > 0) {
          const firstResult = results[0]
          // Adaptar la respuesta al formato OrderResponse
          setOrderData({
            id: firstResult.id || 0,
            short_id: firstResult.short_id || '',
            total_gross: results.reduce((sum, result) => sum + (result.amount_paid || 0), 0),
            status: 'completed',
            payment_status: 'paid',
            currency: 'USD',
            first_name: firstResult.first_name,
            last_name: firstResult.last_name,
            email: firstResult.email,
            created_at: firstResult.created_at || new Date().toISOString(),
            public_id: firstResult.public_id,
            order_items: results.map(result => ({
              item_name: result.ticket?.title || 'Boleto',
              quantity: 1,
              price: result.amount_paid || 0
            })),
            attendees: results.map(result => ({
              public_id: result.public_id,
              ticket_id: result.ticket_id,
              email: result.email,
              status: result.status || 'active',
              first_name: result.first_name,
              last_name: result.last_name,
              created_at: result.created_at || new Date().toISOString(),
              ticket: {
                title: result.ticket?.title || 'Boleto',
                price_final: result.amount_paid || 0,
                seat_label: result.ticket?.seat_label
              }
            }))
          })
        }

        // Limpiar los datos del localStorage
        localStorage.removeItem('attendees_data')
        localStorage.removeItem('cart_checkout')
      } catch (err) {
        console.error('Error general:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    createAttendeeAndFetchOrder()
  }, [])

  const firstAttendee = orderData?.attendees?.[0]

  const qrData = firstAttendee
    ? JSON.stringify({
        ticketId: firstAttendee.public_id,
        eventId: firstAttendee.ticket_id,
        attendee: `${firstAttendee.first_name} ${firstAttendee.last_name}`,
        email: firstAttendee.email,
        seat: firstAttendee.ticket?.seat_label || '',
        status: firstAttendee.status,
        shortId: firstAttendee.public_id
      })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!orderData) return null

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Encabezado */}
          <div className="bg-green-500 text-white px-6 py-4">
            <h2 className="text-2xl font-bold">¡Pago Completado con Éxito!</h2>
            <p className="text-green-100">Orden ID: {orderData?.public_id}</p>
          </div>

          {/* Información principal */}
          <div className="p-6 space-y-6">
            {/* Detalles de los asistentes */}
            {orderData?.attendees.map((attendee, index) => (
              <div key={index} className="border-b pb-6">
                <h3 className="text-xl font-bold mb-4">Asistente {index + 1}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">
                      {attendee.first_name} {attendee.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correo electrónico</p>
                    <p className="font-medium">{attendee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="font-medium">{attendee.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Boleto</p>
                    <p className="font-medium">{attendee.ticket.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio</p>
                    <p className="font-medium">${attendee.ticket.price_final}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID del Boleto</p>
                    <p className="font-medium">{attendee.public_id}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Detalles del pedido */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total de Boletos</p>
                  <p className="font-medium">{orderData?.attendees.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto total del pedido</p>
                  <p className="font-medium">${orderData?.total_gross}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado del Pago</p>
                  <p className="font-medium text-green-600">COMPLETADO</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Compra</p>
                  <p className="font-medium">
                    {new Date(orderData?.created_at || '').toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Codes para cada boleto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orderData?.attendees.map((attendee, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-2">Boleto {index + 1}</h4>
                  <QRCodeSVG
                    value={JSON.stringify({
                      ticketId: attendee.public_id,
                      eventId: attendee.ticket_id,
                      attendee: `${attendee.first_name} ${attendee.last_name}`,
                      email: attendee.email,
                      status: attendee.status
                    })}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="mx-auto mb-4"
                  />
                  <p className="text-center text-sm font-medium">{attendee.public_id}</p>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2"
                  />
                  <path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" />
                  <path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" />
                </svg>
                Imprimir Boletos
              </button>

              <button
                onClick={() => {
                  const ticketUrl = window.location.href
                  navigator.clipboard.writeText(ticketUrl)
                  alert('Link copiado al portapapeles')
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                  <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                </svg>
                Copiar link
              </button>

              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessCheckout
