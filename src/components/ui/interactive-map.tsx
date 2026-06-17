import React, { useState, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';
// @ts-ignore
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = 'blue', size: 'small' | 'medium' | 'large' = 'medium') => {
  const sizes = {
    small: [20, 32] as [number, number],
    medium: [25, 41] as [number, number],
    large: [30, 50] as [number, number]
  };
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: sizes[size],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface MapEventsProps {
  onMapClick?: (latlng: L.LatLng) => void;
  onLocationFound?: (latlng: L.LatLng) => void;
}

// Map event handler component
const MapEvents = ({ onMapClick, onLocationFound }: MapEventsProps) => {
  const map = useMapEvents({
    click: (e) => {
      onMapClick && onMapClick(e.latlng);
    },
    locationfound: (e) => {
      onLocationFound && onLocationFound(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return null;
};

interface CustomControlsProps {
  onLocate: () => void;
  onToggleLayer: (layerType: 'satellite' | 'traffic' | 'openstreetmap') => void;
  layers: { openstreetmap: boolean; satellite: boolean; traffic: boolean };
}

// Custom control component
const CustomControls = ({ onLocate, onToggleLayer, layers }: CustomControlsProps) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const control = new L.Control({ position: 'topright' });
    
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'custom-controls');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 4px;">
          <button id="locate-btn" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: #f1f5f9; color: #0f172a; font-weight: 600; font-family: sans-serif; font-size: 11px; text-align: left; transition: all 0.2s;">📍 Locate Me</button>
          <button id="satellite-btn" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: ${layers.satellite ? '#10b981' : '#f1f5f9'}; color: ${layers.satellite ? 'white' : '#0f172a'}; font-weight: 600; font-family: sans-serif; font-size: 11px; text-align: left; transition: all 0.2s;">🛰️ Satellite</button>
          <button id="traffic-btn" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: ${layers.traffic ? '#10b981' : '#f1f5f9'}; color: ${layers.traffic ? 'white' : '#0f172a'}; font-weight: 600; font-family: sans-serif; font-size: 11px; text-align: left; transition: all 0.2s;">🚦 Traffic</button>
        </div>
      `;
      
      L.DomEvent.disableClickPropagation(div);
      
      const locateBtn = div.querySelector('#locate-btn') as HTMLButtonElement | null;
      const satelliteBtn = div.querySelector('#satellite-btn') as HTMLButtonElement | null;
      const trafficBtn = div.querySelector('#traffic-btn') as HTMLButtonElement | null;
      
      if (locateBtn) locateBtn.onclick = () => onLocate();
      if (satelliteBtn) satelliteBtn.onclick = () => onToggleLayer('satellite');
      if (trafficBtn) trafficBtn.onclick = () => onToggleLayer('traffic');
      
      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, onLocate, onToggleLayer, layers]);

  return null;
};

interface SearchControlProps {
  onSearch?: (result: { latLng: [number, number]; name: string }) => void;
}

// Search component
const SearchControl = ({ onSearch }: SearchControlProps) => {
  const [query, setQuery] = useState('');
  const map = useMap();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latLng: [number, number] = [parseFloat(lat), parseFloat(lon)];
        map.flyTo(latLng, 15);
        onSearch && onSearch({ latLng, name: display_name });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const control = new L.Control({ position: 'topleft' });
    
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'search-control');
      div.innerHTML = `
        <div style="background: white; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; gap: 4px; align-items: center;">
          <input 
            id="search-input" 
            type="text" 
            placeholder="Search places..." 
            style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; width: 160px; font-size: 11px; focus: outline-none; focus: border-color: #10b981;"
          />
          <button 
            id="search-btn" 
            style="padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; background: #10b981; color: white; font-size: 11px; font-weight: bold;"
          >
            🔍
          </button>
        </div>
      `;
      
      L.DomEvent.disableClickPropagation(div);
      
      const input = div.querySelector('#search-input') as HTMLInputElement | null;
      const button = div.querySelector('#search-btn') as HTMLButtonElement | null;
      
      if (input) {
        input.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          setQuery(target.value);
        });
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            handleSearch(input.value);
          }
        });
      }
      if (button && input) {
        button.addEventListener('click', () => {
          handleSearch(input.value);
        });
      }
      
      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map]);

  return null;
};

export interface MapMarker {
  id?: string | number;
  position: [number, number];
  color?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: L.Icon;
  popup?: {
    title: string;
    content: string;
    image?: string;
  };
}

export interface MapPolygon {
  id?: string | number;
  positions: [number, number][];
  style?: L.PathOptions;
  popup?: string;
}

export interface MapCircle {
  id?: string | number;
  center: [number, number];
  radius: number;
  style?: L.PathOptions;
  popup?: string;
}

export interface MapPolyline {
  id?: string | number;
  positions: [number, number][];
  style?: L.PathOptions;
  popup?: string;
}

export interface AdvancedMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  polygons?: MapPolygon[];
  circles?: MapCircle[];
  polylines?: MapPolyline[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (latlng: L.LatLng) => void;
  enableClustering?: boolean;
  enableSearch?: boolean;
  enableControls?: boolean;
  enableDrawing?: boolean;
  mapLayers?: {
    openstreetmap: boolean;
    satellite: boolean;
    traffic: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
}

// Main AdvancedMap component
export const AdvancedMap = ({
  center = [22.868, 91.100], // Default center positioned around GTSU Gopalganj region
  zoom = 15,
  markers = [],
  polygons = [],
  circles = [],
  polylines = [],
  onMarkerClick,
  onMapClick,
  enableClustering = true,
  enableSearch = true,
  enableControls = true,
  enableDrawing = false,
  mapLayers = {
    openstreetmap: true,
    satellite: false,
    traffic: false
  },
  className = '',
  style = { height: '100%', width: '100%' }
}: AdvancedMapProps) => {
  const [currentLayers, setCurrentLayers] = useState(mapLayers);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchResult, setSearchResult] = useState<{ latLng: [number, number]; name: string } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<L.LatLng | null>(null);

  // Handle layer toggling
  const handleToggleLayer = useCallback((layerType: 'satellite' | 'traffic' | 'openstreetmap') => {
    setCurrentLayers(prev => ({
      ...prev,
      [layerType]: !prev[layerType]
    }));
  }, []);

  // Handle geolocation
  const handleLocate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    setClickedLocation(latlng);
    onMapClick && onMapClick(latlng);
  }, [onMapClick]);

  // Handle search results
  const handleSearch = useCallback((result: { latLng: [number, number]; name: string }) => {
    setSearchResult(result);
  }, []);

  return (
    <div className={`advanced-map ${className}`} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Base tile layers */}
        {currentLayers.openstreetmap && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {currentLayers.satellite && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Map events */}
        <MapEvents
          onMapClick={handleMapClick}
          onLocationFound={(latlng) => setUserLocation([latlng.lat, latlng.lng])}
        />

        {/* Search control */}
        {enableSearch && <SearchControl onSearch={handleSearch} />}

        {/* Custom controls */}
        {enableControls && (
          <CustomControls
            onLocate={handleLocate}
            onToggleLayer={handleToggleLayer}
            layers={currentLayers}
          />
        )}

        {/* Markers with clustering */}
        {enableClustering ? (
          <MarkerClusterGroup>
            {markers.map((marker, index) => (
              <Marker
                key={marker.id || index}
                position={marker.position}
                icon={marker.icon || createCustomIcon(marker.color, marker.size)}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(marker)
                }}
              >
                {marker.popup && (
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1 leading-tight text-xs">{marker.popup.title}</h3>
                      <p className="text-[11px] text-slate-600 leading-normal">{marker.popup.content}</p>
                      {marker.popup.image && (
                        <img 
                          src={marker.popup.image} 
                          alt={marker.popup.title}
                          className="max-w-[180px] h-auto rounded mt-2 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          markers.map((marker, index) => (
            <Marker
              key={marker.id || index}
              position={marker.position}
              icon={marker.icon || createCustomIcon(marker.color, marker.size)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(marker)
              }}
            >
              {marker.popup && (
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1 leading-tight text-xs">{marker.popup.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-normal">{marker.popup.content}</p>
                  </div>
                </Popup>
              )}
            </Marker>
          ))
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={createCustomIcon('red', 'medium')}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Search result marker */}
        {searchResult && (
          <Marker 
            position={searchResult.latLng}
            icon={createCustomIcon('green', 'large')}
          >
            <Popup>{searchResult.name}</Popup>
          </Marker>
        )}

        {/* Clicked location marker */}
        {clickedLocation && (
          <Marker 
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={createCustomIcon('orange', 'small')}
          >
            <Popup>
              Lat: {clickedLocation.lat.toFixed(6)}<br/>
              Lng: {clickedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Polygons */}
        {polygons.map((polygon, index) => (
          <Polygon
            key={polygon.id || index}
            positions={polygon.positions}
            pathOptions={polygon.style || { color: 'purple', weight: 2, fillOpacity: 0.3 }}
          >
            {polygon.popup && <Popup>{polygon.popup}</Popup>}
          </Polygon>
        ))}

        {/* Circles */}
        {circles.map((circle, index) => (
          <Circle
            key={circle.id || index}
            center={circle.center}
            radius={circle.radius}
            pathOptions={circle.style || { color: 'blue', weight: 2, fillOpacity: 0.2 }}
          >
            {circle.popup && <Popup>{circle.popup}</Popup>}
          </Circle>
        ))}

        {/* Polylines */}
        {polylines.map((polyline, index) => (
          <Polyline
            key={polyline.id || index}
            positions={polyline.positions}
            pathOptions={polyline.style || { color: 'red', weight: 3 }}
          >
            {polyline.popup && <Popup>{polyline.popup}</Popup>}
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};
