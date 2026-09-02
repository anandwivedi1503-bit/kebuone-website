"use client";

import { useEffect, useState } from "react";

import { consumeOpsFocus } from "@/lib/opsFocus";
import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";
import { getBookingPayableAmount, money } from "@/lib/gst";
import { bookingRentalCollected } from "@/lib/opsRevenue";
import { downloadHtmlFile } from "@/lib/dashboardExport";
import OpsMoneyStrip from "../DashboardUI/OpsMoneyStrip";
import YardQueueStrip from "../DashboardUI/YardQueueStrip";
import CashCollectForm from "../YardRideDesk/CashCollectForm";

export default function BookingDashboard(){

const [bookings,setBookings]=useState<any[]>([]);
const [loading,setLoading]=useState(true);
const [loadError,setLoadError]=useState("");
const [search,setSearch]=useState(() => consumeOpsFocus());
const [statusFilter, setStatusFilter] = useState("ALL");
const [paymentFilter, setPaymentFilter] = useState("ALL");
const [modeFilter, setModeFilter] = useState("ALL");
const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
const [processingId, setProcessingId] = useState("");
const [generatedPickupOTP, setGeneratedPickupOTP] =
useState<Record<string, string>>({});
const [otpModalOpen, setOtpModalOpen] = useState(false);

const [selectedRideBooking, setSelectedRideBooking] =
useState<any>(null);

const [enteredPickupOTP, setEnteredPickupOTP] =
useState("");
const [rideEndModalOpen, setRideEndModalOpen] =
useState(false);

const [selectedEndRideBooking, setSelectedEndRideBooking] =
useState<any>(null);

const [enteredRideEndOTP, setEnteredRideEndOTP] =
useState("");

const [enteredEndHub, setEnteredEndHub] =
useState("");

const fetchBookings=async()=>{

try{

const params = new URLSearchParams({ limit: "80" });
if (statusFilter !== "ALL") params.set("rideStatus", statusFilter);
if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);
if (modeFilter !== "ALL") params.set("rentalMode", modeFilter);
if (search.trim()) params.set("q", search.trim());

const res=await fetch(`/api/bookings?${params.toString()}`, { cache: "no-store" });

const data=await res.json();

if(data.success){

setBookings(data.data || []);
setLoadError("");

} else {
  setLoadError(data.message || "Unable to load bookings.");
}

}catch(error){

console.log(error);
setLoadError("Unable to load bookings. Check the admin session and refresh.");

}

setLoading(false);

};

useEffect(() => {

fetchBookings();

const interval = setInterval(() => {

fetchBookings();

}, 20000);

return ()=>clearInterval(interval);

},[search, statusFilter, paymentFilter, modeFilter]);

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

 const generatePickupOTP = async (booking: any) => {

  setProcessingId(booking._id);

  try {

    const res = await fetch(
      "/api/rides/generate-pickup-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {

      alert(
        data.message ||
        "Unable to generate Pickup OTP."
      );

      setProcessingId("");

      return;

    }

    setGeneratedPickupOTP((prev) => ({
      ...prev,
      [booking._id]: data.pickupOTP,
    }));

    alert("Pickup OTP generated successfully.");

    await fetchBookings();

  } catch {

    alert("Something went wrong.");

  }

  setProcessingId("");

};

