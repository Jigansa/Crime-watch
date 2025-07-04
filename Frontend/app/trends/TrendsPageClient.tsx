"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from "recharts";
import { mlApi, HotspotData } from "@/lib/api-services";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, PieChart as PieChartIcon, MapPin, LineChart as LineChartIcon } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export default function TrendsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2020, 0, 1),
    to: new Date(2022, 11, 31),
  });
  const [crimeType, setCrimeType] = useState("all");
  const [location, setLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [hotspotData, setHotspotData] = useState<HotspotData[]>([]);
  const [hotspotLoading, setHotspotLoading] = useState(false);

  // Fetch trend data (yearly totals)
  useEffect(() => {
    async function fetchTrend() {
      setTrendLoading(true);
      try {
        const response = await fetch("/data_pbl.csv");
        const blob = await response.blob();
        const file = new File([blob], "data_pbl.csv", { type: "text/csv" });
        const data = await mlApi.getCrimeTrend(file);
        setTrendData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching trend data", err);
      }
      setTrendLoading(false);
    }
    fetchTrend();
  }, []);

  // Fetch hotspot data (for type/location breakdown)
  useEffect(() => {
    async function fetchHotspots() {
      setHotspotLoading(true);
      try {
        const response = await fetch("/data_pbl.csv");
        const blob = await response.blob();
        const file = new File([blob], "data_pbl.csv", { type: "text/csv" });
        const data = await mlApi.getHotspots(file);
        console.log("HOTSPOT DATA:", data);
        setHotspotData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching hotspot data", err);
      }
      setHotspotLoading(false);
    }
    fetchHotspots();
  }, []);

  // Get all years from trendData
  const allYears = Array.from(
    new Set(trendData.map((d) => d.year))
  ).sort();

  // Get all crime types from hotspotData
  const allCrimeTypes = Array.from(
    new Set(
      hotspotData.flatMap((state) => Object.keys(state.crime_breakdown).map((type) => type.toLowerCase().trim()))
    )
  );

  // Get all locations (states)
  const allLocations = hotspotData.map((state) => state.state);

  // Filtered trend data by year range
  const filteredTrendData = trendData.filter((d) => {
    if (!dateRange.from || !dateRange.to) return true;
    return d.year >= dateRange.from.getFullYear() && d.year <= dateRange.to.getFullYear();
  });

  // Crime by type (aggregated)
  const crimeTypeCounts: Record<string, number> = {};
  hotspotData.forEach((state) => {
    Object.entries(state.crime_breakdown).forEach(([type, count]) => {
      const normType = type.toLowerCase().trim();
      if (crimeType === "all" || normType === crimeType) {
        crimeTypeCounts[normType] = (crimeTypeCounts[normType] || 0) + count;
      }
    });
  });
  const crimeByTypeData = Object.entries(crimeTypeCounts).map(([name, value]) => ({ name, value }));

  // Crime by location (aggregated)
  const crimeByLocationData = hotspotData
    .filter((state) => location === "all" || state.state === location)
    .map((state) => ({
      name: state.state,
      ...state.crime_breakdown,
      total: Object.values(state.crime_breakdown).reduce((a, b) => a + b, 0),
    }));

  // Trends by crime type (line chart: year vs count for each type)
  const trendsByType: Record<string, { year: number; value: number }[]> = {};
  allCrimeTypes.forEach((type) => {
    trendsByType[type] = [];
    allYears.forEach((year) => {
      let sum = 0;
      hotspotData.forEach((state) => {
        if (state[year]) {
          // If state[year] is available, but we want per type
          sum += state.crime_breakdown[type] || 0;
        }
      });
      trendsByType[type].push({ year, value: sum });
    });
  });

  // Trends by location (line chart: year vs total for a state)
  const trendsByLocation: { year: number; value: number }[] = [];
  if (location !== "all") {
    allYears.forEach((year) => {
      let sum = 0;
      hotspotData.forEach((state) => {
        if (state.state === location && state[year]) {
          sum += state[year];
        }
      });
      trendsByLocation.push({ year, value: sum });
    });
  }

  // After crimeByTypeData is built
  console.log("crimeByTypeData", crimeByTypeData);
  // After filteredTrendData is built
  console.log("filteredTrendData", filteredTrendData);
  // Also print allCrimeTypes and allLocations for dropdowns
  console.log("allCrimeTypes", allCrimeTypes);
  console.log("allLocations", allLocations);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // --- Fix for 'Crime Trends Over Time' ---
  // Merge actual and predicted into one array per year
  const mergedTrendData: { year: number; total_crimes: number | null; predicted_total_crimes: number | null }[] = [];
  const trendYears = Array.from(new Set(trendData.map(d => d.year))).sort();
  trendYears.forEach(year => {
    const actual = trendData.find(d => d.year === year && d.total_crimes !== undefined);
    const predicted = trendData.find(d => d.year === year && d.predicted_total_crimes !== undefined);
    mergedTrendData.push({
      year,
      total_crimes: actual ? actual.total_crimes : null,
      predicted_total_crimes: predicted ? predicted.predicted_total_crimes : null,
    });
  });

  // Build pieChartData for all types, regardless of filter
  const pieChartData = Object.entries(
    hotspotData.reduce((acc, state) => {
      Object.entries(state.crime_breakdown).forEach(([type, count]) => {
        const normType = type.toLowerCase().trim();
        acc[normType] = (acc[normType] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  console.log("pieChartData", pieChartData);

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
        <Card className="shadow-lg rounded-xl bg-white/90 dark:bg-zinc-900/90 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl bg-white/90 dark:bg-zinc-900/90 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Crime Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={crimeType} onValueChange={setCrimeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select crime type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allCrimeTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl bg-white/90 dark:bg-zinc-900/90 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {allLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      <div className="border-b border-gray-200 dark:border-zinc-800 mb-6" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Analysis Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
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
          <Button variant="outline" size="sm" className="dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 pb-2 mb-4 shadow-sm rounded-b-xl">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <TabsTrigger value="overview" className="dark:text-zinc-100"><LineChartIcon className="inline mr-1 w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="by-type" className="dark:text-zinc-100"><PieChartIcon className="inline mr-1 w-4 h-4" />By Crime Type</TabsTrigger>
            <TabsTrigger value="by-location" className="dark:text-zinc-100"><MapPin className="inline mr-1 w-4 h-4" />By Location</TabsTrigger>
            <TabsTrigger value="trends-by-type" className="dark:text-zinc-100"><BarChart3 className="inline mr-1 w-4 h-4" />Trends by Type</TabsTrigger>
          </TabsList>

          {/* Overview Tab: Yearly Trend */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card className="shadow-lg rounded-xl bg-white/95 dark:bg-zinc-900/95 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Crime Trends Over Time</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">Yearly total crime incidents (actual & predicted)</CardDescription>
                  </CardHeader>
                  <CardContent className="mb-8">
                    <div className="h-[350px]">
                      {trendLoading ? (
                        <Skeleton className="w-full h-full rounded-lg" />
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={mergedTrendData} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                            <XAxis dataKey="year" stroke="#222" tick={{ fill: '#222' }} tickLine={{ stroke: '#222' }}
                              axisLine={{ stroke: '#222' }}
                              className="dark:stroke-zinc-300"
                            >
                              <Label value="Year" offset={-5} position="insideBottom" className="fill-zinc-700 dark:fill-zinc-300" />
                            </XAxis>
                            <YAxis tickFormatter={(v: number) => v.toLocaleString()} width={80} stroke="#222" tick={{ fill: '#222' }} tickLine={{ stroke: '#222' }} axisLine={{ stroke: '#222' }} className="dark:stroke-zinc-300">
                              <Label value="Incidents" angle={-90} position="insideLeft" offset={10} className="fill-zinc-700 dark:fill-zinc-300" />
                            </YAxis>
                            <Tooltip formatter={(v: number) => v?.toLocaleString?.() ?? v} contentStyle={{ background: '#18181b', color: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0008', border: '1px solid #333' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} wrapperStyle={{ zIndex: 50 }} />
                            <Legend wrapperStyle={{ color: '#222', fontWeight: 500 }} />
                            <Line type="monotone" dataKey="total_crimes" stroke="#6366f1" name="Actual" connectNulls dot />
                            <Line type="monotone" dataKey="predicted_total_crimes" stroke="#22d3ee" name="Predicted" strokeDasharray="5 5" connectNulls dot />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="shadow-lg rounded-xl bg-white/95 dark:bg-zinc-900/95 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Crime Distribution by Type</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">Percentage breakdown of reported incidents</CardDescription>
                  </CardHeader>
                  <CardContent className="mb-8">
                    <div style={{ width: 400, height: 350, margin: "0 auto", border: "1px dashed #e5e7eb", borderRadius: "12px", padding: 16 }} className="dark:border-zinc-700">
                      {hotspotLoading ? (
                        <Skeleton className="w-full h-full rounded-lg" />
                      ) : pieChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
                      ) : (
                        <PieChart width={400} height={350}>
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={120}
                            fill="#6366f1"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: number, name: string, props: any) => [v?.toLocaleString?.() ?? v, pieChartData[props?.payload?.index]?.name]}
                            contentStyle={{ background: '#18181b', color: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0008', border: '1px solid #333' }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            wrapperStyle={{ zIndex: 50 }}
                          />
                        </PieChart>
                      )}
                    </div>
                    {pieChartData.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {pieChartData.map((entry, idx) => (
                          <div key={entry.name} className="flex items-center gap-2 text-sm max-w-xs truncate">
                            <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                            <span className="font-medium truncate max-w-[120px] text-zinc-900 dark:text-zinc-100" title={entry.name}>{entry.name}</span>
                            <span className="text-muted-foreground dark:text-zinc-400">({entry.value.toLocaleString()})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* By Crime Type Tab: Bar Chart */}
          <TabsContent value="by-type">
            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-lg rounded-xl bg-white/95 dark:bg-zinc-900/95 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Crime Incidents by Type</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">Total number of incidents reported for each crime type</CardDescription>
                </CardHeader>
                <CardContent className="mb-8" style={{ background: '#fff', border: '1px dashed #e5e7eb', borderRadius: 12, padding: 16 }}>
                  <div className="h-[400px]">
                    {hotspotLoading ? (
                      <Skeleton className="w-full h-full rounded-lg" />
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={crimeByTypeData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }} barSize={40}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" angle={-20} textAnchor="end">
                            <Label value="Crime Type" offset={-5} position="insideBottom" />
                          </XAxis>
                          <YAxis tickFormatter={(v: number) => v.toLocaleString()} width={80}>
                            <Label value="Incidents" angle={-90} position="insideLeft" />
                          </YAxis>
                          <Tooltip formatter={(v: number) => v?.toLocaleString?.() ?? v} contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                          <Legend />
                          <Bar dataKey="value" fill="#6366f1">
                            {crimeByTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="value" position="top" formatter={(v: number) => v.toLocaleString()} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* By Location Tab: Bar Chart */}
          <TabsContent value="by-location">
            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-lg rounded-xl bg-white/95 dark:bg-zinc-900/95 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Crime by Location</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">Comparison of total crime incidents across states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {hotspotLoading ? (
                      <Skeleton className="w-full h-full rounded-lg" />
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={crimeByLocationData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number">
                            <Label value="Incidents" angle={-90} position="insideLeft" />
                          </XAxis>
                          <YAxis dataKey="name" type="category" width={100}>
                            <Label value="Location" offset={5} position="insideBottom" />
                          </YAxis>
                          <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                          <Legend />
                          <Bar dataKey="total" fill="#22d3ee">
                            {crimeByLocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends by Type Tab: Line Chart for Each Type */}
          <TabsContent value="trends-by-type">
            <div className="grid grid-cols-1 gap-6">
              {allCrimeTypes.map((type, idx) => (
                <Card key={type} className="shadow-lg rounded-xl bg-white/95 dark:bg-zinc-900/95 hover:shadow-2xl transition-shadow border border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Trend: {type}</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">Yearly trend for {type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {hotspotLoading ? (
                        <Skeleton className="w-full h-full rounded-lg" />
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={trendsByType[type]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="year">
                              <Label value="Year" offset={-5} position="insideBottom" />
                            </XAxis>
                            <YAxis tickFormatter={(v: number) => v.toLocaleString()}>
                              <Label value="Incidents" angle={-90} position="insideLeft" />
                            </YAxis>
                            <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke={COLORS[idx % COLORS.length]} name={type} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 