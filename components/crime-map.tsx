"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet icon issue
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Sample crime data
const crimeData = [
  {
    id: 1,
    type: "Theft",
    lat: 40.7128,
    lng: -74.006,
    date: "2025-04-15",
    time: "14:30",
    description: "Bicycle stolen from outside coffee shop",
  },
  {
    id: 2,
    type: "Assault",
    lat: 40.7138,
    lng: -74.013,
    date: "2025-04-12",
    time: "23:15",
    description: "Altercation outside nightclub",
  },
  {
    id: 3,
    type: "Burglary",
    lat: 40.7118,
    lng: -74.009,
    date: "2025-04-10",
    time: "03:45",
    description: "Break-in at convenience store",
  },
  {
    id: 4,
    type: "Theft",
    lat: 40.7148,
    lng: -74.003,
    date: "2025-04-08",
    time: "12:20",
    description: "Purse snatching incident",
  },
  {
    id: 5,
    type: "Vandalism",
    lat: 40.7108,
    lng: -74.016,
    date: "2025-04-05",
    time: "02:30",
    description: "Graffiti on public building",
  },
  {
    id: 6,
    type: "Assault",
    lat: 40.7158,
    lng: -74.008,
    date: "2025-04-02",
    time: "19:45",
    description: "Fight in public park",
  },
  {
    id: 7,
    type: "Theft",
    lat: 40.7135,
    lng: -74.011,
    date: "2025-03-30",
    time: "16:10",
    description: "Shoplifting at department store",
  },
  {
    id: 8,
    type: "Burglary",
    lat: 40.7125,
    lng: -74.018,
    date: "2025-03-28",
    time: "01:20",
    description: "Home invasion",
  },
  {
    id: 9,
    type: "Fraud",
    lat: 40.7145,
    lng: -74.005,
    date: "2025-03-25",
    time: "11:30",
    description: "Credit card skimming at ATM",
  },
  {
    id: 10,
    type: "Harassment",
    lat: 40.7115,
    lng: -74.002,
    date: "2025-03-22",
    time: "17:50",
    description: "Verbal harassment on subway",
  },
]

// Color mapping for crime types
const crimeColors = {
  Theft: "#FF0000", // Red
  Assault: "#0000FF", // Blue
  Burglary: "#FFFF00", // Yellow
  Vandalism: "#00FF00", // Green
  Harassment: "#800080", // Purple
  Fraud: "#FFA500", // Orange
  Other: "#808080", // Gray
}

// Map center position (New York City)
const center = [40.7128, -74.006]

// Component to set the map view
function SetMapView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 14)
  }, [center, map])
  return null
}

interface CrimeMapProps {
  mapType: string
}

export default function CrimeMap({ mapType }: CrimeMapProps) {
  return (
    <MapContainer
      center={[center[0], center[1]]}
      zoom={14}
      style={{ height: "600px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetMapView center={[center[0], center[1]]} />

      {mapType === "markers"
        ? // Marker view
          crimeData.map((crime) => (
            <Marker key={crime.id} position={[crime.lat, crime.lng]} icon={icon}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold">{crime.type}</h3>
                  <p className="text-sm">Date: {crime.date}</p>
                  <p className="text-sm">Time: {crime.time}</p>
                  <p className="text-sm mt-1">{crime.description}</p>
                </div>
              </Popup>
            </Marker>
          ))
        : // Heatmap view (simulated with circles)
          crimeData.map((crime) => (
            <Circle
              key={crime.id}
              center={[crime.lat, crime.lng]}
              radius={100}
              pathOptions={{
                fillColor: crimeColors[crime.type as keyof typeof crimeColors] || "#808080",
                fillOpacity: 0.6,
                weight: 0,
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold">{crime.type}</h3>
                  <p className="text-sm">Date: {crime.date}</p>
                  <p className="text-sm">Time: {crime.time}</p>
                  <p className="text-sm mt-1">{crime.description}</p>
                </div>
              </Popup>
            </Circle>
          ))}
    </MapContainer>
  )
}
