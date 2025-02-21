import { useState, useEffect } from 'react'

const useFetchJson = (url: string, options?: RequestInit) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error('response error')
        }
        const eventData = await response.json()
        console.log(eventData)
        setData(eventData)
      } catch (error) {
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  // Only return data if it's not empty
  return { data: Object.keys(data).length > 0 ? data : null, loading, error }
}

const findData = (data: any[], id: string) => {
  return data.find(item => item.id === id)
}

const fetchGitHubImage = async (label: string): Promise<string> => {
  const token = import.meta.env.VITE_GITHUB_TOKEN //
  const Url = `${import.meta.env.VITE_GITHUB_API_URL as string}/banners/${label}.png`

  const response = await fetch(Url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.raw'
    }
  })

  if (!response.ok) {
    throw new Error(`Error al obtener la imagen: ${response.status} ${response.statusText}`)
  }

  // Convertir la respuesta en un Blob de la imagen
  const blob = await response.blob()

  // Convertir el Blob en una URL para usarla en el componente
  const imageUrl = URL.createObjectURL(blob)

  return imageUrl
}
const fetchDescription = async (label: string, options: any): Promise<any> => {
  const Url = `${import.meta.env.VITE_GITHUB_API_URL as string}/events/${label}/description.txt`
  try {
    const response = await fetch(Url, options)
    if (!response.ok) {
      throw new Error(`Error en la respuesta de GitHub: ${response.status} ${response.statusText}`)
    }
    const description = response.text()
    return description
  } catch (error) {
    console.error('Error obteniendo los datos', error)
    throw error
  }
}
export { useFetchJson, findData, fetchGitHubImage, fetchDescription }
