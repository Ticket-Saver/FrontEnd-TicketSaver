import { useEffect, useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

// Verificar la clave pública de Stripe
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
console.log('Stripe Public Key:', STRIPE_PUBLIC_KEY ? 'Existe' : 'No existe')

// Solo cargar Stripe si existe la clave
const stripePromise = STRIPE_PUBLIC_KEY
  ? loadStripe(STRIPE_PUBLIC_KEY)
  : Promise.reject('No se encontró la clave pública de Stripe')

stripePromise
  .then(stripe => console.log('Stripe loaded successfully:', !!stripe))
  .catch(error => console.error('Error loading Stripe:', error))

const CheckoutStripe = () => {
  const [clientSecret, setClientSecret] = useState(null)

  const registerAttendeesWithHiEvents = async (customerData: any, cart: any[], eventInfo: any) => {
    try {
      // Agrupar tickets por tipo y cantidad
      const ticketGroups = cart.reduce((acc: any, ticket: any) => {
        const key = `${ticket.zoneName}-${ticket.priceType}`
        if (!acc[key]) {
          acc[key] = {
            ticket,
            count: 1
          }
        } else {
          acc[key].count++
        }
        return acc
      }, {})

      // Registrar cada ticket según su cantidad
      const registerAttendees = Object.values(ticketGroups).flatMap((group: any) => {
        const { ticket, count } = group
        return Array(count)
          .fill(null)
          .map(async () => {
            const attendeeData = {
              ticket_id: ticket.priceType.replace('price_', ''),
              email: customerData.email,
              first_name: customerData.firstName || '',
              last_name: customerData.lastName || '',
              amount_paid: ticket.price_final,
              locale: 'es',
              send_confirmation_email: true,
              taxes_and_fees: [],
              ticket_price_id: ticket.priceType.replace('price_', '')
            }

            console.log('Registrando attendee:', {
              zona: ticket.zoneName,
              tipo: ticket.priceType,
              datos: attendeeData
            })

            const response = await fetch(
              `${import.meta.env.VITE_HIEVENTS_API_URL}events/${eventInfo.venueId}/attendees`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: `Bearer ${import.meta.env.VITE_TOKEN_HIEVENTS}`
                },
                body: JSON.stringify(attendeeData)
              }
            )

            if (!response.ok) {
              const errorData = await response.json()
              console.error('Error en registro de asistente:', errorData)
              throw new Error(`Error al registrar asistente: ${JSON.stringify(errorData)}`)
            }

            return response.json()
          })
      })

      // Esperar a que todos los registros se completen
      return Promise.all(registerAttendees)
    } catch (error) {
      console.error('Error en registerAttendeesWithHiEvents:', error)
      throw error
    }
  }

  const fetchClientSecret = useCallback(async () => {
    try {
      const cartString = localStorage.getItem('cart_checkout')
      if (!cartString) {
        throw new Error('No sale to make payment for.')
      }

      const { cart, eventInfo, customer } = JSON.parse(cartString)

      if (!Array.isArray(cart)) {
        throw new Error('Invalid cart data.')
      }

      // Verificar ambiente y modo demo
      const isDevelopment = import.meta.env.MODE === 'development'
      const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

      // Usar checkout simulado si estamos en desarrollo o modo demo
      if (isDevelopment || isDemo) {
        console.log('Usando checkout demo')
        const demoClientSecret = 'demo_' + Math.random().toString(36).substr(2, 9)
        setClientSecret(demoClientSecret)
        return
      }

      // Usar la API de HiEvents para el checkout
      const apiUrl = import.meta.env.VITE_HIEVENTS_API_URL
      if (!apiUrl) {
        console.error('VITE_HIEVENTS_API_URL no está definida')
        throw new Error('Error de configuración: URL de API no definida')
      }

      console.log('URL de la API:', apiUrl)

      // Usar el endpoint de pagos de HiEvents
      console.log('Creando sesión de pago en HiEvents')
      const response = await fetch(`${apiUrl}events/${eventInfo.venueId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_TOKEN_HIEVENTS}`
        },
        body: JSON.stringify({
          cart: cart.map(item => ({
            ...item,
            price_final: Math.round(item.price_final * 100), // Convertir a centavos para Stripe
            ticket_id: item.priceType.replace('price_', '')
          })),
          customer: {
            email: customer.email,
            first_name: customer.firstName,
            last_name: customer.lastName
          },
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/checkout`,
          mode: 'payment'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error al crear sesión de pago:', errorData)
        throw new Error(errorData.message || 'Error al crear la sesión de pago')
      }

      const data = await response.json()
      console.log('Sesión de pago creada:', data.clientSecret ? 'Success' : 'Failed')
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error('Error al obtener el pago:', error)
      // Si hay cualquier error, usar modo demo temporalmente
      console.log('Error en el proceso, usando modo demo temporalmente')
      const demoClientSecret = 'demo_' + Math.random().toString(36).substr(2, 9)
      setClientSecret(demoClientSecret)
    }
  }, [])

  useEffect(() => {
    fetchClientSecret()
  }, [fetchClientSecret])

  // Componente de checkout demo
  const DemoCheckoutForm = () => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [mainFormData, setMainFormData] = useState({
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/25',
      cvc: '123'
    })

    // Estado para los datos de los asistentes
    const [attendees, setAttendees] = useState<
      Array<{
        firstName: string
        lastName: string
        email: string
      }>
    >([{ firstName: '', lastName: '', email: '' }])

    // Cargar la cantidad de tickets al montar el componente
    useEffect(() => {
      const cartData = JSON.parse(localStorage.getItem('cart_checkout') || '{}')
      if (cartData.cart) {
        const totalTickets = cartData.cart.length
        setAttendees(Array(totalTickets).fill({ firstName: '', lastName: '', email: '' }))
      }
    }, [])

    const handleAttendeeChange = (index: number, field: string, value: string) => {
      const newAttendees = [...attendees]
      newAttendees[index] = { ...newAttendees[index], [field]: value }
      setAttendees(newAttendees)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        // Validar que todos los campos estén completos
        const isValid = attendees.every(
          attendee => attendee.firstName && attendee.lastName && attendee.email
        )

        if (!isValid) {
          throw new Error('Por favor complete todos los campos de los asistentes')
        }

        // Guardar los datos de los asistentes antes de procesar el pago
        const cartCheckout = JSON.parse(localStorage.getItem('cart_checkout') || '{}')
        localStorage.setItem(
          'attendees_data',
          JSON.stringify({
            attendees,
            cart: cartCheckout.cart,
            eventInfo: cartCheckout.eventInfo
          })
        )

        setIsProcessing(true)

        // Simular proceso de pago
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsProcessing(false)
        setIsComplete(true)

        setTimeout(() => {
          window.location.href = '/success'
        }, 1500)
      } catch (error) {
        console.error('Error en el proceso:', error)
        setIsProcessing(false)
        alert(error instanceof Error ? error.message : 'Error en el proceso de pago')
      }
    }

    if (isComplete) {
      return (
        <div className="p-6 text-center">
          <div className="text-green-500 text-xl mb-4">¡Pago completado con éxito!</div>
          <div>Redirigiendo...</div>
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
          Modo Demo - Simulación de Checkout
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Formularios de asistentes */}
          {attendees.map((attendee, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Asistente {index + 1}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={attendee.firstName}
                    onChange={e => handleAttendeeChange(index, 'firstName', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={attendee.lastName}
                    onChange={e => handleAttendeeChange(index, 'lastName', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={attendee.email}
                    onChange={e => handleAttendeeChange(index, 'email', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Información de pago */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Número de Tarjeta</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-50"
                value={mainFormData.cardNumber}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Expiración</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-50"
                  value={mainFormData.expiry}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CVC</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-50"
                  value={mainFormData.cvc}
                  disabled
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Pagar'}
          </button>
        </form>
      </div>
    )
  }

  // Componente para el checkout real de Stripe
  const StripeCheckout = () => {
    const [status, setStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial')
    const [attendees, setAttendees] = useState<
      Array<{
        firstName: string
        lastName: string
        email: string
      }>
    >([])

    useEffect(() => {
      // Cargar la cantidad de tickets y crear formularios de asistentes
      const cartData = JSON.parse(localStorage.getItem('cart_checkout') || '{}')
      if (cartData.cart) {
        const totalTickets = cartData.cart.length
        setAttendees(Array(totalTickets).fill({ firstName: '', lastName: '', email: '' }))
      }
    }, [])

    const handleAttendeeChange = (index: number, field: string, value: string) => {
      const newAttendees = [...attendees]
      newAttendees[index] = { ...newAttendees[index], [field]: value }
      setAttendees(newAttendees)
    }

    const validateAndSaveAttendees = () => {
      try {
        // Validar que todos los campos de asistentes estén completos
        const isValid = attendees.every(
          attendee => attendee.firstName && attendee.lastName && attendee.email
        )

        if (!isValid) {
          throw new Error('Por favor complete todos los datos de los asistentes')
        }

        // Guardar los datos de los asistentes
        const cartCheckout = JSON.parse(localStorage.getItem('cart_checkout') || '{}')
        localStorage.setItem(
          'attendees_data',
          JSON.stringify({
            attendees,
            cart: cartCheckout.cart,
            eventInfo: cartCheckout.eventInfo
          })
        )

        return true
      } catch (error) {
        console.error('Error validando asistentes:', error)
        alert(
          error instanceof Error ? error.message : 'Error validando los datos de los asistentes'
        )
        return false
      }
    }

    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Formularios de asistentes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Información de los Asistentes</h2>
          {attendees.map((attendee, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
              <h3 className="text-lg font-semibold">Asistente {index + 1}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={attendee.firstName}
                    onChange={e => handleAttendeeChange(index, 'firstName', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={attendee.lastName}
                    onChange={e => handleAttendeeChange(index, 'lastName', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={attendee.email}
                    onChange={e => handleAttendeeChange(index, 'email', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de validación antes del checkout */}
        <button
          onClick={() => {
            if (validateAndSaveAttendees()) {
              // Mostrar el formulario de Stripe solo después de validar
              document.querySelector('.StripeCheckout')?.classList.remove('hidden')
            }
          }}
          className="w-full mb-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
        >
          Continuar al pago
        </button>

        {/* Estados del proceso */}
        {status === 'processing' && (
          <div className="text-center p-4 bg-blue-100 text-blue-700 rounded-lg mb-4">
            Procesando su pago...
          </div>
        )}
        {status === 'success' && (
          <div className="text-center p-4 bg-green-100 text-green-700 rounded-lg mb-4">
            ¡Pago exitoso! Redirigiendo...
          </div>
        )}
        {status === 'error' && (
          <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            Hubo un error procesando su pago.
          </div>
        )}

        {/* Stripe Checkout */}
        <div className="mt-4 hidden">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    )
  }

  return (
    <div id="checkout">
      {clientSecret && clientSecret.startsWith('demo_') ? (
        <DemoCheckoutForm />
      ) : (
        clientSecret && <StripeCheckout />
      )}
    </div>
  )
}

export default CheckoutStripe
