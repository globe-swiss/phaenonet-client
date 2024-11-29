export const defaultMapParams = { center: { lat: 46.818188, lng: 8.227512 }, zoom: 9 };
export const defaultBasemap = 0;

interface BasemapDefinition {
  mapTypeID: google.maps.MapTypeId; // Use Google Maps type for MapTypeId
  styles: google.maps.MapTypeStyle[]; // Use Google Maps type for styles
}

export const basemaps: BasemapDefinition[] = [
  {
    mapTypeID: google.maps.MapTypeId.TERRAIN,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [
          {
            color: '#ffffff'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#000000'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'administrative.neighborhood',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#e0dfe0'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          {
            color: '#a8a9a8'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [
          {
            saturation: -100
          },
          {
            lightness: 45
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#5b5b5a'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [
          {
            visibility: 'simplified'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#ffffff'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      }
    ]
  },
  {
    mapTypeID: google.maps.MapTypeId.HYBRID,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [
          {
            color: '#ffffff'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#000000'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'administrative.neighborhood',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#e0dfe0'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          {
            color: '#a8a9a8'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [
          {
            saturation: -100
          },
          {
            lightness: 45
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#5b5b5a'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [
          {
            visibility: 'simplified'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#ffffff'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      }
    ]
  },
  {
    mapTypeID: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [
          {
            color: '#ffffff'
          },
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#000000'
          },
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'administrative.neighborhood',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#e0dfe0'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          {
            color: '#a8a9a8'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [
          {
            saturation: -100
          },
          {
            lightness: 45
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'off'
          },
          {
            color: '#5b5b5a'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#ffffff'
          },
          {
            visibility: 'on'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      }
    ]
  }
];
