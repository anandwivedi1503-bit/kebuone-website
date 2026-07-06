"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function RefundDashboard(){

const [refunds,setRefunds]=useState<any[]>([]);

useEffect(()=>{

fetch("/api/refunds")

.then((res)=>res.json())

.then((data)=>{

setRefunds(data.data||[]);

});

},[]);

const processingRefunds=refunds.filter(
(r)=>r.refundStatus==="PROCESSING"
).length;

const successRefunds=refunds.filter(
(r)=>r.refundStatus==="SUCCESS"
).length;

const rejectedRefunds=refunds.filter(
(r)=>r.refundStatus==="REJECTED"
).length;

const totalRefundAmount=refunds.reduce(
(sum,r)=>sum+(r.amount||0),
0
);

const approveRefund=async(id:string)=>{

await fetch(`/api/refunds/${id}`,{

method:"PATCH",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

refundStatus:"SUCCESS",

}),

});

location.reload();

};

const rejectRefund=async(id:string)=>{

await fetch(`/api/refunds/${id}`,{

method:"PATCH",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

refundStatus:"REJECTED",

}),

});

location.reload();

};

return(

<PageContainer>

<DashboardHeader

title="Refund Dashboard"

subtitle="Manage, approve and monitor customer refund requests."

/>

<KPIGrid>

<KPICard
title="Refund Amount"
value={`₹${totalRefundAmount}`}
subtitle="Total"
icon="💸"
color="pink"
/>

<KPICard
title="Processing"
value={processingRefunds}
subtitle="Pending"
icon="⏳"
color="yellow"
/>

<KPICard
title="Success"
value={successRefunds}
subtitle="Completed"
icon="✅"
color="green"
/>

<KPICard
title="Rejected"
value={rejectedRefunds}
subtitle="Declined"
icon="❌"
color="red"
/>

</KPIGrid>

<SectionHeader

title="Refund Requests"

subtitle="Review all customer refund requests."

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
Gateway Txn
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Approve
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Reject
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

<td className="px-6 py-5 text-center">

{refund.refundStatus==="SUCCESS"?(
<span className="text-green-600 font-bold">
Done ✓
</span>
):(
<button
onClick={()=>approveRefund(refund._id)}
className="
px-5
py-2
rounded-xl
bg-green-600
text-white
font-semibold
hover:bg-green-700
transition
"
>
Approve
</button>
)}

</td>

<td className="px-6 py-5 text-center">

{refund.refundStatus==="REJECTED"?(
<span className="text-red-600 font-bold">
Done ✕
</span>
):(
<button
onClick={()=>rejectRefund(refund._id)}
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
Reject
</button>
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