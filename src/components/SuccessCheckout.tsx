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
        const cartData = JSON.parse(localStorage.getItem('cart_checkout') || '{}')
        const token2 = import.meta.env.VITE_TOKEN_HIEVENTS
        console.log('Cart Data:', cartData)
        const eventId = cartData.eventInfo?.venueId || '1' // Usamos '2' como fallback
        //console.log('wow',eventId);
        try {
          const attendeeResponse = await fetch(
            `https://localhost:8443/api/events/${eventId}/attendees`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token2}`
              },
              // @ts-ignore
              rejectUnauthorized: false,
              body: JSON.stringify({
                ticket_id: '265',
                email: cartData.customer?.email,
                first_name: cartData.customer?.firstName,
                last_name: cartData.customer?.lastName,
                amount_paid: cartData.cart?.[0]?.price_final || 2,
                send_confirmation_email: true,
                taxes_and_fees: [],
                locale: 'es',
                ticket_price_id: '265'
              })
            }
          )

          console.log('Attendee Response:', attendeeResponse)
          const attendeeData = await attendeeResponse.json()
          console.log('Attendee Data:', attendeeData)

          // Obtener los detalles del attendee usando el ID generado
          const attendeeDetailsResponse = await fetch(
            `https://localhost:8443/api/events/${eventId}/attendees/${attendeeData.data.id}`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token2}`
              },
              // @ts-ignore
              rejectUnauthorized: false
            }
          )

          const attendeeDetails = await attendeeDetailsResponse.json()
          console.log('Attendee Details:', attendeeDetails)

          // Aquí puedes mostrar los detalles del attendee en la UI
          setOrderData({
            ...orderData,
            attendeeDetails: attendeeDetails.data
          })
        } catch (error) {
          console.error('Error in API calls:', error)
          throw error
        }
      } catch (err) {
        console.error('General error:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    createAttendeeAndFetchOrder()
  }, [])

  const qrData = orderData?.attendeeDetails
    ? JSON.stringify({
        ticketId: orderData.attendeeDetails.public_id,
        eventId: orderData.attendeeDetails.event_id,
        attendee: `${orderData.attendeeDetails.first_name} ${orderData.attendeeDetails.last_name}`,
        email: orderData.attendeeDetails.email,
        seat: orderData.attendeeDetails.ticket.seat_label,
        status: orderData.attendeeDetails.status,
        shortId: orderData.attendeeDetails.short_id
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
            <p className="text-green-100">Ticket ID: {orderData.attendeeDetails?.public_id}</p>
          </div>

          {/* Información principal */}
          <div className="p-6 space-y-6">
            {/* Detalles de los asistentes */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4">Detalles de los asistentes</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">
                    {orderData.attendeeDetails?.first_name} {orderData.attendeeDetails?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correo electrónico</p>
                  <p className="font-medium">{orderData.attendeeDetails?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium">{orderData.attendeeDetails?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registrado</p>
                  <p className="font-medium">No</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Boleto</p>
                  <p className="font-medium">{orderData.attendeeDetails?.ticket.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Idioma</p>
                  <p className="font-medium">Spanish</p>
                </div>
              </div>
            </div>

            {/* Detalles del pedido */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4">Detalles del pedido</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">
                    {orderData.attendeeDetails?.first_name} {orderData.attendeeDetails?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correo electrónico</p>
                  <p className="font-medium">{orderData.attendeeDetails?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {new Date(orderData.attendeeDetails?.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium text-green-600">COMPLETED</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto total del pedido</p>
                  <p className="font-medium">${orderData.attendeeDetails?.ticket.price_final}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total reembolsado</p>
                  <p className="font-medium">$0.00</p>
                </div>
              </div>
            </div>

            {/* Boleto */}
            <div>
              <h3 className="text-xl font-bold mb-4">Boleto</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">
                  {orderData.attendeeDetails?.first_name} {orderData.attendeeDetails?.last_name}
                </p>
                <p className="text-gray-600">{orderData.attendeeDetails?.ticket.title}</p>
                <p className="text-gray-600">{orderData.attendeeDetails?.email}</p>
                <p className="text-gray-600">Gratis</p>
                <p className="text-gray-600">{orderData.attendeeDetails?.ticket.title}</p>
                <p className="text-gray-600">
                  {new Date(orderData.attendeeDetails?.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
                <p className="font-bold mt-2">{orderData.attendeeDetails?.public_id}</p>
              </div>
            </div>

            {/* QR Code Section */}
            {orderData.attendeeDetails && (
              <div className="flex flex-col items-center justify-center p-6 border-b">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold mb-2">
                    {orderData.attendeeDetails.public_id}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCodeSVG
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
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
                    Imprimir
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessCheckout
