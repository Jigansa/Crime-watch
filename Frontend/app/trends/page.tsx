"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { Chart, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendItem } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Sample data
const crimeOverTimeData = [
  { month: "Jan", theft: 65, assault: 28, burglary: 40, vandalism: 20 },
  { month: "Feb", theft: 59, assault: 32, burglary: 36, vandalism: 25 },
  { month: "Mar", theft: 80, assault: 30, burglary: 42, vandalism: 18 },
  { month: "Apr", theft: 81, assault: 26, burglary: 37, vandalism: 22 },
  { month: "May", theft: 56, assault: 25, burglary: 30, vandalism: 28 },
  { month: "Jun", theft: 55, assault: 31, burglary: 27, vandalism: 15 },
  { month: "Jul", theft: 40, assault: 35, burglary: 32, vandalism: 20 },
  { month: "Aug", theft: 45, assault: 42, burglary: 28, vandalism: 24 },
  { month: "Sep", theft: 62, assault: 38, burglary: 35, vandalism: 19 },
  { month: "Oct", theft: 78, assault: 33, burglary: 41, vandalism: 23 },
  { month: "Nov", theft: 85, assault: 29, burglary: 44, vandalism: 26 },
  { month: "Dec", theft: 90, assault: 36, burglary: 48, vandalism: 30 },
]

const crimeByTypeData = [
  { name: "Theft", value: 796 },
  { name: "Assault", value: 385 },
  { name: "Burglary", value: 440 },
  { name: "Vandalism", value: 270 },
  { name: "Harassment", value: 189 },
  { name: "Fraud", value: 239 },
  { name: "Other", value: 142 },
]

const crimeByLocationData = [
  { name: "Downtown", theft: 120, assault: 85, burglary: 65 },
  { name: "Westside", theft: 98, assault: 42, burglary: 70 },
  { name: "Northend", theft: 86, assault: 35, burglary: 40 },
  { name: "Eastside", theft: 99, assault: 37, burglary: 45 },
  { name: "Southside", theft: 85, assault: 52, burglary: 53 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

export default function TrendsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 0, 1),
    to: new Date(),
  })
  const [crimeType, setCrimeType] = useState("all")
  const [location, setLocation] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container py-8 md:py-12">
      <motion.div
        className="flex flex-col gap-2 text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Crime Trends</h1>
        <p className="text-muted-foreground">Analyze crime patterns and trends to make informed decisions.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crime Type</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-type">By Crime Type</TabsTrigger>
          <TabsTrigger value="by-location">By Location</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Crime Trends Over Time</CardTitle>
                  <CardDescription>Monthly crime incidents by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ChartContainer>
                      <Chart>
                        <LineChart data={crimeOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="theft" stroke="#0088FE" strokeWidth={2} />
                          <Line type="monotone" dataKey="assault" stroke="#00C49F" strokeWidth={2} />
                          <Line type="monotone" dataKey="burglary" stroke="#FFBB28" strokeWidth={2} />
                          <Line type="monotone" dataKey="vandalism" stroke="#FF8042" strokeWidth={2} />
                        </LineChart>
                      </Chart>
                      <ChartLegend>
                        <ChartLegendItem name="Theft" color="#0088FE" />
                        <ChartLegendItem name="Assault" color="#00C49F" />
                        <ChartLegendItem name="Burglary" color="#FFBB28" />
                        <ChartLegendItem name="Vandalism" color="#FF8042" />
                      </ChartLegend>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Crime Distribution by Type</CardTitle>
                  <CardDescription>Percentage breakdown of reported incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ChartContainer>
                      <Chart>
                        <PieChart>
                          <Pie
                            data={crimeByTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {crimeByTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </Chart>
                      <ChartLegend>
                        {crimeByTypeData.map((entry, index) => (
                          <ChartLegendItem
                            key={`legend-${index}`}
                            name={entry.name}
                            color={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </ChartLegend>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="by-type">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crime Incidents by Type</CardTitle>
                <CardDescription>Total number of incidents reported for each crime type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer>
                    <Chart>
                      <BarChart data={crimeByTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#8884d8">
                          {crimeByTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </Chart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend - Theft</CardTitle>
                  <CardDescription>Theft incidents over the past 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer>
                      <Chart>
                        <AreaChart data={crimeOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="theft" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                        </AreaChart>
                      </Chart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend - Assault</CardTitle>
                  <CardDescription>Assault incidents over the past 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer>
                      <Chart>
                        <AreaChart data={crimeOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="assault" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                        </AreaChart>
                      </Chart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="by-location">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crime by Location</CardTitle>
                <CardDescription>Comparison of crime types across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer>
                    <Chart>
                      <BarChart data={crimeByLocationData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="theft" fill="#0088FE" name="Theft" />
                        <Bar dataKey="assault" fill="#00C49F" name="Assault" />
                        <Bar dataKey="burglary" fill="#FFBB28" name="Burglary" />
                      </BarChart>
                    </Chart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theft Hotspots</CardTitle>
                  <CardDescription>Areas with highest theft incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer>
                      <Chart>
                        <PieChart>
                          <Pie
                            data={crimeByLocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="theft"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {crimeByLocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </Chart>
                      <ChartLegend>
                        {crimeByLocationData.map((entry, index) => (
                          <ChartLegendItem
                            key={`legend-${index}`}
                            name={entry.name}
                            color={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </ChartLegend>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assault Hotspots</CardTitle>
                  <CardDescription>Areas with highest assault incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer>
                      <Chart>
                        <PieChart>
                          <Pie
                            data={crimeByLocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="assault"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {crimeByLocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </Chart>
                      <ChartLegend>
                        {crimeByLocationData.map((entry, index) => (
                          <ChartLegendItem
                            key={`legend-${index}`}
                            name={entry.name}
                            color={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </ChartLegend>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