const startRide = async (
  booking: any,
  pickupOTP: string
) => {

  if (!pickupOTP) {

    alert("Pickup OTP required.");

    return;

  }

  const confirmStart = confirm(
    "Confirm pickup OTP and unlock for the rider? The rider then swipes Ride started on Book EV."
  );

  if (!confirmStart) return;
  setProcessingId(booking._id);

  try {

    const res = await fetch(
      "/api/rides/start",
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

    alert(data.message || "Pickup OTP saved. Rider will swipe Ride started.");

setOtpModalOpen(false);

setSelectedRideBooking(null);

setEnteredPickupOTP("");

await fetchBookings();

setGeneratedPickupOTP((prev) => {
  const updated = { ...prev };
  delete updated[booking._id];
  return updated;
});

setProcessingId("");

  } catch {
    setProcessingId("");
    alert("Something went wrong.");
}

};

const endRide = async (
  booking: any,
  rideEndOTP: string,
  endHub: string
) => {

  if (!rideEndOTP) {

    alert("Ride End OTP required.");

    return;

  }

  if (!endHub) {

    alert("End Hub required.");

    return;

  }

  const pendingDue = Number(booking.pendingAmount || 0);
  const confirmEnd = confirm(
    pendingDue > 0
      ? `Remaining ₹${pendingDue.toFixed(2)} is still unpaid. Ride end OTP is not issued until it is paid.`
      : "Complete this ride with the ride end OTP from the rider?"
  );

  if (!confirmEnd) return;
  setProcessingId(booking._id);

  try {

    const res = await fetch(
      "/api/rides/end",
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

    alert(data.message || "Ride completed successfully.");

setRideEndModalOpen(false);

setSelectedEndRideBooking(null);

setEnteredRideEndOTP("");

setEnteredEndHub("");

await fetchBookings();

setProcessingId("");

  } catch {
    setProcessingId("");

    alert("Something went wrong.");

  }

};

const filteredBookings = bookings.filter((booking) => {

  const keyword = search.toLowerCase();

  const matchesSearch =

    booking.bookingId?.toLowerCase().includes(keyword) ||

    booking.userName?.toLowerCase().includes(keyword) ||

    booking.userPhone?.toLowerCase().includes(keyword) ||

    booking.vehicleId?.toLowerCase().includes(keyword) ||
    booking.vehicleNumber?.toLowerCase().includes(keyword) ||
    booking.vehicleModel?.toLowerCase().includes(keyword) ||
    booking.startHub?.toLowerCase().includes(keyword) ||
    booking.pickupHubName?.toLowerCase().includes(keyword);

  const matchesStatus =
statusFilter === "ALL" ||
booking.rideStatus === statusFilter;

const matchesPayment =
paymentFilter === "ALL" ||
booking.paymentStatus === paymentFilter;

const matchesMode =
modeFilter === "ALL" ||
(modeFilter === "Rent To Own"
  ? booking.rentalMode === "Rent To Own"
  : booking.rentalMode !== "Rent To Own");

return (
matchesSearch &&
matchesStatus &&
matchesPayment &&
matchesMode
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
  getBookingPayableAmount(booking);
const totalRevenue = bookings
  .reduce(
    (sum, booking) =>
      sum + bookingRentalCollected(booking),
    0
  );

  const todaysBookings = bookings.filter((booking) => {

if (!booking.createdAt) return false;

const today = new Date();

const bookingDate = new Date(booking.createdAt);

return bookingDate.toDateString() === today.toDateString();

}).length;

const readyForPickup = bookings.filter(
(booking)=>booking.rideStatus==="Ready For Pickup"
).length;

const pendingPayments = bookings.filter(
(booking)=>booking.paymentStatus==="Pending"
).length;

const partialPayments = bookings.filter(
(booking)=>booking.paymentStatus==="Partial"
).length;

const rupees = (value: unknown) =>
  `₹${money(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const hubDisplay = (booking: any) => {
  const name = String(booking.pickupHubName || "").trim();
  const code = String(booking.startHub || booking.currentHub || "").trim();
  if (name && code && name !== code) return `${name} (${code})`;
  return name || code || "-";
};

const pickupOtpReady = (booking: any) =>
  Boolean(
    booking.pickupOTP ||
      booking.pickupOTPGenerated ||
      generatedPickupOTP[booking._id]
  );

return(

<PageContainer>

<DashboardHeader

title="Booking Management"

subtitle="Same live booking ledger as Wallet, Refunds, Transactions and Hub. Razorpay, wallet credit, or cash at the yard all update paid vs pending here."

/>

<OpsMoneyStrip />
<YardQueueStrip />


{loadError ? (
  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
    {loadError}
  </div>
) : null}

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
value={rupees(totalRevenue)}
subtitle="Rent + GST collected (deposit held separately)"
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

<KPICard
title="Today's Bookings"
value={todaysBookings}
subtitle="Created Today"
icon="📅"
color="blue"
/>

<KPICard
title="Ready For Pickup"
value={readyForPickup}
subtitle="Waiting"
icon="🛵"
color="yellow"
/>

<KPICard
title="Pending Payments"
value={pendingPayments}
subtitle="Awaiting"
icon="💰"
color="red"
/>

<KPICard
title="Partial Payments"
value={partialPayments}
subtitle="Advance Paid"
icon="🟣"
color="pink"
/>
</KPIGrid>

 <SectionHeader
 title="Booking Records"
subtitle="Search and manage all ride bookings."
rightContent={

<div className="flex gap-3">

<button
onClick={() => {

const rows = filteredBookings.map((b:any)=>({

BookingID:b.bookingId,

Customer:b.userName,

Phone:b.userPhone,

Vehicle:b.vehicleId,

Model:b.vehicleModel,

Registration:b.vehicleNumber,

Hub:b.pickupHubName || b.startHub,

RideStatus:b.rideStatus,

PaymentStatus:b.paymentStatus,

Total:getBookingPayableAmount(b),

Received:b.receivedAmount,

Pending:b.pendingAmount,

PickupOTP:b.pickupOTPGenerated || b.pickupOTP ? "Generated" : "Not generated",

}));

const csv=[

Object.keys(rows[0]||{}).join(","),

...rows.map(Object.values).map(r=>r.join(","))

].join("\n");

const blob=new Blob([csv],{
type:"text/csv"
});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="Bookings.csv";

a.click();

URL.revokeObjectURL(url);

}}

className="
rounded-xl
bg-green-600
px-5
py-3
font-bold
text-white
hover:bg-green-700
"
>

Export CSV

</button>

<button
type="button"
onClick={() => {
  downloadHtmlFile(
    `EVUDDY-booking-list-${new Date().toISOString().slice(0, 10)}.html`,
    document.documentElement.outerHTML
  );
}}
className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700"
>
Download file
</button>

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

</div>

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

<div className="mb-8 flex flex-wrap gap-3">

{[
"ALL",
"Booked",
"Payment Pending",
"Ready For Pickup",
"In Ride",
"Completed",
"Cancelled",
].map((status)=>(

<button

key={status}

onClick={()=>setStatusFilter(status)}

className={`

rounded-xl
px-5
py-2
font-semibold
transition

${
statusFilter===status

? "bg-[#FF165E] text-white"

: "bg-gray-100 hover:bg-pink-100"

}

`}

>

{status}

</button>

))}

</div>

<div className="mb-8 flex flex-wrap gap-3">

{[
"ALL",
"Pending",
"Partial",
"Paid",
].map((status)=>(

<button

key={status}

onClick={()=>setPaymentFilter(status)}

className={`
rounded-xl
px-5
py-2
font-semibold
transition

${
paymentFilter===status
? "bg-green-600 text-white"
: "bg-gray-100 hover:bg-green-100"
}

`}

>

{status}

</button>

))}

</div>

<div className="mb-8 flex flex-wrap gap-3">

{[
["ALL", "All plans"],
["Rental", "Normal rental"],
["Rent To Own", "Rent to Own"],
].map(([value, label])=>(

<button
key={value}
onClick={()=>setModeFilter(value)}
className={`
rounded-xl
px-5
py-2
font-semibold
transition
${
modeFilter===value
? "bg-[#18B368] text-white"
: "bg-gray-100 hover:bg-emerald-100"
}
`}
>
{label}
</button>

))}

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
Ride start
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Ride Time
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Total
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
    colSpan={18}
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
        Bookings will appear here automatically. First payment issues pickup OTP. Remaining shows as Pending until paid mid-ride or at ride end.
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
  <div className="font-semibold">{booking.vehicleId || "-"}</div>
  <div className="text-xs text-slate-500">
    {booking.vehicleModel || "Model -"}
  </div>
  <div className="text-xs text-slate-500">
    {booking.vehicleNumber || "Reg -"}
  </div>
</td>

<td className="px-6 py-5">
{booking.rentalMode || "-"}
</td>

<td className="px-6 py-5">
{hubDisplay(booking)}
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

{![
  "Completed",
  "Ready For Pickup",
  "In Ride",
  "Booked",
  "Reserved",
  "Payment Pending",
  "Cancelled",
].includes(String(booking.rideStatus || "")) && (
  <StatusBadge
    status="inactive"
    label={booking.rideStatus || "Unknown"}
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

{!["Paid", "Partial", "Pending"].includes(String(booking.paymentStatus || "")) && (
  <StatusBadge
    status="inactive"
    label={booking.paymentStatus || "Unknown"}
  />
)}

</td>

<td className="px-6 py-5 text-center">

{booking.pickupOTPVerified ? (

<StatusBadge
status="active"
label="Verified"
/>

) : pickupOtpReady(booking) ? (

<StatusBadge
status="warning"
label="Generated"
/>

) : Number(booking.receivedAmount || 0) < 1 ? (

<StatusBadge
status="inactive"
label="After first pay"
/>

) : (

<StatusBadge
status="inactive"
label="Not Generated"
/>

)}

</td>

<td className="px-6 py-5 text-center">

{booking.actualRideStart ? (

<StatusBadge
status="active"
label="Rider swiped"
/>

) : booking.rideStatus === "In Ride" ? (

<StatusBadge
status="warning"
label="Waiting swipe"
/>

) : (

<StatusBadge
status="inactive"
label="—"
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
{rupees(getBookingAmount(booking))}
</td>

<td className="px-6 py-5 text-center font-bold text-green-700">
{rupees(booking.receivedAmount)}
</td>

<td className="px-6 py-5 text-center font-bold text-orange-600">
{rupees(booking.pendingAmount)}
</td>

<td className="px-6 py-5 text-center">
{rupees(booking.securityDeposit)}
</td>

<td className="px-6 py-5 text-center">
{booking.paymentMode || "-"}
</td>

<td className="px-6 py-5">

<div className="flex flex-col gap-2">

{Number(booking.pendingAmount || 0) > 0.009 && booking.rideStatus !== "Cancelled" ? (
  <CashCollectForm
    bookingId={booking.bookingId}
    pendingAmount={Number(booking.pendingAmount || 0)}
    onDone={() => void fetchBookings()}
  />
) : null}

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

{booking.rideStatus === "Ready For Pickup" && (

<>
{!(generatedPickupOTP[booking._id]) ? (

<button
disabled={processingId===booking._id}
onClick={()=>generatePickupOTP(booking)}
className="
rounded-lg
bg-blue-600
px-3
py-2
text-white
font-semibold
disabled:opacity-50
disabled:cursor-not-allowed
"
>

{processingId===booking._id
? "Loading..."
: pickupOtpReady(booking)
? "Show Pickup OTP"
: "Generate Pickup OTP"}

</button>

) : (

<>

<div className="rounded-lg bg-yellow-100 p-2 text-center border">

<div className="text-xs text-gray-600">
Pickup OTP
</div>

<div className="text-2xl font-bold tracking-widest">

{booking.pickupOTP || generatedPickupOTP[booking._id]}

</div>

</div>

<button
disabled={processingId===booking._id}
onClick={() => {

setSelectedRideBooking(booking);

setEnteredPickupOTP("");

setOtpModalOpen(true);

}}
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

{processingId===booking._id
? "Starting..."
: "Start Ride"}

</button>

</>

)}

</>

)}

{booking.rideStatus === "In Ride" && (

<>

<button
onClick={() => setSelectedBooking(booking)}
className="rounded-lg bg-blue-600 px-3 py-2 text-white font-semibold"
>
View
</button>

{Number(booking.pendingAmount || 0) > 0.009 ? (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs font-semibold text-amber-900">
    Remaining {rupees(booking.pendingAmount)}. Collect cash at yard or rider pays on Book EV. Ride end OTP only after ₹0 pending.
  </div>
) : (
<button
disabled={processingId === booking._id}
onClick={() => {

setSelectedEndRideBooking(booking);

setEnteredRideEndOTP("");

setEnteredEndHub(
booking.startHub || ""
);

setRideEndModalOpen(true);

}}
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
{processingId === booking._id ? "Ending..." : "Enter Ride End OTP"}
</button>
)}

</>

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

<div className="flex gap-3">

<button
type="button"
onClick={()=>{
  if (!selectedBooking) return;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>EVUDDY ${selectedBooking.bookingId}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{color:#18B368}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #e5e7eb;padding:10px 0}td:first-child{font-weight:700;width:42%}</style></head><body>
<p>EVUDDY · SMART ELECTRIC MOBILITY</p>
<h1>Booking summary</h1>
<table>
<tr><td>Booking ID</td><td>${selectedBooking.bookingId || "-"}</td></tr>
<tr><td>Rider</td><td>${selectedBooking.userName || "-"}</td></tr>
<tr><td>Phone</td><td>${selectedBooking.userPhone || "-"}</td></tr>
<tr><td>Vehicle</td><td>${selectedBooking.vehicleId || "-"}</td></tr>
<tr><td>Status</td><td>${selectedBooking.rideStatus || "-"}</td></tr>
<tr><td>Paid (received)</td><td>₹${money(selectedBooking.receivedAmount).toLocaleString("en-IN")}</td></tr>
<tr><td>Rent + GST collected</td><td>₹${bookingRentalCollected(selectedBooking).toLocaleString("en-IN")}</td></tr>
<tr><td>Pending</td><td>₹${money(selectedBooking.pendingAmount).toLocaleString("en-IN")}</td></tr>
<tr><td>Security deposit (held until return)</td><td>₹${money(selectedBooking.securityDeposit).toLocaleString("en-IN")}</td></tr>
</table>
<p style="margin-top:24px;font-size:12px;color:#64748b">Security deposit is held until the scooter is returned. Ride-end OTP is issued only after remaining fare is ₹0 and the rider swipes at the yard.</p>
</body></html>`;
  downloadHtmlFile(`EVUDDY-booking-${selectedBooking.bookingId}.html`, html);
}}
className="
rounded-xl
bg-emerald-600
px-4
py-2
font-bold
text-white
"

>

Download file

</button>

<button

onClick={()=>setSelectedBooking(null)}

className="
rounded-xl
bg-red-600
px-4
py-2
font-bold
text-white
"

>

Close

</button>

</div>

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
{selectedBooking.rentalMode === "Rent To Own" ? (
  <>
    <p><b>Certificate :</b> {selectedBooking.rtoCertificateNumber || "-"}</p>
    <p><b>Nominee :</b> {selectedBooking.rtoNomineeName || "-"} ({selectedBooking.rtoNomineeRelation || "-"})</p>
    <p><b>Father / guardian :</b> {selectedBooking.rtoGuardianName || "-"}</p>
    <p><b>Emergency phone :</b> {selectedBooking.rtoEmergencyPhone || "-"}</p>
    <p><b>RTO email :</b> {selectedBooking.rtoEmail || "-"}</p>
    <p><b>Occupation :</b> {selectedBooking.rtoOccupation || "-"}</p>
    <p><b>Permanent address :</b> {selectedBooking.rtoPermanentAddress || "-"}</p>
    <p><b>Tenure :</b> {selectedBooking.rentToOwnMonths || 18} months @ ₹{selectedBooking.rentToOwnDailyRate || 280}/day</p>
    <p><b>Installments paid :</b> {selectedBooking.rtoInstallmentsPaid || 0}</p>
    <p><b>Days remaining :</b> {selectedBooking.remainingRentToOwnDays || 0}</p>
    <p><b>Ownership :</b> {selectedBooking.ownershipTransferred ? "Transferred" : "In progress"}</p>
  </>
) : null}

<p><b>Start Hub :</b> {hubDisplay(selectedBooking)}</p>

<p><b>End Hub :</b> {selectedBooking.endHub || "-"}</p>

<p><b>Ride Status :</b> {selectedBooking.rideStatus}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">
Payment Details
</h3>

<p>
<b>Rental Amount :</b>
₹{money(selectedBooking.rateApplied || selectedBooking.totalAmount).toLocaleString("en-IN")}
</p>

<p>
<b>CGST 2.5% :</b>
₹{money(selectedBooking.cgstAmount).toLocaleString("en-IN")}
</p>

<p>
<b>SGST 2.5% :</b>
₹{money(selectedBooking.sgstAmount).toLocaleString("en-IN")}
</p>

<p>
<b>Security Deposit :</b>
₹{money(selectedBooking.securityDeposit).toLocaleString("en-IN")}
</p>

<p>
<b>Total Payable :</b>
₹{getBookingPayableAmount(selectedBooking).toLocaleString("en-IN")}
</p>

<hr className="my-3"/>

<p>
<b>Received :</b>
₹{Number(selectedBooking.receivedAmount || 0).toLocaleString("en-IN")}
</p>

<p>
<b>Pending :</b>
₹{Number(selectedBooking.pendingAmount || 0).toLocaleString("en-IN")}
</p>

<p>
<b>Payment Due :</b>
₹{Number(selectedBooking.paymentDue || 0).toLocaleString("en-IN")}
</p>

<hr className="my-3"/>

<div>

<b>Payment Status :</b>{" "}

{selectedBooking.paymentStatus === "Paid" && (
<StatusBadge status="active" label="Paid" />
)}

{selectedBooking.paymentStatus === "Partial" && (
<StatusBadge status="warning" label="Partial" />
)}

{selectedBooking.paymentStatus === "Pending" && (
<StatusBadge status="inactive" label="Pending" />
)}

</div>

<p>
<b>Payment Mode :</b>
{selectedBooking.paymentMode}
</p>

<p>
<b>Payment Date :</b>
{
selectedBooking.paymentDate
? new Date(selectedBooking.paymentDate).toLocaleString("en-IN")
: "-"
}
</p>

<p>
<b>Payment Verified :</b>
{
selectedBooking.paymentVerifiedAt
? new Date(selectedBooking.paymentVerifiedAt).toLocaleString("en-IN")
: "-"
}
</p>

<hr className="my-3"/>

<p>
<b>Invoice Generated :</b>{" "}
{selectedBooking.invoiceGenerated ? "Yes" : "No"}
</p>

<p>
<b>Invoice Number :</b>{" "}
{selectedBooking.invoiceNumber || "-"}
</p>

<hr className="my-3"/>

<p>
<b>Razorpay Order ID :</b>
<br />
<span className="text-sm break-all">
{selectedBooking.razorpayOrderId || "-"}
</span>
</p>

<p className="mt-3">
<b>Razorpay Payment ID :</b>
<br />
<span className="text-sm break-all">
{selectedBooking.razorpayPaymentId || "-"}
</span>
</p>

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
  <b>Pickup OTP :</b>{" "}
  {generatedPickupOTP[selectedBooking._id] ||
    selectedBooking.pickupOTP ||
    (selectedBooking.pickupOTPGenerated
      ? "Generated — use Show Pickup OTP on the row"
      : Number(selectedBooking.receivedAmount || 0) > 0
      ? "Ready — use Show Pickup OTP on the row"
      : "After first payment")}
</p>

<p>
  <b>Pickup Verified :</b>{" "}
  {selectedBooking.pickupOTPVerifiedAt
    ? new Date(selectedBooking.pickupOTPVerifiedAt).toLocaleString("en-IN")
    : "-"}
</p>

<hr className="my-3"/>

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

<hr className="my-4"/>

<p>
<b>Total Ride Minutes :</b>{" "}
{selectedBooking.totalRideMinutes || 0}
</p>

<p>
<b>Ride Distance :</b>{" "}
{selectedBooking.rideDistanceKm || 0} km
</p>

<p>
<b>Start Odometer :</b>{" "}
{selectedBooking.startOdometer || 0}
</p>

<p>
<b>End Odometer :</b>{" "}
{selectedBooking.endOdometer || 0}
</p>

<p>
<b>Pickup City :</b>{" "}
{selectedBooking.pickupCity || "-"}
</p>

<p>
<b>Current Hub :</b>{" "}
{selectedBooking.currentHub || "-"}
</p>

<p>
<b>End Hub :</b>{" "}
{selectedBooking.endHub || "-"}
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

{otpModalOpen && selectedRideBooking && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

<div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

<h2 className="text-2xl font-bold text-[#0A1134]">
Verify Pickup OTP
</h2>

<p className="mt-2 text-gray-500">
Booking :
<strong>
{" "}
{selectedRideBooking.bookingId}
</strong>
</p>

<div className="mt-6">

<label className="mb-2 block font-semibold">
Pickup OTP
</label>

<input
type="text"
value={enteredPickupOTP}
onChange={(e)=>
setEnteredPickupOTP(e.target.value)
}
placeholder="Enter Pickup OTP"
className="
w-full
rounded-xl
border
p-4
outline-none
focus:ring-2
focus:ring-pink-400
"
/>

</div>

<div className="mt-8 flex justify-end gap-3">

<button
onClick={()=>{
setOtpModalOpen(false);
setSelectedRideBooking(null);
}}
className="
rounded-xl
bg-gray-200
px-5
py-3
font-semibold
"
>

Cancel

</button>

<button
onClick={async()=>{

setOtpModalOpen(false);

await startRide(
selectedRideBooking,
enteredPickupOTP
);

}}
className="
rounded-xl
bg-green-600
px-5
py-3
font-semibold
text-white
"
>

Verify & Start Ride

</button>

</div>

</div>

</div>

)}

{rideEndModalOpen && selectedEndRideBooking && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

<div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

<h2 className="text-2xl font-bold text-[#0A1134]">
Complete Ride
</h2>

<p className="mt-2 text-gray-500">
Booking :
<strong>
{" "}
{selectedEndRideBooking.bookingId}
</strong>
</p>
{Number(selectedEndRideBooking.pendingAmount || 0) > 0 ? (
  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    Remaining due {rupees(selectedEndRideBooking.pendingAmount)}. Ride end OTP is issued only after this is paid on Book EV.
  </p>
) : null}

<div className="mt-6">

<label className="mb-2 block font-semibold">
Ride End OTP
</label>

<input
type="text"
value={enteredRideEndOTP}
onChange={(e)=>
setEnteredRideEndOTP(e.target.value)
}
placeholder="Enter Ride End OTP"
className="
w-full
rounded-xl
border
p-4
outline-none
focus:ring-2
focus:ring-pink-400
"
/>

</div>

<div className="mt-6">

<label className="mb-2 block font-semibold">
End Hub
</label>

<input
type="text"
value={enteredEndHub}
onChange={(e)=>
setEnteredEndHub(e.target.value)
}
placeholder="Enter End Hub"
className="
w-full
rounded-xl
border
p-4
outline-none
focus:ring-2
focus:ring-pink-400
"
/>

</div>

<div className="mt-8 flex justify-end gap-3">

<button
onClick={()=>{
setRideEndModalOpen(false);
setSelectedEndRideBooking(null);
}}
className="
rounded-xl
bg-gray-200
px-5
py-3
font-semibold
"
>
Cancel
</button>

<button
onClick={async()=>{

setRideEndModalOpen(false);

await endRide(
selectedEndRideBooking,
enteredRideEndOTP,
enteredEndHub
);

}}
className="
rounded-xl
bg-orange-600
px-5
py-3
font-semibold
text-white
"
>

Verify & Complete Ride

</button>

</div>

</div>

</div>

)}

</PageContainer>
);
}