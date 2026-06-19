"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = [number, number];

interface Props {
  pickupCoords?: LatLng | null;
  destCoords?: LatLng | null;
  driverCoords?: LatLng | null;
  pickupLabel?: string;
  destLabel?: string;
}

function pinIcon(color: string, letter: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:34px;height:42px">
      <svg viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 25 17 25s17-12.3 17-25C34 7.6 26.4 0 17 0z" fill="${color}"/>
        <circle cx="17" cy="17" r="9" fill="white" fill-opacity="0.25"/>
        <text x="17" y="22" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="system-ui,sans-serif">${letter}</text>
      </svg>
    </div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -44],
  });
}

function carIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:44px;height:44px;
      background:#16a34a;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 3px 14px rgba(22,163,74,0.55);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
}

export default function MapView({ pickupCoords, destCoords, driverCoords, pickupLabel, destLabel }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const refs = useRef<{
    pickup: L.Marker | null;
    dest: L.Marker | null;
    driver: L.Marker | null;
    route: L.Polyline | null;
  }>({ pickup: null, dest: null, driver: null, route: null });

  // Initialize map once
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      center: [31.5204, 74.3587],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers + route whenever any coord changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const m = refs.current;

    // Pickup pin
    if (pickupCoords) {
      if (m.pickup) m.pickup.setLatLng(pickupCoords);
      else
        m.pickup = L.marker(pickupCoords, { icon: pinIcon("#6366f1", "A"), zIndexOffset: 100 })
          .addTo(map)
          .bindPopup(`<b>Pickup</b>${pickupLabel ? `<br>${pickupLabel}` : ""}`);
    } else {
      m.pickup?.remove();
      m.pickup = null;
    }

    // Destination pin
    if (destCoords) {
      if (m.dest) m.dest.setLatLng(destCoords);
      else
        m.dest = L.marker(destCoords, { icon: pinIcon("#dc2626", "B"), zIndexOffset: 100 })
          .addTo(map)
          .bindPopup(`<b>Destination</b>${destLabel ? `<br>${destLabel}` : ""}`);
    } else {
      m.dest?.remove();
      m.dest = null;
    }

    // Route polyline
    if (pickupCoords && destCoords) {
      m.route?.remove();
      m.route = L.polyline([pickupCoords, destCoords], {
        color: "#6366f1",
        weight: 4,
        opacity: 0.75,
        dashArray: "12 8",
      }).addTo(map);
    } else {
      m.route?.remove();
      m.route = null;
    }

    // Driver marker (animated pan on update)
    if (driverCoords) {
      if (m.driver) {
        m.driver.setLatLng(driverCoords);
        map.panTo(driverCoords, { animate: true, duration: 0.8 });
      } else {
        m.driver = L.marker(driverCoords, { icon: carIcon(), zIndexOffset: 200 })
          .addTo(map)
          .bindPopup("Driver");
      }
    } else {
      m.driver?.remove();
      m.driver = null;
    }

    // Fit bounds to all visible points
    const pts = [pickupCoords, destCoords, driverCoords].filter(Boolean) as LatLng[];
    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], animate: true, maxZoom: 16 });
    } else if (pts.length === 1) {
      map.setView(pts[0], 15, { animate: true });
    }
  }, [pickupCoords, destCoords, driverCoords, pickupLabel, destLabel]);

  return <div ref={divRef} className="h-64 w-full overflow-hidden rounded-2xl sm:h-72" />;
}
