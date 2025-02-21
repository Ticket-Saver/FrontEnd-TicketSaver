import californiaTheatreSvg from '../../assets/maps/Leonas/californiaTheatre.svg'
import unionCountySvg from '../../assets/maps/Leonas/union_county.svg'
import SanJoseMapPng from '../../assets/maps/IndiaYuridia/sanjose_ca.png'
import OrchestraMap2 from '../../assets/maps/IndiaYuridia/ticketeraMapa3.png'
import LogeMapPng from '../../assets/maps/IndiaYuridia/Loge.png'
import ManuelArtTimePng from '../../assets/maps/Leonas/manuelartime_fl.svg'

import LogeMap from './IndiaYuridia/LogeMap'
import OrchestraMap from './IndiaYuridia/OrchestraMap'
import SanJoseMap from './IndiaYuridia/sanjose_ca'

import CalifoniaTheatreMap from './Leonas/californiatheatre_ca'
import Unioncountry from './Leonas/unioncounty_nj'
import ManuelArtTime from './Leonas/ManuelArtTimeMap'

type EventZoneData = {
  zones: string[]
  priceTag: string[]
}

type EventData = {
  [eventName: string]: {
    [zoneName: string]: EventZoneData
  }
}
export interface MapConfig {
  [label: string]: {
    defaultMap?: any // O el tipo adecuado para tu mapa por defecto
    src?: string
    zones?: {
      [zone: string]: {
        defaultMap: any // O el tipo adecuado para tu mapa por defecto
        src: string
      }
    }
  }
}
export const eventData: EventData = {
  las_leonas03: {
    Map: {
      zones: ['Yellow', 'Orange', 'Purple', 'Coral', 'Green'],
      priceTag: ['P1', 'P2', 'P3', 'P4', 'P5']
    }
  },
  las_leonas02: {
    Map: {
      zones: ['Pink', 'Aqua', 'Blue', 'Gray', 'Coral'],
      priceTag: ['P1', 'P2', 'P3', 'P4', 'P5']
    }
  },
  las_leonas01: {
    Map: {
      zones: ['Yellow', 'Blue', 'Orange', 'Green'],
      priceTag: ['P1', 'P2', 'P3', 'P4']
    }
  },
  india_yuridia01: {
    orchestra: {
      zones: ['Orange', 'Green', 'Pink', 'Blue', 'Yellow', 'Purple'],
      priceTag: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
    }
    /* loge: {
      zones: [
        'Yellow',
        'Purple',
        'Gray',
        'Section 1',
        'Section 2',
        'Section 3',
        'Section 4',
        'Section 5',
        'Section 6'
      ],
      priceTag: ['P4', 'P5', 'P6', 'P3', 'P3', 'P4', 'P4', 'P4', 'P4']
    }*/
  },
  map1: {
    orchestra: {
      zones: ['Orange', 'Green', 'Pink', 'Blue', 'Yellow', 'Purple'],
      priceTag: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
    }
  },
  map2: {
    Map: {
      zones: ['Purple', 'Green', 'Blue', 'Red', 'Orange', 'Brown'],
      priceTag: ['P1', 'P2', 'P5', 'P3', 'P4', 'P6']
    }
  },
  india_yuridia02: {
    Map: {
      zones: ['Purple', 'Green', 'Blue', 'Red', 'Orange', 'Brown'],
      priceTag: ['P1', 'P2', 'P5', 'P3', 'P4', 'P6']
    }
  }
}
export const mapConfig: MapConfig = {
  'las_leonas.03': {
    zones: {
      Map: {
        defaultMap: CalifoniaTheatreMap,
        src: californiaTheatreSvg
      }
    }
  },
  'las_leonas.02': {
    zones: {
      Map: {
        defaultMap: Unioncountry,
        src: unionCountySvg
      }
    }
  },
  'las_leonas.01': {
    zones: {
      Map: {
        defaultMap: ManuelArtTime,
        src: ManuelArtTimePng
      }
    }
  },
  map1: {
    zones: {
      orchestra: {
        defaultMap: OrchestraMap,
        src: OrchestraMap2
      },
      loge: {
        defaultMap: LogeMap,
        src: LogeMapPng
      }
    }
  },
  map2: {
    zones: {
      orchestra: {
        defaultMap: OrchestraMap,
        src: OrchestraMap2
      },
      loge: {
        defaultMap: LogeMap,
        src: LogeMapPng
      }
    }
  },
  map1: {
    zones: {
      orchestra: {
        defaultMap: OrchestraMap,
        src: OrchestraMap2
      },
      loge: {
        defaultMap: LogeMap,
        src: LogeMapPng
      }
    }
  },
  map2: {
    zones: {
      orchestra: {
        defaultMap: OrchestraMap,
        src: OrchestraMap2
      },
      loge: {
        defaultMap: LogeMap,
        src: LogeMapPng
      }
    }
  },
  'india_yuridia.01': {
    zones: {
      orchestra: {
        defaultMap: OrchestraMap,
        src: OrchestraMap2
      },
      loge: {
        defaultMap: LogeMap,
        src: LogeMapPng
      }
    }
  },
  'india_yuridia.02': {
    zones: {
      Map: {
        defaultMap: SanJoseMap,
        src: SanJoseMapPng
      }
    }
  }
}
