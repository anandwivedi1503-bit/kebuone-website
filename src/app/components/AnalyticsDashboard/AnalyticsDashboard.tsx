"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";

export default function AnalyticsDashboard(){

const [analytics, setAnalytics] = useState<any>(null);
const [lastUpdated, setLastUpdated] = useState("");
const [period, setPeriod] = useState("all");

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");



useEffect(() => {
  const loadAnalytics = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/analytics?period=${period}`, {
  cache: "no-store",
});

    const data = await res.json();

    if (!data.success) {
      setError("Unable to load analytics.");
      return;
    }

    setAnalytics(data.data);

    setLastUpdated(
      new Date().toLocaleTimeString()
    );

  } catch {

    setError("Unable to load analytics.");

  } finally {

    setLoading(false);

  }
};

  loadAnalytics();

  const interval = setInterval(
    loadAnalytics,
    30000
  );

  return () => clearInterval(interval);

}, [period]);



return(

<PageContainer>

  {loading && (
  <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
    Loading latest analytics...
  </div>
)}

{error && (
  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
    {error}
  </div>
)}

<DashboardHeader

title="Analytics Dashboard"

subtitle="Business intelligence and operational insights."

/>

<p className="mb-6 text-right text-sm text-gray-500">

Last Updated:
{loading ? "Updating..." : lastUpdated || "--"}

</p>

<KPIGrid>

<KPICard
title="Riders"
value={analytics?.totalRiders || 0}
subtitle="Registered"
icon="👥"
color="pink"
/>

<KPICard
title="Vehicles"
value={analytics?.totalVehicles || 0}
subtitle="Fleet"
icon="🛵"
color="green"
/>

<KPICard
title="Hubs"
value={analytics?.totalHubs || 0}
subtitle="Locations"
icon="📍"
color="blue"
/>

<KPICard
title="Bookings"
value={analytics?.totalBookings || 0}
subtitle="Total"
icon="📋"
color="yellow"
/>

<KPICard
title="Active"
value={analytics?.activeRides || 0}
subtitle="Current Rides"
icon="🚲"
color="purple"
/>

<KPICard
title="Revenue"
value={`₹${Number(
analytics?.totalRevenue || 0
).toLocaleString("en-IN")}`}
subtitle="Collected"
icon="💰"
color="red"
/>

</KPIGrid>

<SectionHeader

title="Business Analytics"

subtitle="Overall operational performance."

/>

<div className="mb-6 flex justify-end">
  <select
    value={period}
    onChange={(e) => setPeriod(e.target.value)}
    className="rounded-xl border border-gray-200 px-4 py-3"
  >
    <option value="all">All Time</option>
    <option value="today">Today</option>
    <option value="week">Last 7 Days</option>
    <option value="month">This Month</option>
    <option value="year">This Year</option>
  </select>
</div>

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
{analytics?.completedRides || 0}
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
{analytics?.totalTransactions || 0}
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

{analytics?.fleetUtilization || 0}%

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
Number(
analytics?.averageRevenue || 0
).toLocaleString("en-IN")
}

</h3>

<p className="text-gray-500 mt-4">
Average earning generated per booking.
</p>

</div>

</div>

</DashboardCard>

<SectionHeader
  title="Operational Insights"
  subtitle="Live operational statistics"
/>

<div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

  <KPICard
    title="Available Vehicles"
    value={analytics?.availableVehicles || 0}
    subtitle="Ready for booking"
    icon="🛵"
    color="green"
  />

  <KPICard
    title="Vehicles In Ride"
    value={analytics?.inRideVehicles || 0}
    subtitle="Currently active"
    icon="🚲"
    color="blue"
  />

  <KPICard
    title="Maintenance"
    value={analytics?.maintenanceVehicles || 0}
    subtitle="Under service"
    icon="🔧"
    color="yellow"
  />

  <KPICard
    title="Low Battery"
    value={analytics?.lowBatteryVehicles || 0}
    subtitle="Needs charging"
    icon="🔋"
    color="red"
  />

  <KPICard
    title="Active Riders"
    value={analytics?.activeRiders || 0}
    subtitle="Currently riding"
    icon="👤"
    color="purple"
  />

  <KPICard
    title="Cancelled Bookings"
    value={analytics?.cancelledBookings || 0}
    subtitle="Current period"
    icon="❌"
    color="pink"
  />

  <KPICard
    title="Payment Success"
    value={`${analytics?.paymentSuccessRate || 0}%`}
    subtitle="Gateway success"
    icon="💳"
    color="green"
  />

  <KPICard
    title="Completed Rides"
    value={analytics?.completedRides || 0}
    subtitle="Current period"
    icon="🏁"
    color="blue"
  />

</div>

<SectionHeader
title="Monthly Analytics"
subtitle="Revenue & Booking Trends"
/>

<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

<DashboardCard
title="Monthly Revenue"
subtitle="Current Year"
>

<div className="space-y-4">

{[
"Jan",
"Feb",
"Mar",
"Apr",
"May",
"Jun",
"Jul",
"Aug",
"Sep",
"Oct",
"Nov",
"Dec",
].map((month,index)=>(

<div
key={month}
>

<div className="flex justify-between text-sm mb-1">

<span>{month}</span>

<span>

₹{Number(
analytics?.monthlyRevenue?.[index] || 0
).toLocaleString("en-IN")}

</span>

</div>

<div className="h-3 rounded-full bg-pink-100">

<div

style={{
  width: `${
    Math.max(...(analytics?.monthlyRevenue || [1])) === 0
      ? 0
      : (
          ((analytics?.monthlyRevenue?.[index] || 0) /
            Math.max(...(analytics?.monthlyRevenue || [1]))) *
          100
        )
  }%`,
}}

className="h-3 rounded-full bg-pink-500"

/>

</div>

</div>

))}

</div>

</DashboardCard>

<DashboardCard

title="Monthly Bookings"

subtitle="Current Year"

>

<div className="space-y-4">

{[
"Jan",
"Feb",
"Mar",
"Apr",
"May",
"Jun",
"Jul",
"Aug",
"Sep",
"Oct",
"Nov",
"Dec",
].map((month,index)=>(

<div
key={month}
>

<div className="flex justify-between text-sm mb-1">

<span>{month}</span>

<span>

{Number(
  analytics?.monthlyBookings?.[index] || 0
).toLocaleString("en-IN")}

</span>

</div>

<div className="h-3 rounded-full bg-blue-100">

<div

style={{
  width: `${
    Math.max(...(analytics?.monthlyBookings || [1])) === 0
      ? 0
      : (
          ((analytics?.monthlyBookings?.[index] || 0) /
            Math.max(...(analytics?.monthlyBookings || [1]))) *
          100
        )
  }%`,
}}

className="h-3 rounded-full bg-blue-500"

/>

</div>

</div>

))}

</div>

</DashboardCard>

</div>

<SectionHeader
title="Business Insights"
subtitle="Top performing resources"
/>

{analytics &&
analytics.topHubs?.length===0 &&

analytics.topVehicleModels?.length===0 &&

analytics.paymentDistribution?.length===0 && (

<div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">

No analytics available yet.

</div>

)}

<div className="grid gap-6 lg:grid-cols-3">

<DashboardCard
title="Top Hubs"
subtitle="Most bookings"
>

<div className="space-y-4">

{analytics?.topHubs?.length ? (

analytics.topHubs.map((item:any)=>(

<div
key={item[0]}
className="flex justify-between"
>

<span>{item[0]}</span>

<b>{item[1]}</b>

</div>

))

) : (

<p className="text-center text-gray-500">
No hub data available.
</p>

)}

</div>

</DashboardCard>

<DashboardCard
title="Vehicle Models"
subtitle="Most booked"
>

<div className="space-y-4">

{analytics?.topVehicleModels?.length ? (

analytics.topVehicleModels.map((item:any)=>(

<div
key={item[0]}
className="flex justify-between"
>

<span>{item[0]}</span>

<b>{item[1]}</b>

</div>

))

) : (

<p className="text-center text-gray-500">
No vehicle statistics available.
</p>

)}

</div>

</DashboardCard>

<DashboardCard
title="Payment Methods"
subtitle="Distribution"
>

<div className="space-y-4">

{analytics?.paymentDistribution?.length ? (

analytics.paymentDistribution.map((item:any)=>(

<div
key={item[0]}
className="flex justify-between"
>

<span>{item[0]}</span>

<b>{item[1]}</b>

</div>

))

) : (

<p className="text-center text-gray-500">
No payment data available.
</p>

)}

</div>

</DashboardCard>

</div>


</PageContainer>
);
}