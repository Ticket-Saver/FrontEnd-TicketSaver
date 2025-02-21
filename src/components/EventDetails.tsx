import { useParams } from 'react-router-dom'

const EventDetails = () => {
  const { eventName } = useParams()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{eventName}</h1>
      {/* Añade aquí el resto de la implementación */}
    </div>
  )
}

export default EventDetails
