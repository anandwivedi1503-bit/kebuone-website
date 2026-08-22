"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function SupportDashboard(){

const [tickets,setTickets]=useState<any[]>([]);
const [refunds,setRefunds]=useState<any[]>([]);
const [selectedTicket,setSelectedTicket]=useState<any>(null);
const [editingTicket,setEditingTicket]=useState<any>(null);

const [showEditModal,setShowEditModal]=useState(false);
const [statusFilter,setStatusFilter]=useState("ALL");
const [search,setSearch]=useState("");
const [ticketQueue,setTicketQueue]=useState<"riders" | "website">("riders");

const isWebsiteEnquiry = (ticket: { bookingId?: string; ticketSource?: string }) =>
  !String(ticket.bookingId || "").trim() || ticket.ticketSource === "Website";

const queueTickets = tickets.filter((ticket) =>
  ticketQueue === "website" ? isWebsiteEnquiry(ticket) : !isWebsiteEnquiry(ticket)
);

useEffect(() => {

const loadData = async () => {

const ticketRes = await fetch("/api/tickets?limit=500");
const ticketData = await ticketRes.json();
setTickets(ticketData.data || []);

const refundRes = await fetch("/api/refunds");
const refundData = await refundRes.json();
setRefunds(refundData.data || []);

};

loadData();

const timer = setInterval(loadData,10000);

return ()=>clearInterval(timer);

},[]);

const saveTicket = async () => {

if(!editingTicket) return;

const res = await fetch(
`/api/tickets/${editingTicket._id}`,
{
method:"PATCH",
headers:{
"Content-Type":"application/json",
},
body:JSON.stringify(editingTicket),
}
);

const data = await res.json();

if (data.success) {

  const ticketRes = await fetch("/api/tickets?limit=500");

  const ticketData = await ticketRes.json();

  setTickets(ticketData.data || []);

  const latest = (ticketData.data || []).find(
    (t: any) => t._id === editingTicket._id
  );

  setSelectedTicket(latest || null);

  setShowEditModal(false);

  setEditingTicket(null);

}

};

const openTickets=queueTickets.filter(
(ticket)=>ticket.status==="OPEN"
).length;

const inProgressTickets=queueTickets.filter(
(ticket)=>ticket.status==="IN-PROGRESS"
).length;

const resolvedTickets=queueTickets.filter(
(ticket)=>ticket.status==="RESOLVED"
).length;

const pendingRefunds=refunds.filter(
(refund)=>refund.refundStatus==="PROCESSING"
).length;

const criticalTickets=queueTickets.filter(
(ticket)=>ticket.priority==="Critical"
).length;

const totalRefundAmount=refunds.reduce(
(total,refund)=>total+Number(refund.amount||0),
0
);

const closedTickets=queueTickets.filter(
(ticket)=>ticket.status==="CLOSED"
).length;

