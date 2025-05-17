"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Bell, Lock, Shield, AlertTriangle, BarChart3, MapPin } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="container px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none auth-gradient" />
        <div className="flex flex-col items-center gap-4 text-center relative z-10">
          <motion.h1
            className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Track and Analyze Crime Patterns in Your Area
          </motion.h1>
          <motion.p
            className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            CrimeWatch Analytics helps you stay informed about crime trends and make safer decisions for your community.
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/report">
              <Button size="lg" className="h-12 px-6 text-base">
                Report Incident
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/trends">
              <Button variant="outline" size="lg" className="h-12 px-6 text-base">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Trends
              </Button>
            </Link>
            <Link href="/maps">
              <Button variant="outline" size="lg" className="h-12 px-6 text-base">
                <MapPin className="mr-2 h-4 w-4" />
                Explore Maps
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <motion.div
            className="bg-card rounded-lg p-6 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-3xl md:text-4xl font-bold text-primary">2.5K+</p>
            <p className="text-sm text-muted-foreground mt-2">Reports Submitted</p>
          </motion.div>
          <motion.div
            className="bg-card rounded-lg p-6 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-3xl md:text-4xl font-bold text-primary">150+</p>
            <p className="text-sm text-muted-foreground mt-2">Communities</p>
          </motion.div>
          <motion.div
            className="bg-card rounded-lg p-6 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <p className="text-3xl md:text-4xl font-bold text-primary">98%</p>
            <p className="text-sm text-muted-foreground mt-2">Data Accuracy</p>
          </motion.div>
          <motion.div
            className="bg-card rounded-lg p-6 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <p className="text-3xl md:text-4xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground mt-2">Monitoring</p>
          </motion.div>
        </div>
      </section>

      {/* Precautions Section */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4 items-center text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter">Safety Precautions</h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[700px]">
            Practical tips to keep yourself and your community safe.
          </p>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={item}>
            <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Stay Alert</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Be aware of your surroundings at all times, especially in unfamiliar areas or at night. Keep your
                  phone charged and accessible.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Secure Your Property</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Lock doors and windows, install security systems, and keep valuables out of sight. Consider
                  motion-activated lighting for dark areas.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Community Watch</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Join or start a neighborhood watch program to help keep your community safe. Report suspicious
                  activity to local authorities.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="container px-4 md:px-6 py-8 md:py-12 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter">About CrimeWatch Analytics</h2>
            <p className="text-muted-foreground">
              CrimeWatch Analytics is a community-driven platform that collects, analyzes, and visualizes crime data to
              help citizens make informed decisions about their safety.
            </p>
            <p className="text-muted-foreground">
              Our mission is to empower communities with knowledge and tools to prevent crime and create safer
              neighborhoods through data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/about">
                <Button variant="outline" className="w-full sm:w-fit">
                  Learn More
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full sm:w-fit">Join Our Community</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="aspect-video overflow-hidden rounded-lg bg-foreground/5 flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="CrimeWatch Analytics Dashboard"
              className="object-cover w-full h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4 items-center text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[700px]">
            A simple process to help keep your community safe and informed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            className="flex flex-col items-center text-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mt-2">Report Incidents</h3>
            <p className="text-muted-foreground">
              Submit details about crime incidents you've witnessed or experienced through our easy-to-use form.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mt-2">Data Analysis</h3>
            <p className="text-muted-foreground">
              Our system analyzes the data to identify patterns, trends, and potential hotspots in your area.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mt-2">Visualization</h3>
            <p className="text-muted-foreground">
              View interactive charts and maps showing crime hotspots and trends in an easy-to-understand format.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              4
            </div>
            <h3 className="text-xl font-bold mt-2">Take Action</h3>
            <p className="text-muted-foreground">
              Use insights to make informed decisions and improve community safety through targeted prevention efforts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6">
        <motion.div
          className="rounded-lg bg-primary text-primary-foreground p-8 md:p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Join Our Community Today</h2>
            <p className="mt-4 text-lg">Sign up now to access all features and help make your community safer.</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Create an Account
                </Button>
              </Link>
              <Link href="/report">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20"
                >
                  Report an Incident
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Alert Section */}
      <section className="container px-4 md:px-6">
        <motion.div
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-start gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Emergency Alert</h3>
            <p className="text-sm mt-1">
              This platform is not a substitute for emergency services. If you're reporting a crime in progress or an
              emergency, please call 911 immediately.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
