import { useState, useEffect } from 'react'
import ImageMapper from 'react-img-mapper'

import 'seatchart/dist/seatchart.min.css'

interface Area {
  shape: string
  coords: number[]
  polygon?: number[][]
  preFillColor?: string | undefined
  [key: string]: any
}

interface Map {
  name: string
  areas: Area[]
}

interface InteractiveMapProps {
  handleClickImageZone: (area: Area) => void
  getDefaultMap: () => Map
  src: string
  width: number
}

const InteractiveMap = ({
  handleClickImageZone,
  getDefaultMap,
  src,
  width
}: InteractiveMapProps) => {
  const [highlightedAreas, setHighlightedAreas] = useState<Area[]>([])
  const [updatedMap, setUpdatedMap] = useState(getDefaultMap())
  const height = width

  useEffect(() => {
    const map = { ...getDefaultMap() }
    map.areas = map.areas.map(mapArea => {
      const newArea = { ...mapArea }
      newArea.coords = newArea.coords.map((coord, index) => {
        return index % 2 === 0 ? (coord / 1328) * width : (coord / 1328) * height
      })

      if (newArea.polygon) {
        newArea.polygon = newArea.polygon.map(point => {
          return point.map((coord, index) => {
            return index % 2 === 0 ? (coord / 1328) * width : (coord / 1328) * height
          })
        })
      }

      if (
        highlightedAreas.some(
          highlightedArea =>
            JSON.stringify(highlightedArea.coords) === JSON.stringify(newArea.coords)
        )
      ) {
        newArea.preFillColor = 'rgba(255, 255, 0, 0.5)'
      } else {
        newArea.preFillColor = ''
      }
      return newArea
    })
    setUpdatedMap(map)
  }, [highlightedAreas, width, height, getDefaultMap])

  const handleAreaClick = (area: Area) => {
    handleClickImageZone(area)
    setHighlightedAreas([area])
  }

  return (
    <div className="flex-row overflow-visible justify-center content-center ">
      <div className="justify-center content-center items-center overline mt-4 cursor-pointer">
        <ImageMapper
          src={src}
          map={updatedMap}
          width={width}
          height={height}
          onClick={handleAreaClick}
          stayHighlighted={true}
          stayMultiHighlighted={false}
          toggleHighlighted={true}
        />
      </div>
    </div>
  )
}

export default InteractiveMap
