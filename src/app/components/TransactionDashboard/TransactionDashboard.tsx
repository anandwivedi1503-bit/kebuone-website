"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function TransactionDashboard(){

const [transactions,setTransactions]=useState<any[]>([]);
const [search,setSearch]=useState("");

useEffect(()=>{

fetchTransactions();

},[]);

const fetchTransactions=async()=>{

const res=await fetch("/api/transactions");

const data=await res.json();

if(data.success){

setTransactions(data.data);

}

};

const filteredTransactions=transactions.filter((item)=>

item.transactionId
?.toLowerCase()
.includes(search.toLowerCase())

);

const totalRevenue=transactions.reduce(

(sum,item)=>sum+(item.amount||0),

0

);

const totalGST=transactions.reduce(

(sum,item)=>sum+(item.gstAmount||0),

0

);

const successfulPayments=transactions.filter(

(item)=>item.status==="Success"

).length;

const pendingPayments=transactions.filter(

(item)=>item.status!=="Success"

).length;

return(

<PageContainer>

<DashboardHeader

title="Transaction Dashboard"

subtitle="Monitor all payments, wallet transactions and ride collections."

/>

<KPIGrid>

<KPICard
title="Transactions"
value={transactions.length}
subtitle="Total Records"
icon="💳"
color="pink"
/>

<KPICard
title="Revenue"
value={`₹${totalRevenue}`}
subtitle="Collected"
icon="💰"
color="green"
/>

<KPICard
title="GST"
value={`₹${totalGST}`}
subtitle="Collected"
icon="🧾"
color="blue"
/>

<KPICard
title="Successful"
value={successfulPayments}
subtitle={`${pendingPayments} Pending`}
icon="✅"
color="yellow"
/>

</KPIGrid>

<SectionHeader

title="Payment Transactions"

subtitle="Search and monitor all transaction records."

/>

<div className="mb-8">

<input

type="text"

placeholder="Search Transaction ID..."

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

title="Transactions"

subtitle="Live Payment Records"

>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Txn ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Booking ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
User
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Amount
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
GST
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Method
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

{filteredTransactions.map((item)=>(

<tr
key={item._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{item.transactionId}
</td>

<td className="px-6 py-5">
{item.bookingId}
</td>

<td className="px-6 py-5">
{item.userName}
</td>

<td className="px-6 py-5 text-center font-bold">
₹{item.amount}
</td>

<td className="px-6 py-5 text-center">
₹{item.gstAmount}
</td>

<td className="px-6 py-5 text-center">
{item.paymentMethod}
</td>

<td className="px-6 py-5 text-center">

{item.status==="Success"&&(
<StatusBadge status="active"/>
)}

{item.status==="Pending"&&(
<StatusBadge status="warning"/>
)}

{item.status==="Failed"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center">
{new Date(item.createdAt).toLocaleDateString()}
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