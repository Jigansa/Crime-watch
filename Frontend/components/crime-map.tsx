"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { HotspotData } from "@/lib/api-services"

// Fix Leaflet icon issue
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Color mapping for risk levels
const riskColors = {
  High: "#FF0000", // Red
  Medium: "#FFFF00", // Yellow
  Low: "#00FF00", // Green
}

// Map center position (India)
const center: [number, number] = [20.5937, 78.9629]

// Component to set the map view
function SetMapView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 5)
  }, [center, map])
  return null
}

interface CrimeMapProps {
  mapType: string
  hotspotData: HotspotData[]
  selectedCrimeType: string
  selectedLocation: string
}

export default function CrimeMap({ mapType, hotspotData, selectedCrimeType, selectedLocation }: CrimeMapProps) {
  // Filter data based on selected crime type and location
  const filteredData = hotspotData.filter((spot) => {
    const matchesCrimeType = selectedCrimeType === "all" || spot.top_crime === selectedCrimeType
    const matchesLocation = selectedLocation === "all" || spot.state === selectedLocation
    return matchesCrimeType && matchesLocation
  })

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "600px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetMapView center={center} />

      {mapType === "markers"
        ? // Marker view
          filteredData.map((spot) => (
            <Marker 
              key={spot.state} 
              position={[spot.latitude, spot.longitude]} 
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{spot.state}</h3>
                  <p className="text-sm">Risk Level: {spot.risk}</p>
                  <p className="text-sm">Top Crime: {spot.top_crime}</p>
                  <p className="text-sm">Rate: {spot.rate_of_crime?.toFixed(2) || 'N/A'}</p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Crime Breakdown:</p>
                    {Object.entries(spot.crime_breakdown).map(([crime, count]) => (
                      <p key={crime} className="text-sm">
                        {crime}: {count}
                      </p>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        : // Heatmap view
          filteredData.map((spot) => (
            <Circle
              key={spot.state}
              center={[spot.latitude, spot.longitude]}
              radius={spot.rate_of_crime ? spot.rate_of_crime * 1000 : 50000}
              pathOptions={{
                fillColor: riskColors[spot.risk],
                fillOpacity: 0.6,
                weight: 0,
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{spot.state}</h3>
                  <p className="text-sm">Risk Level: {spot.risk}</p>
                  <p className="text-sm">Top Crime: {spot.top_crime}</p>
                  <p className="text-sm">Rate: {spot.rate_of_crime?.toFixed(2) || 'N/A'}</p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Crime Breakdown:</p>
                    {Object.entries(spot.crime_breakdown).map(([crime, count]) => (
                      <p key={crime} className="text-sm">
                        {crime}: {count}
                      </p>
                    ))}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
    </MapContainer>
  )
}
