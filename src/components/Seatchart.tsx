import React, { forwardRef, useEffect, useRef } from 'react'
import SeatchartJS, { Options, CartChangeEvent } from 'seatchart'

interface SeatchartProps {
  options: Options
  onSeatClick: (e: CartChangeEvent) => void
}

function setForwardedRef<T>(ref: React.ForwardedRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const Seatchart = forwardRef<SeatchartJS | undefined, SeatchartProps>(
  ({ options, onSeatClick }, ref) => {
    const seatchartRef = useRef<SeatchartJS>()
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (elementRef.current && !seatchartRef.current) {
        seatchartRef.current = new SeatchartJS(elementRef.current, options)
        seatchartRef.current.addEventListener('cartchange', onSeatClick)
        setForwardedRef(ref, seatchartRef.current)

        return () => {
          seatchartRef.current = undefined
          setForwardedRef(ref, undefined)
        }
      }
    }, [options])

    return (
      <div
        className="relative overflow-x-auto w-full max-w-full h-[500px] w-[600px] x-sm:w-full x-sm:px-6 lg:mb-0"
        ref={elementRef}
      />
    )
  }
)

Seatchart.displayName = 'Seatchart'
export default Seatchart
