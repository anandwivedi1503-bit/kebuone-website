"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";

export default function AnalyticsDashboard(){

const [riders,setRiders]=useState<any[]>([]);
const [vehicles,setVehicles]=useState<any[]>([]);
const [hubs,setHubs]=useState<any[]>([]);
const [bookings,setBookings]=useState<any[]>([]);
const [transactions,setTransactions]=useState<any[]>([]);

useEffect(()=>{

fetch("/api/riders")
.then((res)=>res.json())
.then((data)=>setRiders(data.data||[]));

fetch("/api/vehicles")
.then((res)=>res.json())
.then((data)=>setVehicles(data.data||[]));

fetch("/api/hubs")
.then((res)=>res.json())
.then((data)=>setHubs(data.data||[]));

fetch("/api/bookings")
.then((res)=>res.json())
.then((data)=>setBookings(data.data||[]));

fetch("/api/transactions")
.then((res)=>res.json())
.then((data)=>setTransactions(data.data||[]));

},[]);

const totalRevenue=transactions.reduce(
(sum,item)=>sum+(item.amount||0),
0
);

const activeRides = bookings.filter(
  (item) =>
    item.rideStatus === "Booked" ||
    item.rideStatus === "In Ride" ||
    item.status === "Active"
).length;

const completedRides = bookings.filter(
  (item) =>
    item.rideStatus === "Completed" ||
    item.status === "Completed"
).length;

return(

<PageContainer>

<DashboardHeader

title="Analytics Dashboard"

subtitle="Business intelligence and operational insights."

/>

<KPIGrid>

<KPICard
title="Riders"
value={riders.length}
subtitle="Registered"
icon="👥"
color="pink"
/>

<KPICard
title="Vehicles"
value={vehicles.length}
subtitle="Fleet"
icon="🛵"
color="green"
/>

<KPICard
title="Hubs"
value={hubs.length}
subtitle="Locations"
icon="📍"
color="blue"
/>

<KPICard
title="Bookings"
value={bookings.length}
subtitle="Total"
icon="📋"
color="yellow"
/>

<KPICard
title="Active"
value={activeRides}
subtitle="Current Rides"
icon="🚲"
color="purple"
/>

<KPICard
title="Revenue"
value={`₹${totalRevenue}`}
subtitle="Collected"
icon="💰"
color="red"
/>

</KPIGrid>

<SectionHeader

title="Business Analytics"

subtitle="Overall operational performance."

/>

<DashboardCard

title="Analytics Overview"

subtitle="Key Performance Metrics"

>

  <div className="grid md:grid-cols-2 gap-8">

<div className="rounded-3xl border border-blue-100 bg-blue-50 p-8">

<p className="text-sm font-semibold text-gray-500">
Completed Rides
</p>

<h3 className="text-6xl font-black text-blue-600 mt-4">
{completedRides}
</h3>

<p className="text-gray-500 mt-4">
Successfully completed trips across the Kebu One network.
</p>

</div>

<div className="rounded-3xl border border-green-100 bg-green-50 p-8">

<p className="text-sm font-semibold text-gray-500">
Successful Transactions
</p>

<h3 className="text-6xl font-black text-green-600 mt-4">
{transactions.length}
</h3>

<p className="text-gray-500 mt-4">
Processed payments recorded in the system.
</p>

</div>

<div className="rounded-3xl border border-pink-100 bg-pink-50 p-8">

<p className="text-sm font-semibold text-gray-500">
Fleet Utilization
</p>

<h3 className="text-6xl font-black text-pink-600 mt-4">

{vehicles.length===0
?0
:Math.round((activeRides/vehicles.length)*100)
}%

</h3>

<p className="text-gray-500 mt-4">
Percentage of fleet currently being utilized.
</p>

</div>

<div className="rounded-3xl border border-yellow-100 bg-yellow-50 p-8">

<p className="text-sm font-semibold text-gray-500">
Average Revenue / Booking
</p>

<h3 className="text-6xl font-black text-yellow-600 mt-4">

₹{
bookings.length===0
?0
:Math.round(totalRevenue/bookings.length)
}

</h3>

<p className="text-gray-500 mt-4">
Average earning generated per booking.
</p>

</div>

</div>

</DashboardCard>
</PageContainer>
);
}