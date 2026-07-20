"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
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

useEffect(() => {

const loadData = async () => {

const ticketRes = await fetch("/api/tickets");
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

  const ticketRes = await fetch("/api/tickets");

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

const openTickets=tickets.filter(
(ticket)=>ticket.status==="OPEN"
).length;

const inProgressTickets=tickets.filter(
(ticket)=>ticket.status==="IN-PROGRESS"
).length;

const resolvedTickets=tickets.filter(
(ticket)=>ticket.status==="RESOLVED"
).length;

const pendingRefunds=refunds.filter(
(refund)=>refund.refundStatus==="PROCESSING"
).length;

const criticalTickets=tickets.filter(
(ticket)=>ticket.priority==="Critical"
).length;

const totalRefundAmount=refunds.reduce(
(total,refund)=>total+Number(refund.amount||0),
0
);

const closedTickets=tickets.filter(
(ticket)=>ticket.status==="CLOSED"
).length;

return(

<PageContainer>

<DashboardHeader

title="Support Dashboard"

subtitle="Manage customer support tickets, refunds and service operations."

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

/>

<DashboardCard

title="Ticket Management"

subtitle="Live Support Tickets"

>

  <div className="mb-6 flex gap-4 justify-between">

    <input
type="text"
placeholder="Search Ticket, Booking, Vehicle..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-3"
/>

<select

value={statusFilter}

onChange={(e)=>setStatusFilter(e.target.value)}

className="rounded-xl border border-gray-200 px-4 py-3"

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

await fetch(`/api/tickets/${ticket._id}`,{

method:"PATCH",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

status:e.target.value

})

});

const ticketRes = await fetch("/api/tickets");

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
className="rounded-lg bg-blue-50 px-4 py-2 font-bold text-blue-600"
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

const ticketRes = await fetch("/api/tickets");
const ticketData = await ticketRes.json();

setTickets(ticketData.data || []);

if (selectedTicket?._id === ticket._id) {
  setSelectedTicket(null);
}

}}
className="rounded-lg bg-red-50 px-4 py-2 font-bold text-red-600"
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

<div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">

<div>

<b>Priority</b>

<p>{selectedTicket.priority}</p>

</div>

<div>

<b>Status</b>

<p>{selectedTicket.status}</p>

</div>

<div>

<b>Assigned</b>

<p>{selectedTicket.assignedTo}</p>

</div>

<div>

<b>Vehicle</b>

<p>{selectedTicket.vehicleId || "-"}</p>

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

{refund.refundStatus==="SUCCESS"&&(
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

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

<div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">

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
className="rounded-xl border px-6 py-3"
>
Cancel
</button>

<button
onClick={saveTicket}
className="rounded-xl bg-[#FF165E] px-8 py-3 font-bold text-white"
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
