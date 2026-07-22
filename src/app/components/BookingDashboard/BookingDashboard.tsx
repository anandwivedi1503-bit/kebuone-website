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
const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
const [processingId, setProcessingId] = useState("");

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

useEffect(() => {

fetchBookings();

const interval = setInterval(() => {

fetchBookings();

},30000);

return ()=>clearInterval(interval);

},[]);

const cancelBooking = async (id: string) => {

  const confirmCancel = confirm("Cancel this booking?");

if (!confirmCancel) return;

setProcessingId(id);

  const res = await fetch(`/api/bookings/${id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    rideStatus: "Cancelled",
  }),
});

const data = await res.json();

if (!data.success) {
  alert(data.message || "Unable to cancel booking.");
  setProcessingId("");
  return;
}

await fetchBookings();
setProcessingId("");
 };

const startRide = async (booking: any) => {

  const pickupOTP = prompt(
    "Enter Pickup OTP"
  );

  if (!pickupOTP) return;

  const confirmStart = confirm(
    "Start this ride?"
  );

  if (!confirmStart) return;
  setProcessingId(booking._id);

  try {

    const res = await fetch(
      "/api/ride/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          pickupOTP,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {

      alert(
        data.message ||
        "Unable to start ride."
      );

      setProcessingId("");

      return;

    }

    alert("Ride started successfully.");

    await fetchBookings();
    setProcessingId("");

  } catch {
    setProcessingId("");
    alert("Something went wrong.");
}

};

const endRide = async (booking: any) => {

  const rideEndOTP = prompt(
  "Enter Ride End OTP"
);

  if (!rideEndOTP) return;

  const endHub = prompt(
    "Enter End Hub",
    booking.startHub
  );

  if (!endHub) return;

  const confirmEnd = confirm(
    "Complete this ride?"
  );

  if (!confirmEnd) return;
  setProcessingId(booking._id);

  try {

    const res = await fetch(
      "/api/ride/end",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          rideEndOTP,
          endHub,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {

      alert(
        data.message ||
        "Unable to complete ride."
      );
     setProcessingId("");
      return;

    }

    alert("Ride completed successfully.");

await fetchBookings();

setProcessingId("");

  } catch {
    setProcessingId("");

    alert("Something went wrong.");

  }

};

const filteredBookings = bookings.filter((booking) => {
  const keyword = search.toLowerCase();

  return (
    booking.bookingId?.toLowerCase().includes(keyword) ||
    booking.userName?.toLowerCase().includes(keyword) ||
    booking.userPhone?.toLowerCase().includes(keyword) ||
    booking.vehicleId?.toLowerCase().includes(keyword) ||
    booking.startHub?.toLowerCase().includes(keyword) ||
    booking.rideStatus?.toLowerCase().includes(keyword) ||
booking.paymentStatus?.toLowerCase().includes(keyword)
  );
});

const totalBookings=bookings.length;

const activeBookings = bookings.filter(
(b)=>
b.rideStatus==="Booked" ||
b.rideStatus==="Reserved" ||
b.rideStatus==="Payment Pending" ||
b.rideStatus==="Ready For Pickup" ||
b.rideStatus==="In Ride"
).length;

const completedBookings = bookings.filter(
(b)=>b.rideStatus==="Completed"
).length;

const cancelledBookings = bookings.filter(
(b)=>b.rideStatus==="Cancelled"
).length;

const getBookingAmount = (booking: any) =>
  Number(booking.receivedAmount || 0);
const totalRevenue = bookings
  .filter(
    (booking) => booking.rideStatus !== "Cancelled"
  )
  .reduce(
    (sum, booking) =>
      sum + Number(booking.receivedAmount || 0),
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

<KPICard
title="Cancelled"
value={cancelledBookings}
subtitle="Bookings"
icon="❌"
color="red"
/>
</KPIGrid>

 <SectionHeader
 title="Booking Records"
subtitle="Search and manage all ride bookings."
rightContent={
<button
onClick={fetchBookings}
className="
rounded-xl
bg-gradient-to-r
from-[#D6006E]
to-[#FF165E]
px-5
py-3
font-bold
text-white
hover:scale-105
transition
"
>
🔄 Refresh
</button>
}
/>

<div className="mb-8">

<input

type="text"

placeholder="Search Booking ID, Rider, Phone, Vehicle or Hub..."

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

<table className="min-w-[1800px] w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Booking ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Date
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
User
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Phone
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Vehicle
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Rental
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
Pickup OTP
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Ride OTP
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Ride Time
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Received
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Pending
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Deposit
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Payment Mode
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Action
</th>

</tr>

</thead>

<tbody>

  {filteredBookings.length === 0 && (

<tr>
  <td
    colSpan={17}
    className="py-14"
  >
    <div className="flex flex-col items-center justify-center">

      <div className="text-6xl">
        🚲
      </div>

      <h2 className="mt-4 text-xl font-bold text-[#0A1134]">
        No Bookings Yet
      </h2>

      <p className="mt-2 text-gray-500">
        Bookings will appear here automatically.
      </p>

    </div>
  </td>
</tr>

)}

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
  {booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString("en-IN")
    : "-"}
</td>

<td className="px-6 py-5">
{booking.userName || "Rider"}
</td>

<td className="px-6 py-5">
{booking.userPhone || "-"}
</td>

<td className="px-6 py-5">
{booking.vehicleId || "-"}
</td>

<td className="px-6 py-5">
{booking.rentalMode || "-"}
</td>

<td className="px-6 py-5">
{booking.startHub || "-"}
</td>

<td className="px-6 py-5 text-center">

{booking.rideStatus === "Completed" && (
  <StatusBadge
    status="active"
    label="Completed"
  />
)}

{booking.rideStatus === "Ready For Pickup" && (
  <StatusBadge
    status="active"
    label="Ready For Pickup"
  />
)}

{booking.rideStatus === "In Ride" && (
  <StatusBadge
    status="warning"
    label="In Ride"
  />
)}

{booking.rideStatus === "Booked" && (
  <StatusBadge
    status="inactive"
    label="Booked"
  />
)}

{booking.rideStatus === "Reserved" && (
  <StatusBadge
    status="inactive"
    label="Reserved"
  />
)}

{booking.rideStatus === "Payment Pending" && (
  <StatusBadge
    status="warning"
    label="Payment Pending"
  />
)}

{booking.rideStatus === "Cancelled" && (
  <StatusBadge
    status="danger"
    label="Cancelled"
  />
)}

</td>

<td className="px-6 py-5 text-center">

{booking.paymentStatus === "Paid" && (
  <StatusBadge
    status="active"
    label="Paid"
  />
)}

{booking.paymentStatus === "Partial" && (
  <StatusBadge
    status="warning"
    label="Partial"
  />
)}

{booking.paymentStatus === "Pending" && (
  <StatusBadge
    status="inactive"
    label="Pending"
  />
)}

</td>

<td className="px-6 py-5 text-center">

{booking.pickupOTPVerified ? (

<StatusBadge
status="active"
label="Verified"
/>

) : booking.pickupOTP ? (

<StatusBadge
status="warning"
label="Generated"
/>

) : (

<StatusBadge
status="inactive"
label="Not Generated"
/>

)}

</td>

<td className="px-6 py-5 text-center">

{booking.rideStartOTPVerified ? (

<StatusBadge
status="active"
label="Verified"
/>

) : booking.rideStartOTP ? (

<StatusBadge
status="warning"
label="Generated"
/>

) : (

<StatusBadge
status="inactive"
label="Not Generated"
/>

)}

</td>

<td className="px-6 py-5 text-sm">

<div>

<div>

<b>Start:</b>

<br />

{booking.actualRideStart
? new Date(
booking.actualRideStart
).toLocaleString("en-IN")
: "-"}

</div>

<div className="mt-2">

<b>End:</b>

<br />

{booking.actualRideEnd
? new Date(
booking.actualRideEnd
).toLocaleString("en-IN")
: "-"}

</div>

</div>

</td>


<td className="px-6 py-5 text-center font-bold">
₹{getBookingAmount(booking).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center font-bold text-green-700">
₹{Number(booking.receivedAmount || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center font-bold text-orange-600">
₹{Number(booking.pendingAmount || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
₹{Number(booking.securityDeposit || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
{booking.paymentMode || "-"}
</td>

<td className="px-6 py-5">

<div className="flex flex-col gap-2">

{booking.rideStatus === "Booked" && (

<>

<button
onClick={() => setSelectedBooking(booking)}
className="rounded-lg bg-blue-600 px-3 py-2 text-white font-semibold"
>
View
</button>

<button
disabled={processingId === booking._id}
onClick={() => cancelBooking(booking._id)}
className="
rounded-lg
bg-red-600
px-3
py-2
text-white
font-semibold
disabled:opacity-50
disabled:cursor-not-allowed
"
>
{processingId === booking._id ? "Cancelling..." : "Cancel"}
</button>

</>

)}

{booking.rideStatus === "Payment Pending" && (

<button
disabled={processingId === booking._id}
onClick={() => cancelBooking(booking._id)}
className="
rounded-lg
bg-red-600
px-3
py-2
text-white
font-semibold
disabled:opacity-50
disabled:cursor-not-allowed
"
>
{processingId === booking._id ? "Cancelling..." : "Cancel"}
</button>

)}

{booking.rideStatus === "Ready For Pickup" && (

<button
disabled={processingId === booking._id}
onClick={() => startRide(booking)}
className="
rounded-lg
bg-green-600
px-3
py-2
text-white
font-semibold
disabled:opacity-50
disabled:cursor-not-allowed
"
>
{processingId === booking._id ? "Starting..." : "Start Ride"}
</button>

)}

{booking.rideStatus === "In Ride" && (

<button
disabled={processingId === booking._id}
onClick={() => endRide(booking)}
className="
rounded-lg
bg-orange-600
px-3
py-2
text-white
font-semibold
disabled:opacity-50
disabled:cursor-not-allowed
"
>
{processingId === booking._id ? "Ending..." : "End Ride"}
</button>

)}

{booking.rideStatus === "Completed" && (

<button
onClick={() => setSelectedBooking(booking)}
className="rounded-lg bg-indigo-600 px-3 py-2 text-white font-semibold"
>
View
</button>

)}

{booking.rideStatus === "Cancelled" && (

<button
onClick={() => setSelectedBooking(booking)}
className="rounded-lg bg-gray-600 px-3 py-2 text-white font-semibold"
>
View
</button>

)}

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

)}
</DashboardCard>

{selectedBooking && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">

<div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8">

<div className="mb-8 flex items-center justify-between">

<h2 className="text-3xl font-black text-[#0A1134]">
Booking Details
</h2>

<button
onClick={() => setSelectedBooking(null)}
className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
>
Close
</button>

</div>

<div className="grid grid-cols-1 gap-6 md:grid-cols-2">

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Rider Details
</h3>

<p><b>Name :</b> {selectedBooking.userName}</p>

<p><b>Phone :</b> {selectedBooking.userPhone}</p>

<p><b>Rider ID :</b> {selectedBooking.riderId}</p>

<p><b>User ID :</b> {selectedBooking.userId}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Vehicle Details
</h3>

<p><b>Vehicle ID :</b> {selectedBooking.vehicleId}</p>

<p><b>Vehicle No :</b> {selectedBooking.vehicleNumber}</p>

<p><b>Model :</b> {selectedBooking.vehicleModel}</p>

<p><b>Battery :</b> {selectedBooking.batteryPercentage}%</p>

<p><b>Battery Type :</b> {selectedBooking.batteryType}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Booking Details
</h3>

<p><b>Booking ID :</b> {selectedBooking.bookingId}</p>

<p><b>Rental Mode :</b> {selectedBooking.rentalMode}</p>

<p><b>Start Hub :</b> {selectedBooking.startHub}</p>

<p><b>End Hub :</b> {selectedBooking.endHub || "-"}</p>

<p><b>Ride Status :</b> {selectedBooking.rideStatus}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Payment Details
</h3>

<p>
  <b>Total :</b> ₹
  {(
    Number(selectedBooking.totalAmount || 0) +
    Number(selectedBooking.securityDeposit || 0)
  ).toLocaleString("en-IN")}
</p>

<p><b>Received :</b> ₹{selectedBooking.receivedAmount}</p>

<p><b>Pending :</b> ₹{selectedBooking.pendingAmount}</p>

<p><b>Deposit :</b> ₹{selectedBooking.securityDeposit}</p>

<p><b>Payment Status :</b> {selectedBooking.paymentStatus}</p>

<p><b>Payment Mode :</b> {selectedBooking.paymentMode}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Refund Details
</h3>

<p>
<b>Refund Amount :</b>
₹{Number(selectedBooking.refundAmount || 0).toLocaleString("en-IN")}
</p>

<p>
<b>Security Deposit Refunded :</b>
{selectedBooking.securityDepositRefunded ? " Yes" : " No"}
</p>

<p>
<b>Refund Status :</b>
{selectedBooking.refundStatus || "None"}
</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
OTP Details
</h3>

<p>
  <b>Pickup OTP :</b> {selectedBooking.pickupOTP || "-"}
</p>

<p>
  <b>Pickup Verified :</b>{" "}
  {selectedBooking.pickupOTPVerifiedAt
    ? new Date(selectedBooking.pickupOTPVerifiedAt).toLocaleString("en-IN")
    : "-"}
</p>

<hr className="my-3"/>

<p>
  <b>Ride Start OTP :</b> {selectedBooking.rideStartOTP || "-"}
</p>

<p>
  <b>Ride Started :</b>{" "}
  {selectedBooking.actualRideStart
    ? new Date(selectedBooking.actualRideStart).toLocaleString("en-IN")
    : "-"}
</p>

<hr className="my-3"/>

<p>
  <b>Ride End OTP :</b> {selectedBooking.rideEndOTP || "-"}
</p>

<p>
  <b>Ride Ended :</b>{" "}
  {selectedBooking.actualRideEnd
    ? new Date(selectedBooking.actualRideEnd).toLocaleString("en-IN")
    : "-"}
</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Ride Timeline
</h3>

<p>

<b>Ride Start :</b><br/>

{selectedBooking.actualRideStart ?

new Date(selectedBooking.actualRideStart).toLocaleString("en-IN")

:

"-"}

</p>

<br/>

<p>

<b>Ride End :</b><br/>

{selectedBooking.actualRideEnd ?

new Date(selectedBooking.actualRideEnd).toLocaleString("en-IN")

:

"-"}

</p>

{selectedBooking.actualRideStart &&
 selectedBooking.actualRideEnd && (() => {

const totalMinutes =
Math.floor(
(
new Date(selectedBooking.actualRideEnd).getTime() -
new Date(selectedBooking.actualRideStart).getTime()
) /
1000 /
60
);

const days = Math.floor(totalMinutes / 1440);

const hours = Math.floor((totalMinutes % 1440) / 60);

const minutes = totalMinutes % 60;

return (

<p className="mt-4">

<b>Ride Duration :</b>{" "}

{days > 0 && `${days}d `}

{hours > 0 && `${hours}h `}

{minutes}m

</p>

);

})()}

</div>

<div className="rounded-2xl border p-5 md:col-span-2">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Booking Remarks
</h3>

<p className="whitespace-pre-wrap text-gray-700">

{selectedBooking.remarks || "No remarks available."}

</p>

</div>

</div>

</div>

</div>

)}

</PageContainer>
);
}