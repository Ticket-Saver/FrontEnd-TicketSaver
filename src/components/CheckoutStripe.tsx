import { useEffect, useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

// Verificar la clave pública de Stripe
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY
console.log('Stripe Public Key:', STRIPE_PUBLIC_KEY ? 'Existe' : 'No existe', {
  key: STRIPE_PUBLIC_KEY,
  env: import.meta.env
})

// Solo cargar Stripe si existe la clave
const stripePromise = STRIPE_PUBLIC_KEY
  ? loadStripe(STRIPE_PUBLIC_KEY)
  : Promise.reject('No Stripe Public Key found')

stripePromise
  .then(stripe => console.log('Stripe loaded successfully:', !!stripe))
  .catch(error => console.error('Error loading Stripe:', error))

const CheckoutStripe = () => {
  const [clientSecret, setClientSecret] = useState(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const cartString = localStorage.getItem('cart_checkout')
      if (!cartString) {
        throw new Error('No sale to make payment for.')
      }

      const { cart, eventInfo, customer } = JSON.parse(cartString)

      // Ensure cart is an array
      if (!Array.isArray(cart)) {
        throw new Error('Invalid cart data.')
      }
      console.log('Demo Mode - Data:', { cart, eventInfo, customer })

      // Simular respuesta de Stripe en modo demo
      const demoClientSecret = 'demo_' + Math.random().toString(36).substr(2, 9)
      setClientSecret(demoClientSecret)

      return

      // Código original comentado
      /*
      const response = await fetch('/.netlify/functions/checkoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart, eventInfo, customer })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      */
    } catch (error) {
      console.error('Error al obtener el pago de Stripe:', error)
      throw error
    }
  }, [])
  useEffect(() => {
    fetchClientSecret()
  }, [fetchClientSecret])

  // Componente de checkout demo
  const DemoCheckoutForm = () => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/25',
      cvc: '123'
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsProcessing(true)

      try {
        // Guardar los datos del cliente en localStorage
        const cartCheckout = JSON.parse(localStorage.getItem('cart_checkout') || '{}')
        localStorage.setItem(
          'cart_checkout',
          JSON.stringify({
            ...cartCheckout,
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email
            }
          })
        )

        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000))

        setIsProcessing(false)
        setIsComplete(true)

        // Redirigir después de un pago exitoso
        setTimeout(() => {
          window.location.href = '/success'
        }, 1500)
      } catch (error) {
        console.error('Error en el proceso:', error)
        setIsProcessing(false)
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
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
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
          Modo Demo - Simulación de Checkout
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información personal */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Información de tarjeta */}
          <div className="border-t pt-4 mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Número de Tarjeta</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-50"
                value={formData.cardNumber}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Expiración</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-50"
                  value={formData.expiry}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CVC</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-50"
                  value={formData.cvc}
                  disabled
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg ${
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

  return (
    <div id="checkout">
      {clientSecret && clientSecret.startsWith('demo_') ? (
        <DemoCheckoutForm />
      ) : (
        clientSecret && (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )
      )}
    </div>
  )
}

export default CheckoutStripe
