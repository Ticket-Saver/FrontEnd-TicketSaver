const seatrangesToValues = (ranges: string[]): number[] => {
  // Inicializar la lista de valores que se devolverá
  const values: number[] = []

  // Iterar sobre cada string en la lista de rangos
  ranges.forEach(r => {
    const parsedNumber = parseInt(r, 10)

    if (!isNaN(parsedNumber)) {
      values.push(parsedNumber)
    } else {
      try {
        let param = r.split(',', 3).map(s => parseInt(s, 10))

        if (param.length === 2) {
          param.push(1)
        }
        const [start, end, step] = param

        const sgn = Math.sign(end - start)

        for (let i = start; i !== end + sgn; i += step) {
          values.push(i)
        }
      } catch (e) {
        console.error(`Error ${r}`, e)
      }
    }
  })
  return values
}
export { seatrangesToValues }

// precios y sus correspondientes zonas
const zone_prices_file = (data: any): { prices: any; seatmap: any } => {
  if (!('prices' in data) || !('zones' in data)) {
    throw new Error('info incomplete')
  }
  return {
    prices: data.prices,
    seatmap: data.zones
  }
}
export { zone_prices_file }

// dada los precios y sus correspondientes zonas, se regresa el nombre de la zona y los precios
const extractZonePrices = (tickets: any[]) => {
  return tickets.map(ticket => ({
    zone: ticket.title,
    prices: ticket.prices.map((price: any) => ({
      priceFinal: price.price_including_taxes_and_fees,
      available: !price.is_sold_out && price.is_available !== false,
      quantityAvailable: price.initial_quantity_available - price.quantity_sold
    }))
  }))
}

export { extractZonePrices }

const extractLatestPrices = (result: any) => {
  const latestPricesList: any = {}

  console.log('Starting extraction process...')

  for (const [priceTag, datePrices] of Object.entries(result.prices)) {
    console.log(`Processing price tag: ${priceTag}`)
    const availableDates = Object.keys(datePrices as Record<string, any>)

    if (availableDates.length > 0) {
      const mostRecentDate = availableDates.sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      )[0]

      const priceInfo = (datePrices as Record<string, any>)[mostRecentDate]

      latestPricesList[priceTag] = priceInfo
    } else {
      console.warn(`No available dates for ${priceTag}`)
    }
  }

  console.log('Final latestPricesList:', latestPricesList)
  return latestPricesList
}

export { extractLatestPrices }

// dada la zona y asiento, se regresa un precio"
const zoneseatToPrice = (seatmap: any, zone: string, seat: any): string => {
  for (const [priceType, rows] of Object.entries(seatmap[zone])) {
    const rowMap: Record<string, string[]> = rows as Record<string, string[]>
    try {
      const row = rowMap[seat[0]]
      if (seatrangesToValues(row).includes(seat[1])) {
        return priceType
      }
    } catch (error) {
      continue
    }
  }
  throw new Error('Seat out of range')
}

export { zoneseatToPrice }

//dado un tipo de precio, se regresa el monto
const pricetypeToAmount = (prices: any, priceType: string): number => {
  const priceHistory = prices[priceType]
  const dateObjs = Object.keys(priceHistory).map(date => new Date(date))
  dateObjs.sort((a, b) => a.getTime() - b.getTime())

  const dateTs = dateObjs.filter(date => date < new Date()).pop()
  if (!dateTs) {
    throw new Error('No valid date found')
  }

  const formattedDate = dateTs.toISOString().split('T')[0] //formato correcto según la funcionalidad YYYmmdd
  return priceHistory[formattedDate]['price_base']
}

export { pricetypeToAmount }

const find_price = (data: any, zone: string, seat: any): number => {
  const { prices, seatmap } = zone_prices_file(data)
  const priceType = zoneseatToPrice(seatmap, zone, seat)
  return pricetypeToAmount(prices, priceType)
}
export { find_price }
