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

useEffect(()=>{

fetch("/api/tickets")
.then((res)=>res.json())
.then((data)=>setTickets(data.data||[]));

fetch("/api/refunds")
.then((res)=>res.json())
.then((data)=>setRefunds(data.data||[]));

},[]);

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
title="In Progress"
value={inProgressTickets}
subtitle="Working"
icon="🛠️"
color="blue"
/>

<KPICard
title="Resolved"
value={resolvedTickets}
subtitle="Completed"
icon="✅"
color="green"
/>

<KPICard
title="Refunds"
value={pendingRefunds}
subtitle="Processing"
icon="💳"
color="red"
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

</tr>

</thead>

<tbody>

{tickets.map((ticket)=>(

<tr
key={ticket._id}
className="
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

{ticket.status==="OPEN"&&(
<StatusBadge status="warning"/>
)}

{ticket.status==="IN-PROGRESS"&&(
<StatusBadge status="active"/>
)}

{ticket.status==="RESOLVED"&&(
<StatusBadge status="active"/>
)}

</td>

<td className="px-6 py-5 text-center">
{new Date(ticket.createdAt).toLocaleDateString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

<SectionHeader

title="Ticket Details"

subtitle="Support investigation summary."

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

User was unable to unlock vehicle at Railway Hub.

</p>

</div>

<div className="rounded-3xl border border-green-100 bg-green-50/40 p-8">

<p className="text-sm font-semibold text-gray-500 mb-3">
Resolution Notes
</p>

<p className="text-[#0A1134] font-semibold leading-7">

Assigned to technical team for lock diagnostics.

</p>

</div>

</div>

</DashboardCard>

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

</PageContainer>

);

}