return(

<PageContainer>

<DashboardHeader

title="Support Dashboard"

subtitle="Rider booking complaints and website Contact Us are stored separately in this CRM (same tickets database, different queue)."

/>

<KPIGrid>

<KPICard
title="Open Tickets"
value={openTickets}
subtitle="Needs Attention"
icon="🎫"
color="yellow"
/>

<KPICard
title="Critical"
value={criticalTickets}
subtitle="Highest Priority"
icon="🚨"
color="red"
/>

<KPICard
title="Resolved"
value={resolvedTickets}
subtitle="Completed"
icon="✅"
color="green"
/>

<KPICard
title="Closed"
value={closedTickets}
subtitle="Finished"
icon="📦"
color="blue"
/>

<KPICard
title="Refunds"
value={pendingRefunds}
subtitle="Processing"
icon="💳"
color="yellow"
/>

<KPICard
title="Refund Amount"
value={`₹${totalRefundAmount}`}
subtitle="Total"
icon="💰"
color="green"
/>

</KPIGrid>

<SectionHeader

title="Support Tickets"

subtitle="Monitor and manage customer issues."

rightContent={
  <DashboardActions
    filename="SupportTickets.csv"
    onRefresh={() => window.location.reload()}
    rows={queueTickets.map((ticket) => ({
      TicketID: ticket.ticketId,
      Source: ticket.ticketSource || (ticket.bookingId ? "Booking" : "Website"),
      BookingID: ticket.bookingId || "",
      User: ticket.userId,
      Category: ticket.category,
      Priority: ticket.priority,
      Status: ticket.status,
      AssignedTo: ticket.assignedTo,
    }))}
  />
}

/>

<DashboardCard

title="Ticket Management"

subtitle="Live Support Tickets"

>

  <div className="mb-4 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => setTicketQueue("riders")}
      className={`rounded-full px-4 py-2 text-sm font-bold ${
        ticketQueue === "riders" ? "bg-[#18B368] text-white" : "bg-white text-slate-600"
      }`}
    >
      Rider complaints
    </button>
    <button
      type="button"
      onClick={() => setTicketQueue("website")}
      className={`rounded-full px-4 py-2 text-sm font-bold ${
        ticketQueue === "website" ? "bg-[#0F172A] text-white" : "bg-white text-slate-600"
      }`}
    >
      Contact Us / website
    </button>
  </div>

  <div
className="
mb-8
flex
flex-col
lg:flex-row
gap-4
justify-between
items-stretch
lg:items-center
"
>

    <input
type="text"
placeholder="Search Ticket, Booking, Vehicle..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="
w-full
lg:max-w-lg
rounded-2xl
border
border-slate-200
bg-white/90
backdrop-blur-xl
px-5
py-3.5
shadow-sm
transition-all
duration-300
focus:border-[#00C853]
focus:ring-4
focus:ring-[#00C853]/10
focus:outline-none
"
/>

<select

value={statusFilter}

onChange={(e)=>setStatusFilter(e.target.value)}

className="
rounded-2xl
border
border-slate-200
bg-white
px-5
py-3.5
shadow-sm
transition-all
duration-300
focus:border-[#00C853]
focus:ring-4
focus:ring-[#00C853]/10
focus:outline-none
"

>

<option value="ALL">All</option>

<option value="OPEN">Open</option>

<option value="IN-PROGRESS">In Progress</option>

<option value="RESOLVED">Resolved</option>

<option value="CLOSED">Closed</option>

</select>

</div>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Ticket ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Source
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Booking
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
User ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Trip ID
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Category
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Priority
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Assigned To
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Created
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Action
</th>

</tr>

</thead>

<tbody>

  {queueTickets
.filter((ticket)=>{

const keyword = search.toLowerCase();

const matchesSearch =
ticket.ticketId?.toLowerCase().includes(keyword) ||
ticket.userId?.toLowerCase().includes(keyword) ||
ticket.bookingId?.toLowerCase().includes(keyword) ||
ticket.vehicleId?.toLowerCase().includes(keyword) ||
ticket.category?.toLowerCase().includes(keyword);

const matchesStatus =
statusFilter==="ALL" ||
ticket.status===statusFilter;

return matchesSearch && matchesStatus;

}).length===0 && (

<tr>

<td
colSpan={11}
className="py-16 text-center"
>

<div>

<div className="text-5xl mb-4">
🎫
</div>

<h3 className="text-xl font-bold text-slate-700">
No Support Tickets Found
</h3>

<p className="mt-2 text-gray-500">
New customer issues will automatically appear here.
</p>

</div>

</td>

</tr>

)}

{tickets
.filter((ticket)=>{

const keyword = search.toLowerCase();

const matchesSearch =
ticket.ticketId?.toLowerCase().includes(keyword) ||
ticket.userId?.toLowerCase().includes(keyword) ||
ticket.bookingId?.toLowerCase().includes(keyword) ||
ticket.vehicleId?.toLowerCase().includes(keyword) ||
ticket.category?.toLowerCase().includes(keyword);

const matchesStatus =
statusFilter==="ALL" ||
ticket.status===statusFilter;

return matchesSearch && matchesStatus;

})

.map((ticket)=>(

<tr
key={ticket._id}
onClick={()=>setSelectedTicket(ticket)}
className="
cursor-pointer
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{ticket.ticketId}
</td>

<td className="px-6 py-5 text-sm">
{ticket.ticketSource || (ticket.bookingId ? "Mobile App" : "Website")}
</td>

<td className="px-6 py-5 text-sm">
{ticket.bookingId || "—"}
</td>

<td className="px-6 py-5">
{ticket.userId}
</td>

<td className="px-6 py-5">
{ticket.tripId}
</td>

<td className="px-6 py-5 text-center">
{ticket.category}
</td>

<td className="px-6 py-5 text-center font-semibold">
{ticket.priority}
</td>

<td className="px-6 py-5 text-center">
{ticket.assignedTo}
</td>

<td className="px-6 py-5 text-center">

<select

onClick={(e)=>e.stopPropagation()}

value={ticket.status}

onChange={async(e)=>{
  if(
!confirm(
"Are you sure you want to change this ticket status?"
)
){
return;
}

await fetch(`/api/tickets/${ticket._id}`,{

method:"PATCH",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

status:e.target.value

})

});

 const ticketRes = await fetch("/api/tickets?limit=500");
const ticketData = await ticketRes.json();

setTickets(ticketData.data || []);

if (
  selectedTicket &&
  selectedTicket._id === ticket._id
) {
  const latest = (ticketData.data || []).find(
    (t: any) => t._id === ticket._id
  );

  setSelectedTicket(latest || null);
}

}}

className="rounded-lg border border-gray-200 px-3 py-2"

>

<option value="OPEN">OPEN</option>

<option value="IN-PROGRESS">IN-PROGRESS</option>

<option value="RESOLVED">RESOLVED</option>

<option value="CLOSED">CLOSED</option>

</select>

</td>

<td className="px-6 py-5 text-center">
{new Date(ticket.createdAt).toLocaleDateString()}
</td>

<td className="px-6 py-5">
<div className="flex justify-center gap-2">

<button
onClick={(e)=>{
e.stopPropagation();
setEditingTicket({...ticket});
setShowEditModal(true);
}}
className="
rounded-xl
bg-gradient-to-r
from-blue-500
to-blue-600
px-5
py-2.5
font-semibold
text-white
shadow-md
transition-all
duration-300
hover:scale-[1.04]
hover:shadow-xl
"
>
Edit
</button>

<button
onClick={async(e)=>{
e.stopPropagation();

if(!confirm("Delete this ticket?")) return;

await fetch(`/api/tickets/${ticket._id}`,{
method:"DELETE",
});

const ticketRes = await fetch("/api/tickets?limit=500");
const ticketData = await ticketRes.json();

setTickets(ticketData.data || []);

if (selectedTicket?._id === ticket._id) {
  setSelectedTicket(null);
}

}}
className="
rounded-xl
bg-gradient-to-r
from-red-500
to-red-600
px-5
py-2.5
font-semibold
text-white
shadow-md
transition-all
duration-300
hover:scale-[1.04]
hover:shadow-xl
"
>
Delete
</button>

</div>
</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

{selectedTicket && (

<>

<SectionHeader

title="Ticket Details"

subtitle="Live selected ticket."

/>

<DashboardCard

title="Issue Details"

subtitle="Selected Ticket"

>

<div className="grid md:grid-cols-2 gap-8">

<div className="rounded-3xl border border-pink-100 bg-pink-50/40 p-8">

<p className="text-sm font-semibold text-gray-500 mb-3">
Description
</p>

<p className="text-[#0A1134] font-semibold leading-7">
{selectedTicket.description}
</p>

</div>

<div className="rounded-3xl border border-green-100 bg-green-50/40 p-8">

<p className="text-sm font-semibold text-gray-500 mb-3">
Admin Remarks
</p>

<p className="text-[#0A1134] font-semibold leading-7">

{selectedTicket.adminRemarks || "No remarks added yet."}

</p>

</div>

</div>

<div
className="
mt-10
grid
grid-cols-2
xl:grid-cols-4
gap-5
"
>

<div
className="
rounded-2xl
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-5
shadow-sm
"
>
<p className="text-xs uppercase tracking-wide text-gray-500">
Priority
</p>

<h3 className="mt-2 text-lg font-bold text-[#07111F]">
{selectedTicket.priority}
</h3>
</div>

<div
className="
rounded-2xl
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-5
shadow-sm
"
>
<p className="text-xs uppercase tracking-wide text-gray-500">
Status
</p>

<h3 className="mt-2 text-lg font-bold text-[#07111F]">
{selectedTicket.status}
</h3>
</div>

<div
className="
rounded-2xl
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-5
shadow-sm
"
>
<p className="text-xs uppercase tracking-wide text-gray-500">
Assigned To
</p>

<h3 className="mt-2 text-lg font-bold text-[#07111F]">
{selectedTicket.assignedTo}
</h3>
</div>

<div
className="
rounded-2xl
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-5
shadow-sm
"
>
<p className="text-xs uppercase tracking-wide text-gray-500">
Vehicle
</p>

<h3 className="mt-2 text-lg font-bold text-[#07111F]">
{selectedTicket.vehicleId || "-"}
</h3>
</div>

</div>

</DashboardCard>

</>

)}

<SectionHeader

title="Refund Requests"

subtitle="Monitor refund processing and payment gateway status."

/>

<DashboardCard

title="Refund Management"

subtitle="Live Refund Records"

>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Refund ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Ticket ID
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Amount
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Gateway Ref
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

</tr>

</thead>

<tbody>

{refunds.map((refund)=>(

<tr
key={refund._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{refund.refundId}
</td>

<td className="px-6 py-5">
{refund.ticketId}
</td>

<td className="px-6 py-5 text-center font-bold">
₹{refund.amount}
</td>

<td className="px-6 py-5 text-center">
{refund.gatewayTxnId}
</td>

<td className="px-6 py-5 text-center">

{refund.refundStatus==="REFUNDED"&&(
<StatusBadge status="active"/>
)}

{refund.refundStatus==="PROCESSING"&&(
<StatusBadge status="warning"/>
)}

{refund.refundStatus==="REJECTED"&&(
<StatusBadge status="inactive"/>
)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

{showEditModal && editingTicket && (

<div
className="
fixed
inset-0
z-[100]
flex
items-center
justify-center
bg-black/60
backdrop-blur-md
px-4
py-6
lg:pl-[340px]
"
>

<div
className="
relative
w-full
max-w-3xl
max-h-[90vh]
overflow-y-auto
rounded-[32px]
bg-white
border
border-slate-200
shadow-[0_40px_120px_rgba(0,0,0,0.25)]
p-6
md:p-8
"
>

<h2 className="mb-6 text-3xl font-black text-[#0A1134]">
Edit Support Ticket
</h2>

<div className="grid gap-5 md:grid-cols-2">

<input
value={editingTicket.assignedTo || ""}
onChange={(e)=>
setEditingTicket({
...editingTicket,
assignedTo:e.target.value,
})
}
placeholder="Assigned To"
className="rounded-xl border border-gray-200 px-4 py-3"
/>

<input
value={editingTicket.adminRemarks || ""}
onChange={(e)=>
setEditingTicket({
...editingTicket,
adminRemarks:e.target.value,
})
}
placeholder="Admin Remarks"
className="rounded-xl border border-gray-200 px-4 py-3"
/>

<select
value={editingTicket.priority}
onChange={(e)=>
setEditingTicket({
...editingTicket,
priority:e.target.value,
})
}
className="rounded-xl border border-gray-200 px-4 py-3"
>

<option>Low</option>
<option>Medium</option>
<option>High</option>
<option>Critical</option>

</select>

<select
value={editingTicket.status}
onChange={(e)=>
setEditingTicket({
...editingTicket,
status:e.target.value,
})
}
className="rounded-xl border border-gray-200 px-4 py-3"
>

<option value="OPEN">OPEN</option>
<option value="IN-PROGRESS">IN-PROGRESS</option>
<option value="RESOLVED">RESOLVED</option>
<option value="CLOSED">CLOSED</option>

</select>

</div>

<div className="mt-8 flex justify-end gap-4">

<button
onClick={()=>{
setShowEditModal(false);
setEditingTicket(null);
}}
className="
rounded-xl
border
border-slate-300
bg-white
px-6
py-3
font-semibold
transition-all
duration-300
hover:bg-slate-100
"
>
Cancel
</button>

<button
onClick={saveTicket}
className="
rounded-xl
bg-gradient-to-r
from-[#00C853]
to-[#00E676]
px-8
py-3
font-bold
text-[#07111F]
shadow-lg
transition-all
duration-300
hover:scale-[1.03]
hover:shadow-2xl
"
>
Save Changes
</button>

</div>

</div>
</div>

)}

</PageContainer>
 );
  }
