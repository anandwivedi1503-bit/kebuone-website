"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function RevenueDashboard(){

const [transactions,setTransactions]=useState<any[]>([]);

useEffect(()=>{

fetch("/api/transactions")

.then((res)=>res.json())

.then((data)=>{

setTransactions(data.data||[]);

});

},[]);

const totalRevenue=transactions.reduce(
(sum,t)=>sum+(t.amount||0),
0
);

const totalGST=transactions.reduce(
(sum,t)=>sum+(t.gstAmount||0),
0
);

const pendingPayments=transactions
.filter((t)=>t.status==="Pending")
.reduce(
(sum,t)=>sum+(t.amount||0),
0
);

const successfulPayments=transactions.filter(
(t)=>t.status==="Success"
).length;

return(

<PageContainer>

<DashboardHeader

title="Revenue Dashboard"

subtitle="Monitor revenue, GST collection, payment performance and financial reports."

/>

<KPIGrid>

<KPICard
title="Revenue"
value={`₹${totalRevenue}`}
subtitle="Today's Revenue"
icon="💰"
color="green"
/>

<KPICard
title="Successful"
value={successfulPayments}
subtitle="Payments"
icon="✅"
color="blue"
/>

<KPICard
title="GST"
value={`₹${totalGST}`}
subtitle="Collected"
icon="🧾"
color="yellow"
/>

<KPICard
title="Pending"
value={`₹${pendingPayments}`}
subtitle="Awaiting"
icon="⏳"
color="pink"
/>

<KPICard
title="Refunds"
value="₹0"
subtitle="Processed"
icon="💸"
color="red"
/>

</KPIGrid>

<SectionHeader

title="Invoice Records"

subtitle="Live invoice records from the revenue system."

/>

<DashboardCard

title="Invoices"

subtitle="GST Invoice History"

>
  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Invoice ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Trip ID
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Base Fare
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
GST
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
CGST
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
SGST
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Total Paid
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Date
</th>

</tr>

</thead>

<tbody>

<tr className="border-b border-pink-50 hover:bg-pink-50/40 transition">

<td className="px-6 py-5 font-semibold">
KEBU/25-26/001
</td>

<td className="px-6 py-5">
TRIP-2025-001
</td>

<td className="px-6 py-5 text-center">
₹48
</td>

<td className="px-6 py-5 text-center">
5%
</td>

<td className="px-6 py-5 text-center">
₹1.20
</td>

<td className="px-6 py-5 text-center">
₹1.20
</td>

<td className="px-6 py-5 text-center font-bold text-green-600">
₹50.40
</td>

<td className="px-6 py-5 text-center">

<StatusBadge status="active"/>

</td>

<td className="px-6 py-5 text-center">
08-Jun-2026
</td>

</tr>

<tr className="border-b border-pink-50 hover:bg-pink-50/40 transition">

<td className="px-6 py-5 font-semibold">
KEBU/25-26/002
</td>

<td className="px-6 py-5">
TRIP-2025-002
</td>

<td className="px-6 py-5 text-center">
₹60
</td>

<td className="px-6 py-5 text-center">
5%
</td>

<td className="px-6 py-5 text-center">
₹1.50
</td>

<td className="px-6 py-5 text-center">
₹1.50
</td>

<td className="px-6 py-5 text-center font-bold text-green-600">
₹63
</td>

<td className="px-6 py-5 text-center">

<StatusBadge status="active"/>

</td>

<td className="px-6 py-5 text-center">
08-Jun-2026
</td>

</tr>

<tr className="hover:bg-pink-50/40 transition">

<td className="px-6 py-5 font-semibold">
KEBU/25-26/003
</td>

<td className="px-6 py-5">
TRIP-2025-003
</td>

<td className="px-6 py-5 text-center">
₹55
</td>

<td className="px-6 py-5 text-center">
5%
</td>

<td className="px-6 py-5 text-center">
₹1.37
</td>

<td className="px-6 py-5 text-center">
₹1.38
</td>

<td className="px-6 py-5 text-center font-bold text-yellow-600">
₹57.75
</td>

<td className="px-6 py-5 text-center">

<StatusBadge status="warning"/>

</td>

<td className="px-6 py-5 text-center">
08-Jun-2026
</td>

</tr>

</tbody>

</table>

</div>

</DashboardCard>

<SectionHeader
title="Payment Transactions"
subtitle="Live payment transactions from MongoDB."
/>

<DashboardCard
title="Transactions"
subtitle="Payment Gateway Records"
>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Txn ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
User
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Amount
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Method
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

</tr>

</thead>

<tbody>

{transactions.length===0&&(

<tr>

<td
colSpan={5}
className="px-6 py-10 text-center text-gray-500"
>

No Transactions Found

</td>

</tr>

)}

{transactions.map((txn)=>(

<tr
key={txn._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{txn.transactionId}
</td>

<td className="px-6 py-5">
{txn.userName}
</td>

<td className="px-6 py-5 text-center font-bold">
₹{txn.amount}
</td>

<td className="px-6 py-5 text-center">
{txn.paymentMethod}
</td>

<td className="px-6 py-5 text-center">

{txn.status==="Success"&&(
<StatusBadge status="active"/>
)}

{txn.status==="Pending"&&(
<StatusBadge status="warning"/>
)}

{txn.status==="Failed"&&(
<StatusBadge status="inactive"/>
)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

<SectionHeader

title="GST Ledger"

subtitle="Tax collection summary."

/>

<KPIGrid>

<KPICard
title="CGST"
value={`₹${(totalGST/2).toFixed(2)}`}
subtitle="Collected"
icon="📘"
color="blue"
/>

<KPICard
title="SGST"
value={`₹${(totalGST/2).toFixed(2)}`}
subtitle="Collected"
icon="📗"
color="green"
/>

<KPICard
title="Total GST"
value={`₹${totalGST.toFixed(2)}`}
subtitle="Overall"
icon="🧾"
color="yellow"
/>

</KPIGrid>

<SectionHeader

title="Revenue Analytics"

subtitle="Revenue trends and refund activity."

/>

<DashboardCard
title="Revenue Trend"
subtitle="Analytics Overview"
>

<div className="h-[400px] rounded-[28px] bg-gradient-to-br from-pink-50 to-gray-50 border border-pink-100 flex items-center justify-center">

<div className="text-center">

<div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto mb-6 text-5xl">

📈

</div>

<h3 className="text-3xl font-black text-[#0A1134]">

Revenue Analytics Chart

</h3>

<p className="mt-4 text-gray-500">

Daily • Weekly • Monthly Revenue Trends

</p>

</div>

</div>

</DashboardCard>

<SectionHeader

title="Refund Logs"

subtitle="Track processed refund requests."

/>

<DashboardCard

title="Refund History"

subtitle="Refund Processing"

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
Gateway Txn
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

</tr>

</thead>

<tbody>

<tr className="border-b border-pink-50 hover:bg-pink-50/40 transition">

<td className="px-6 py-5 font-semibold">
REF-001
</td>

<td className="px-6 py-5">
TKT-021
</td>

<td className="px-6 py-5 text-center">
₹120
</td>

<td className="px-6 py-5 text-center">
PGX987654
</td>

<td className="px-6 py-5 text-center">

<StatusBadge status="active"/>

</td>

</tr>

<tr className="hover:bg-pink-50/40 transition">

<td className="px-6 py-5 font-semibold">
REF-002
</td>

<td className="px-6 py-5">
TKT-034
</td>

<td className="px-6 py-5 text-center">
₹80
</td>

<td className="px-6 py-5 text-center">
PGX123456
</td>

<td className="px-6 py-5 text-center">

<StatusBadge status="warning"/>

</td>

</tr>

</tbody>

</table>

</div>

</DashboardCard>

</PageContainer>

);

}