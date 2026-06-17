import React, { useState } from 'react';
import { AdvancedMap, MapMarker } from "./interactive-map";

export default function DemoOne() {
  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: 1,
      position: [51.505, -0.09],
      color: 'blue',
      size: 'medium',
      popup: {
        title: 'London',
        content: 'Capital of England',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=60'
      }
    },
    {
      id: 2,
      position: [51.51, -0.1],
      color: 'red',
      size: 'large',
      popup: {
        title: 'Westminster',
        content: 'Political center'
      }
    }
  ]);

  const polygons = [
    {
      id: 1,
      positions: [
        [51.515, -0.09] as [number, number],
        [51.52, -0.1] as [number, number],
        [51.52, -0.12] as [number, number]
      ],
      style: { color: 'green', weight: 2, fillOpacity: 0.4 },
      popup: 'Hyde Park Area'
    }
  ];

  const circles = [
    {
      id: 1,
      center: [51.508, -0.11] as [number, number],
      radius: 500,
      style: { color: 'purple', fillOpacity: 0.3 },
      popup: '500m radius from center'
    }
  ];

  const handleMarkerClick = (marker: MapMarker) => {
    console.log('Marker clicked:', marker);
  };

  const handleMapClick = (latlng: L.LatLng) => {
    console.log('Map clicked at:', latlng);
  };

  return (
    <div
      style={{ width: '75%' }}
      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4"
    >
      <h1 className="text-xl font-bold text-slate-900 font-display">Advanced Map Example</h1>
      <AdvancedMap
        center={[51.505, -0.09]}
        zoom={13}
        markers={markers}
        polygons={polygons}
        circles={circles}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
        enableClustering={true}
        enableSearch={true}
        enableControls={true}
        style={{ height: '600px', width: '100%' }}
      />
    </div>
  );
};
