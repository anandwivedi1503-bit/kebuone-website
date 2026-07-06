"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function IoTDashboard(){

const [iotData,setIotData]=useState<any[]>([]);
const mapRef = useRef<HTMLDivElement | null>(null);
const googleMapRef = useRef<any>(null);
const markerRefs = useRef<any[]>([]);
const [mapStatus, setMapStatus] = useState("");

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const validLocations = iotData.filter((iot) => {
  const lat = Number(iot.currentLat);
  const lng = Number(iot.currentLng);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0
  );
});

const loadGoogleMapsScript = () => {
  return new Promise<boolean>((resolve) => {
    if (!googleMapsApiKey) {
      setMapStatus("Google Maps API key is missing.");
      resolve(false);
      return;
    }

    if (window.google?.maps) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      setMapStatus("Google Maps failed to load.");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
useEffect(() => {
  const loadIotData = async () => {
    const response = await fetch("/api/iot");
    const data = await response.json();
    setIotData(data.data || []);
  };

  loadIotData();
  const timer = window.setInterval(loadIotData, 15000);

  return () => window.clearInterval(timer);
}, []);

useEffect(() => {
  const renderMap = async () => {
    if (!mapRef.current) return;

    if (validLocations.length === 0) {
      setMapStatus("No valid vehicle GPS locations available.");
      return;
    }

    const loaded = await loadGoogleMapsScript();

    if (!loaded || !window.google?.maps) {
      return;
    }

    setMapStatus("");

    const center = {
      lat: Number(validLocations[0].currentLat),
      lng: Number(validLocations[0].currentLng),
    };

    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    }

    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    validLocations.forEach((iot) => {
      const position = {
        lat: Number(iot.currentLat),
        lng: Number(iot.currentLng),
      };

      const marker = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: iot.vehicleId,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor:
            String(iot.gpsStatus).toUpperCase() === "ONLINE"
              ? "#00A86B"
              : "#EF4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial, sans-serif; min-width: 180px;">
            <strong>${iot.vehicleId || "Vehicle"}</strong>
            <div>Battery: ${iot.batteryPercentage || 0}%</div>
            <div>GPS: ${iot.gpsStatus || "-"}</div>
            <div>Lock: ${iot.lockStatus || "-"}</div>
            <div>Status: ${iot.vehicleStatus || "-"}</div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markerRefs.current.push(marker);
      bounds.extend(position);
    });

    if (validLocations.length > 1) {
      googleMapRef.current.fitBounds(bounds);
    } else {
      googleMapRef.current.setCenter(center);
      googleMapRef.current.setZoom(15);
    }
  };

  renderMap();
}, [iotData]);



const getGpsStatus = (status: unknown) =>
  String(status || "").trim().toUpperCase();

const getLockStatus = (status: unknown) =>
  String(status || "").trim().toUpperCase();

const onlineVehicles = iotData.filter(
  (iot) => getGpsStatus(iot.gpsStatus) === "ONLINE"
).length;

const offlineVehicles = iotData.filter(
  (iot) => getGpsStatus(iot.gpsStatus) === "OFFLINE"
).length;

const lockedVehicles = iotData.filter(
  (iot) => getLockStatus(iot.lockStatus) === "LOCKED"
).length;

const unlockedVehicles = iotData.filter(
  (iot) => getLockStatus(iot.lockStatus) === "UNLOCKED"
).length;

return(

<PageContainer>

<DashboardHeader

title="IoT Live Dashboard"

subtitle="Monitor GPS, smart locks, geofence alerts and vehicle telemetry in real time."

/>

<KPIGrid>

<KPICard
title="Online"
value={onlineVehicles}
subtitle="GPS Connected"
icon="📡"
color="green"
/>

<KPICard
title="Offline"
value={offlineVehicles}
subtitle="No Signal"
icon="📴"
color="red"
/>

<KPICard
title="Locked"
value={lockedVehicles}
subtitle="Secure"
icon="🔒"
color="blue"
/>

<KPICard
title="Unlocked"
value={unlockedVehicles}
subtitle="Accessible"
icon="🔓"
color="yellow"
/>

</KPIGrid>

<SectionHeader

title="Live Vehicle Status"

subtitle="Real-time telemetry from MongoDB."

/>

<DashboardCard

title="Vehicle Tracking"

subtitle="Live IoT Feed"

>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Vehicle ID
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Battery
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Latitude
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Longitude
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Lock Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
GPS Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Vehicle Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Last Ping
</th>

</tr>

</thead>

<tbody>

{iotData.map((iot)=>(

<tr
key={iot._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{iot.vehicleId}
</td>

<td className="px-6 py-5">

<div className="flex flex-col items-center gap-2">

<div className="w-28 h-3 rounded-full bg-gray-200 overflow-hidden">

<div
className="h-full rounded-full bg-gradient-to-r from-[#D6006E] via-[#FF165E] to-[#FF5556]"
style={{
width:`${iot.batteryPercentage}%`,
}}
/>

</div>

<span className="font-bold text-[#0A1134]">

{iot.batteryPercentage}%

</span>

</div>

</td>

<td className="px-6 py-5 text-center">
{iot.currentLat}
</td>

<td className="px-6 py-5 text-center">
{iot.currentLng}
</td>

<td className="px-6 py-5 text-center">
{getLockStatus(iot.lockStatus)==="LOCKED"&&(
<StatusBadge status="active"/>
)}

{getLockStatus(iot.lockStatus)==="UNLOCKED"&&(
<StatusBadge status="warning"/>
)}

</td>

<td className="px-6 py-5 text-center">

{getGpsStatus(iot.gpsStatus)==="ONLINE"&&(
<StatusBadge status="active"/>
)}

{getGpsStatus(iot.gpsStatus)==="OFFLINE"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center font-semibold">
{iot.vehicleStatus}
</td>

<td className="px-6 py-5 text-center">
{new Date(iot.createdAt).toLocaleString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

<SectionHeader
title="Geofence Alerts"
subtitle="Vehicles operating outside approved service boundaries."
/>

<DashboardCard
title="Alert History"
subtitle="Real-time geofence events"
>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Alert ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Vehicle ID
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Alert Type
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Latitude
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Longitude
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Time
</th>

</tr>

</thead>

<tbody>

{iotData
.filter((iot)=>iot.alertType)
.map((iot)=>(

<tr
key={iot._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{String(iot._id).slice(-6)}
</td>

<td className="px-6 py-5">
{iot.vehicleId}
</td>

<td className="px-6 py-5 text-center">

<StatusBadge status="inactive" />

</td>

<td className="px-6 py-5 text-center">
{iot.currentLat}
</td>

<td className="px-6 py-5 text-center">
{iot.currentLng}
</td>

<td className="px-6 py-5 text-center">
{new Date(iot.createdAt).toLocaleString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

<SectionHeader
title="Live Vehicle Tracking"
subtitle="Real-time GPS locations powered by Google Maps."
/>

<DashboardCard
title="Vehicle Map"
subtitle="Interactive live fleet tracking"
>

<div className="relative overflow-hidden rounded-[28px] border border-pink-100 bg-gray-50">
  <div
    ref={mapRef}
    className="h-[520px] w-full"
  />

  {mapStatus && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/85 px-6 text-center">
      <div>
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-4xl">
          🗺️
        </div>

        <h3 className="text-2xl font-black text-[#0A1134]">
          {mapStatus}
        </h3>

        <p className="mt-3 max-w-xl text-gray-500">
          Add Google Maps API key and valid vehicle latitude/longitude values to view live fleet markers.
        </p>
      </div>
    </div>
  )}

  {!mapStatus && (
    <div className="absolute left-5 top-5 rounded-2xl bg-white/95 px-5 py-3 shadow-xl">
      <p className="text-sm font-bold text-[#0A1134]">
        Live Fleet Map
      </p>
      <p className="text-xs text-gray-500">
        {validLocations.length} active GPS marker(s)
      </p>
    </div>
  )}
</div>

</DashboardCard>

<SectionHeader
title="Recent IoT Events"
subtitle="Latest telemetry and device events."
/>

<DashboardCard
title="Activity Feed"
subtitle="Recent events from connected IoT devices"
>
  <div className="divide-y divide-pink-100">

<div className="flex items-center gap-5 px-8 py-6 hover:bg-pink-50/40 transition">

<div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
📡
</div>

<div className="flex-1">

<h4 className="font-bold text-[#0A1134]">
KEBU-001 Ping Received
</h4>

<p className="text-gray-500 mt-1">
Vehicle reported successfully from GPS device.
</p>

</div>

<span className="text-sm text-gray-400">
Just Now
</span>

</div>

<div className="flex items-center gap-5 px-8 py-6 hover:bg-pink-50/40 transition">

<div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl">
🔋
</div>

<div className="flex-1">

<h4 className="font-bold text-[#0A1134]">
KEBU-021 Battery Dropped Below 20%
</h4>

<p className="text-gray-500 mt-1">
Low battery alert generated automatically.
</p>

</div>

<span className="text-sm text-gray-400">
2 mins ago
</span>

</div>

<div className="flex items-center gap-5 px-8 py-6 hover:bg-pink-50/40 transition">

<div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
🔓
</div>

<div className="flex-1">

<h4 className="font-bold text-[#0A1134]">
KEBU-014 Vehicle Unlocked
</h4>

<p className="text-gray-500 mt-1">
Smart lock status changed to unlocked.
</p>

</div>

<span className="text-sm text-gray-400">
5 mins ago
</span>

</div>

<div className="flex items-center gap-5 px-8 py-6 hover:bg-pink-50/40 transition">

<div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-2xl">
🚨
</div>

<div className="flex-1">

<h4 className="font-bold text-[#0A1134]">
KEBU-045 Tamper Alert Triggered
</h4>

<p className="text-gray-500 mt-1">
Potential unauthorized access detected.
</p>

</div>

<span className="text-sm text-gray-400">
10 mins ago
</span>

</div>

</div>

</DashboardCard>

</PageContainer>

);

}