"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type LatLng = [number, number];

interface Props {
  pickup?: string;
  destination?: string;
  driverCoords?: LatLng | null;
}

async function geocode(query: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    return null;
  }
}

export default function LiveMap({ pickup, destination, driverCoords }: Props) {
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    Promise.all([
      pickup ? geocode(pickup) : Promise.resolve(null),
      destination ? geocode(destination) : Promise.resolve(null),
    ]).then(([p, d]) => {
      setPickupCoords(p);
      setDestCoords(d);
      setReady(true);
    });
  }, [pickup, destination]);

  if (!ready) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-slate-800/60 sm:h-72">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Navigation className="h-6 w-6 animate-pulse" />
          <span className="text-sm">Loading map…</span>
        </div>
      </div>
    );
  }

  return (
    <MapView
      pickupCoords={pickupCoords}
      destCoords={destCoords}
      driverCoords={driverCoords}
      pickupLabel={pickup}
      destLabel={destination}
    />
  );
}
