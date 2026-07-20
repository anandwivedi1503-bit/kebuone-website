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
const [search,setSearch] = useState("")
const [statusFilter, setStatusFilter] = useState("ALL");
const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
const [processingId, setProcessingId] = useState("");
const fetchRefunds = async () => {

  try {

    const res = await fetch("/api/refunds");

    const data = await res.json();

    if (data.success) {

      setRefunds(data.data || []);

    }

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  fetchRefunds();

}, []);

const processingRefunds=refunds.filter(
(r)=>r.refundStatus==="PROCESSING"
).length;

const approvedRefunds = refunds.filter(
  (r) => r.refundStatus === "APPROVED"
).length;

const refundedRefunds = refunds.filter(
  (r) => r.refundStatus === "REFUNDED"
).length;

const rejectedRefunds=refunds.filter(
(r)=>r.refundStatus==="REJECTED"
).length;

const totalRefundAmount=refunds.reduce(
(sum,r)=>sum+(r.amount||0),
0
);

const filteredRefunds = refunds.filter((refund) => {

  const keyword = search.toLowerCase();

  const matchesSearch =

    refund.refundId?.toLowerCase().includes(keyword) ||

    refund.bookingId?.toLowerCase().includes(keyword) ||

    refund.ticketId?.toLowerCase().includes(keyword) ||

    refund.riderId?.toLowerCase().includes(keyword) ||

    refund.gatewayTxnId?.toLowerCase().includes(keyword);

  const matchesStatus =

    statusFilter === "ALL" ||

    refund.refundStatus === statusFilter;

  return matchesSearch && matchesStatus;

});

const approveRefund = async (id: string) => {

  const confirmApprove = confirm(
    "Approve this refund?"
  );

  if (!confirmApprove) return;

  setProcessingId(id);

  try {

    await fetch(`/api/refunds/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundStatus: "REFUNDED",
      }),
    });

    fetchRefunds();

  } finally {

    setProcessingId("");

  }

};

const rejectRefund = async (id: string) => {

  const confirmReject = confirm(
    "Reject this refund?"
  );

  if (!confirmReject) return;

  setProcessingId(id);

  try {

    await fetch(`/api/refunds/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundStatus: "REJECTED",
      }),
    });

    fetchRefunds();

  } finally {

    setProcessingId("");

  }

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
value={`₹${totalRefundAmount.toLocaleString("en-IN")}`}
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
title="Refunded"
value={refundedRefunds}
subtitle="Completed"
icon="✅"
color="green"
/>

<KPICard
title="Approved"
value={approvedRefunds}
subtitle="Ready to Process"
icon="✔️"
color="blue"
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

<div className="mb-8">

<input

type="text"

placeholder="Search Refund ID, Booking ID, Rider ID, Ticket ID..."

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
"PROCESSING",
"PENDING",
"APPROVED",
"REFUNDED",
"REJECTED",
"FAILED",
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
Booking ID
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
View
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

{filteredRefunds.map((refund)=>(

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
{refund.bookingId || "-"}
</td>

<td className="px-6 py-5">
{refund.ticketId}
</td>

<td className="px-6 py-5 text-center font-bold">
₹{Number(refund.amount).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
{refund.gatewayTxnId}
</td>

<td className="px-6 py-5 text-center">

{refund.refundStatus==="REFUNDED" && (
  <StatusBadge status="active" />
)}

{refund.refundStatus==="APPROVED" && (
  <StatusBadge status="warning" />
)}

{refund.refundStatus==="PROCESSING" && (
  <StatusBadge status="inactive" />
)}

{refund.refundStatus==="PENDING" && (
  <StatusBadge status="warning" />
)}

{refund.refundStatus==="FAILED" && (
  <StatusBadge status="danger" />
)}

{refund.refundStatus==="REJECTED" && (
  <StatusBadge status="danger" />
)}



</td>

<td className="px-6 py-5 text-center">

<button
onClick={()=>setSelectedRefund(refund)}
className="
px-5
py-2
rounded-xl
bg-blue-600
text-white
font-semibold
hover:bg-blue-700
transition
"
>

View

</button>

</td>

<td className="px-6 py-5 text-center">

{refund.refundStatus==="REFUNDED"?(
<span className="text-green-600 font-bold">
Done ✓
</span>
):(
<button
disabled={processingId===refund._id}
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
{processingId===refund._id
? "Processing..."
: "Approve"}
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
disabled={processingId===refund._id}
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
{processingId===refund._id
? "Processing..."
: "Reject"}
</button>
)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>
{selectedRefund && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">

<div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8">

<div className="mb-8 flex items-center justify-between">

<h2 className="text-3xl font-black text-[#0A1134]">

Refund Details

</h2>

<button
onClick={()=>setSelectedRefund(null)}
className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
>

Close

</button>

</div>

<div className="grid gap-6 md:grid-cols-2">

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Refund Information

</h3>

<p><b>Refund ID :</b> {selectedRefund.refundId}</p>

<p><b>Booking ID :</b> {selectedRefund.bookingId}</p>

<p><b>Ticket ID :</b> {selectedRefund.ticketId}</p>

<p><b>Rider ID :</b> {selectedRefund.riderId}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Amount

</h3>

<p><b>Refund :</b> ₹{Number(selectedRefund.amount).toLocaleString("en-IN")}</p>

<p><b>Status :</b> {selectedRefund.refundStatus}</p>

<p><b>Gateway Txn :</b> {selectedRefund.gatewayTxnId || "-"}</p>

<p><b>Razorpay Refund :</b> {selectedRefund.razorpayRefundId || "-"}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Processing

</h3>

<p><b>Processed By :</b> {selectedRefund.processedBy || "-"}</p>

<p><b>Processed At :</b>

{selectedRefund.processedAt ?

new Date(selectedRefund.processedAt).toLocaleString("en-IN")

:

"-"}

</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Timeline

</h3>

<p>

<b>Created :</b>

<br/>

{new Date(selectedRefund.createdAt).toLocaleString("en-IN")}

</p>

</div>

<div className="rounded-2xl border p-5 md:col-span-2">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Remarks

</h3>

<p className="whitespace-pre-wrap">

{selectedRefund.remarks || "No remarks"}

</p>

</div>

</div>

</div>

</div>

)}

</PageContainer>
);
}