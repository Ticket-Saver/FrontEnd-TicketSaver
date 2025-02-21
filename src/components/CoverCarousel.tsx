import { useState, useEffect } from 'react'

export default function CoverCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      id: 1,
      imageUrl: '/events/turbulence-sf.jpg',
      caption: 'Welcome to Ticketsaver!'
    },
    {
      id: 2,
      imageUrl: '/events/IndiaYuridia.jpg',
      caption: 'Discover amazing events!'
    },
    {
      id: 3,
      imageUrl: '/events/Leonas.jpg',
      caption: 'We save you the seats so you can savour the night'
    },
    {
      id: 4,
      imageUrl: '/events/turbulence-sf.jpg',
      caption: ''
    },
    {
      id: 5,
      imageUrl: '/events/turbulence-sj.jpg',
      caption: ''
    }
  ]

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide === slides.length - 1 ? 0 : prevSlide + 1))
    }, 6000) // 6 seconds interval

    return () => clearInterval(intervalId)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide(prevSlide => (prevSlide === slides.length - 1 ? 0 : prevSlide + 1))
  }

  const prevSlide = () => {
    setCurrentSlide(prevSlide => (prevSlide === 0 ? slides.length - 1 : prevSlide - 1))
  }

  return (
    <div className="carousel-container relative w-full">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`carousel-item ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 hidden'
          } flex justify-center items-center transition-opacity duration-500`}
          onClick={() => console.log('click a', slide.id)}
        >
          <div className="w-full relative">
            <img
              src={slide.imageUrl}
              alt={`Slide ${slide.id}`}
              className="w-full overflow-hidden object-cover"
              style={{
                height: slide.id === 2 || slide.id === 3 ? '60vh' : '50vh',
                width: slide.id === 2 || slide.id === 3 ? '100%' : '100%'
              }}
            />
            <div className="absolute bottom-4 left-0 w-full flex justify-center">
              <div className="bg-black bg-opacity-50 rounded-lg py-2 px-4">
                <h1 className="text-white text-4xl font-bold">{slide.caption}</h1>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 btn btn-circle btn-lg bg-neutral opacity-50"
        onClick={prevSlide}
      >
        ❮
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 btn btn-circle btn-lg bg-neutral opacity-50"
        onClick={nextSlide}
      >
        ❯
      </button>
    </div>
  )
}
