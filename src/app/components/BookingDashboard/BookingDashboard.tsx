"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function BookingDashboard(){

const [bookings,setBookings]=useState<any[]>([]);
const [loading,setLoading]=useState(true);
const [search,setSearch]=useState("");

const fetchBookings=async()=>{

try{

const res=await fetch("/api/bookings");

const data=await res.json();

if(data.success){

setBookings(data.data);

}

}catch(error){

console.log(error);

}

setLoading(false);

};

useEffect(()=>{

fetchBookings();

},[]);

const deleteBooking=async(id:string)=>{

const confirmDelete=confirm("Delete this booking?");

if(!confirmDelete) return;

await fetch(`/api/bookings/${id}`,{
method:"DELETE",
});

fetchBookings();

};

const filteredBookings = bookings.filter((booking) => {
  const keyword = search.toLowerCase();

  return (
    booking.bookingId?.toLowerCase().includes(keyword) ||
    booking.userName?.toLowerCase().includes(keyword) ||
    booking.userPhone?.toLowerCase().includes(keyword) ||
    booking.vehicleId?.toLowerCase().includes(keyword) ||
    booking.startHub?.toLowerCase().includes(keyword) ||
    booking.rideStatus?.toLowerCase().includes(keyword)
  );
});

const totalBookings=bookings.length;

const activeBookings=bookings.filter(
(b)=>
b.rideStatus==="Booked"||
b.rideStatus==="In Ride"
).length;

const completedBookings=bookings.filter(
(b)=>b.rideStatus==="Completed"
).length;

const getBookingAmount = (booking: any) =>
  Number(booking.receivedAmount || booking.totalAmount || booking.amount || 0);

const totalRevenue = bookings.reduce(
  (sum, booking) => sum + getBookingAmount(booking),
  0
);

return(

<PageContainer>

<DashboardHeader

title="Booking Management"

subtitle="Monitor all bike bookings, ride status and booking revenue."

/>

<KPIGrid>

<KPICard
title="Bookings"
value={totalBookings}
subtitle="Total"
icon="📋"
color="pink"
/>

<KPICard
title="Active"
value={activeBookings}
subtitle="In Progress"
icon="🚲"
color="green"
/>

<KPICard
title="Completed"
value={completedBookings}
subtitle="Finished"
icon="✅"
color="blue"
/>

<KPICard
title="Revenue"
value={`₹${totalRevenue}`}
subtitle="Bookings"
icon="💰"
color="yellow"
/>

</KPIGrid>

<SectionHeader

title="Booking Records"

subtitle="Search and manage all ride bookings."

/>

<div className="mb-8">

<input

type="text"

placeholder="Search Booking ID..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="
w-full
rounded-2xl
border
border-pink-100
bg-white
px-5
py-4
focus:outline-none
focus:ring-2
focus:ring-pink-200
"

/>

</div>

<DashboardCard

title="Bookings"

subtitle="Live Booking Records"

>

  {loading ? (

<div className="text-center py-16 text-gray-500">

Loading Bookings...

</div>

) : (

<div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Booking ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
User
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Vehicle
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Hub
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Ride Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Payment
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Amount
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Action
</th>

</tr>

</thead>

<tbody>

{filteredBookings.map((booking)=>(

<tr
key={booking._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{booking.bookingId}
</td>

<td className="px-6 py-5">
{booking.userName || "Rider"}
</td>

<td className="px-6 py-5">
{booking.vehicleId || "-"}
</td>

<td className="px-6 py-5">
{booking.startHub || "-"}
</td>

<td className="px-6 py-5 text-center">

{booking.rideStatus==="Completed"&&(
<StatusBadge status="active"/>
)}

{booking.rideStatus==="In Ride"&&(
<StatusBadge status="warning"/>
)}

{booking.rideStatus==="Booked"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center">

{booking.paymentStatus==="Paid"&&(
<StatusBadge status="active"/>
)}

{booking.paymentStatus!=="Paid"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center font-bold">
₹{getBookingAmount(booking)}
</td>

<td className="px-6 py-5 text-center">

<button
onClick={()=>deleteBooking(booking._id)}
className="
px-5
py-2
rounded-xl
bg-red-600
text-white
font-semibold
hover:bg-red-700
transition
"
>

Delete

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

)}
</DashboardCard>
</PageContainer>
);
}