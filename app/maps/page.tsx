"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const CrimeMap = dynamic(() => import("@/components/crime-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted/30 flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export default function MapsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 0, 1),
    to: new Date(),
  })
  const [crimeType, setCrimeType] = useState("all")
  const [location, setLocation] = useState("all")
  const [timeRange, setTimeRange] = useState([0, 24])
  const [mapType, setMapType] = useState("heatmap")
  const [showLegend, setShowLegend] = useState(true)

  return (
    <div className="container py-8 md:py-12">
      <motion.div
        className="flex flex-col gap-2 text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Crime Maps</h1>
        <p className="text-muted-foreground">Visualize crime hotspots and patterns geographically.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Map Filters</CardTitle>
              <CardDescription>Customize the map view to focus on specific data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Crime Type</label>
                <Select defaultValue={crimeType} onValueChange={setCrimeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crime type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="burglary">Burglary</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select defaultValue={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="downtown">Downtown</SelectItem>
                    <SelectItem value="westside">Westside</SelectItem>
                    <SelectItem value="northend">Northend</SelectItem>
                    <SelectItem value="eastside">Eastside</SelectItem>
                    <SelectItem value="southside">Southside</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Time of Day</label>
                  <span className="text-xs text-muted-foreground">
                    {timeRange[0]}:00 - {timeRange[1]}:00
                  </span>
                </div>
                <Slider defaultValue={timeRange} max={24} step={1} onValueChange={setTimeRange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Map Type</label>
                <Tabs defaultValue={mapType} onValueChange={setMapType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                    <TabsTrigger value="markers">Markers</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-legend"
                  checked={showLegend}
                  onCheckedChange={(checked) => setShowLegend(!!checked)}
                />
                <label
                  htmlFor="show-legend"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Legend
                </label>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showLegend && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Theft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Assault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Burglary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Vandalism</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Harassment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Fraud</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Other</span>
                  </div>
                </div>
              )}

              {mapType === "heatmap" && (
                <div className="pt-2">
                  <div className="h-2 w-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Crime Hotspots</CardTitle>
              <CardDescription>Interactive map showing crime incidents and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <CrimeMap mapType={mapType} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
