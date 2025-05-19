'use client';

import { useEffect, useState } from 'react';

type Hotspot = {
  state: string;
  total: number;
  risk: string;
  color: string;
};

export default function CrimeHotspotsPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  useEffect(() => {
    const fetchHotspots = async () => {
      const res = await fetch('http://localhost:8000/hotspots', {
        method: 'POST',
        body: new FormData(), // only if backend expects file, else change to GET later
      });
      const data = await res.json();
      setHotspots(data);
    };

    fetchHotspots();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Crime Hotspots</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotspots.map((hotspot, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-md text-white ${
              hotspot.color === 'Red'
                ? 'bg-red-600'
                : hotspot.color === 'Orange'
                ? 'bg-orange-500'
                : 'bg-green-600'
            }`}
          >
            <h2 className="text-xl font-semibold">{hotspot.state}</h2>
            <p>Total Crimes: {hotspot.total}</p>
            <p>Risk Level: {hotspot.risk}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
