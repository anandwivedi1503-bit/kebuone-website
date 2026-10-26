"use client";

import { useEffect, useState } from "react";

import { startOpsPoll } from "@/lib/opsPoll";
import { consumeOpsFocus, openOpsDesk } from "@/lib/opsFocus";
import { downloadRefundReceipt } from "@/lib/refundReceipt";
import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";
import OpsMoneyStrip from "../DashboardUI/OpsMoneyStrip";

export default function RefundDashboard(){

const [refunds,setRefunds]=useState<any[]>([]);
const [listPages,setListPages]=useState(1);
const [hasMoreRefunds,setHasMoreRefunds]=useState(false);
const [search,setSearch] = useState(() => consumeOpsFocus())
const [statusFilter, setStatusFilter] = useState("ALL");
const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
const [processingId, setProcessingId] = useState("");
const [razorpayModal, setRazorpayModal] = useState<any | null>(null);
const [razorpayModalMsg, setRazorpayModalMsg] = useState("");
const [loading, setLoading] = useState(true);

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window !== "undefined" && (window as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
const fetchRefunds = async () => {

  try {

    const res = await fetch(
      `/api/refunds?limit=${Math.min(500, 80 * listPages)}&page=1`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (data.success) {

      setRefunds(data.data || []);
      setHasMoreRefunds(Boolean(data.pagination?.hasMore));

    }

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }

};

useEffect(() => {

  fetchRefunds();

  return startOpsPoll(() => {

    fetchRefunds();

  });

}, [listPages]);

const processingRefunds=refunds.filter(
(r)=>r.refundStatus==="PROCESSING" || r.refundStatus==="PENDING"
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

const totalRefundAmount = refunds
.filter(
(r)=>r.refundStatus==="REFUNDED"
)
.reduce(
(sum,r)=>sum+(r.amount||0),
0
);

const pendingRefundAmount = refunds
.filter(
(r)=>
r.refundStatus==="PROCESSING" ||
r.refundStatus==="PENDING"
)
.reduce(
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

const runApproveRefund = async (id: string, sendToRazorpay = true) => {
  setProcessingId(id);

  try {

    const res = await fetch(`/api/refunds/${id}`, {
  method: "PATCH",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    refundStatus: "REFUNDED",
    sendToRazorpay,
  }),
});

const data = await res.json();

await fetchRefunds();

if (!data.success) {

  alert(
    data.message ||
      (Array.isArray(data.errors) ? data.errors.join(" ") : "") ||
      "Unable to approve refund."
  );

  return;

}

const row = data.data || refunds.find((r) => r._id === id);
    if (data.success && row) {
      downloadRefundReceipt({
        refundId: String(row.refundId || id),
        bookingId: String(row.bookingId || ""),
        riderId: String(row.riderId || ""),
        amount: Number(row.amount || 0),
        paymentGateway: data.channel || row.paymentGateway,
        gatewayTxnId: row.gatewayTxnId,
        razorpayRefundId: row.razorpayRefundId,
        processedAt: row.processedAt || new Date(),
      });
    }

    alert(
      data.message ||
        (data.channel === "Wallet"
          ? "Refund credited to rider wallet. Payment slip downloaded."
          : "Refund sent via Razorpay. Payment slip downloaded.")
    );
    setRazorpayModal(null);
    setRazorpayModalMsg("");

  } finally {

    setProcessingId("");

  }

};

const approveRefund = async (id: string, sendToRazorpay = true, amount = 0) => {
  if (sendToRazorpay) {
    const refund = refunds.find((r) => r._id === id);
    if (refund) {
      setRazorpayModalMsg("");
      setRazorpayModal(refund);
      return;
    }
  }
  const rupees = Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!confirm(`Credit ₹${rupees} to the rider wallet? Use only when there is no Razorpay capture.`)) {
    return;
  }
  await runApproveRefund(id, false);
};

const confirmRazorpayRefund = async () => {
  if (!razorpayModal?._id) return;
  setRazorpayModalMsg("Loading Razorpay...");
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    setRazorpayModalMsg("Razorpay script could not load. Check connection and retry.");
    return;
  }
  setRazorpayModalMsg("Sending refund to the rider’s original payment method...");
  await runApproveRefund(String(razorpayModal._id), true);
};

const rejectRefund = async (id: string) => {

  const confirmReject = confirm(
    "Reject this refund?"
  );

  if (!confirmReject) return;

  setProcessingId(id);

  try {

    const res = await fetch(`/api/refunds/${id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    refundStatus: "REJECTED",
  }),
});

const data = await res.json();

if (!data.success) {

  alert(data.message || "Unable to reject refund.");

  return;

}

alert("Refund rejected successfully.");

await fetchRefunds();

  } finally {

    setProcessingId("");

  }

};
return(

<PageContainer>

<DashboardHeader

title="Refund Dashboard"

subtitle="Deposit and cancellation refunds. Razorpay returns money to the original capture. If there is no pay_ capture (cash/offline), the same amount is credited to the rider wallet automatically."

/>

<OpsMoneyStrip />

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

<KPICard
title="Pending Amount"
value={`₹${pendingRefundAmount.toLocaleString("en-IN")}`}
subtitle="Awaiting Refund"
icon="💰"
color="yellow"
/>



</KPIGrid>

<SectionHeader

title="Refund Requests"

subtitle="Review all customer refund requests."

rightContent={
  <DashboardActions
    filename="Refunds.csv"
    onRefresh={fetchRefunds}
    rows={filteredRefunds.map((refund) => ({
      RefundID: refund.refundId,
      BookingID: refund.bookingId,
      TicketID: refund.ticketId,
      Amount: refund.amount,
      Kind: refund.refundKind,
      BookingPending: refund.bookingSnapshot?.pendingAmount,
      BookingDeposit: refund.bookingSnapshot?.securityDeposit,
      Status: refund.refundStatus,
      Gateway: refund.paymentGateway,
    }))}
  />
}

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

  {loading ? (

<div className="py-16 text-center text-xl font-bold text-gray-500">

Loading refund records...

</div>

) : (

<>

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
Kind
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Gateway Txn
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Created
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Processed By
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
  {filteredRefunds.length === 0 && (

<tr>

<td
colSpan={12}
className="py-12 text-center text-gray-500 text-lg font-semibold"
>

No refund records found.

</td>

</tr>

)}

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
{refund.bookingSnapshot ? (
  <div className="mt-1 text-[11px] font-semibold text-slate-500">
    Booking deposit ₹{Number(refund.bookingSnapshot.securityDeposit || 0).toLocaleString("en-IN")} · pending ₹{Number(refund.bookingSnapshot.pendingAmount || 0).toLocaleString("en-IN")}
  </div>
) : null}
{refund.remarks ? (
  <div className="mt-1 text-[11px] font-medium text-slate-600">{refund.remarks}</div>
) : null}
</td>

<td className="px-6 py-5 text-center text-xs font-bold">
{refund.refundKind === "SecurityDeposit" ? "Security deposit" : "Manual / other"}
</td>

<td className="px-6 py-5 text-center">
{refund.gatewayTxnId}
</td>

<td className="px-6 py-5 text-center text-sm">
{new Date(refund.createdAt).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
{refund.processedBy || "-"}
</td>

<td className="px-6 py-5 text-center">

<div className="flex items-center justify-center gap-2">

{refund.refundStatus==="REFUNDED" && (
<>
<StatusBadge status="active" label="REFUNDED" />
<span className="font-semibold text-green-700">
REFUNDED
</span>
</>
)}

{refund.refundStatus==="APPROVED" && (
<>
<StatusBadge status="warning" label="APPROVED" />
<span className="font-semibold text-yellow-700">
APPROVED
</span>
</>
)}

{refund.refundStatus==="PROCESSING" && (
<>
<StatusBadge status="warning" label="PROCESSING" />
<span className="font-semibold text-amber-800">
PROCESSING
</span>
</>
)}

{refund.refundStatus==="PENDING" && (
<>
<StatusBadge status="warning" />
<span className="font-semibold text-yellow-700">
PENDING
</span>
</>
)}

{refund.refundStatus==="FAILED" && (
<>
<StatusBadge status="danger" />
<span className="font-semibold text-red-700">
FAILED
</span>
</>
)}

{refund.refundStatus==="REJECTED" && (
<>
<StatusBadge status="danger" />
<span className="font-semibold text-red-700">
REJECTED
</span>
</>
)}



</div>
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

{refund.refundStatus === "PROCESSING" ||
refund.refundStatus === "PENDING" ||
refund.refundStatus === "APPROVED" ? (

<div className="flex flex-col gap-2">
<button
disabled={processingId===refund._id}
onClick={()=>approveRefund(refund._id, true, refund.amount)}
className="min-h-11 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-black transition"
>
{processingId===refund._id
? "Processing..."
: `Razorpay refund ₹${Number(refund.amount || 0).toLocaleString("en-IN")}`}
</button>
{refund.failureReason ? (
  <p className="max-w-[220px] text-left text-[11px] font-medium text-rose-700">
    {refund.failureReason}
  </p>
) : null}
<button
disabled={processingId===refund._id}
onClick={()=>approveRefund(refund._id, false, refund.amount)}
className="
px-5
py-2
rounded-xl
border border-slate-200
bg-white
text-slate-600
font-semibold
hover:bg-slate-50
transition
"
>
Wallet if no Razorpay capture
</button>
</div>

) : refund.refundStatus === "REFUNDED" ? (

<span className="text-green-600 font-bold">
Done ✓
</span>

) : (

<span className="text-gray-400 font-semibold">
—
</span>

)}

</td>

<td className="px-6 py-5 text-center">

{refund.refundStatus === "PROCESSING" ||
refund.refundStatus === "PENDING" ||
refund.refundStatus === "APPROVED" ? (

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

) : refund.refundStatus === "REJECTED" ? (

<span className="text-red-600 font-bold">
Done ✕
</span>

) : (

<span className="text-gray-400 font-semibold">
—
</span>

)}

</td>

</tr>

))}

</tbody>

</table>

</div>

{hasMoreRefunds ? (
  <div className="mt-6 flex justify-center">
    <button
      type="button"
      onClick={() => setListPages((pages) => pages + 1)}
      className="rounded-xl border border-pink-100 bg-white px-6 py-3 font-bold text-[#0A1134] hover:bg-pink-50"
    >
      Load more
    </button>
  </div>
) : null}

</>

)}

</DashboardCard>
{selectedRefund && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">

<div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8">

<div className="mb-8 flex items-center justify-between">

<h2 className="text-3xl font-black text-[#0A1134]">

Refund Details

</h2>

<button
onClick={() => {

setSelectedRefund(null);

fetchRefunds();

}}
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

{selectedRefund.refundStatus === "REFUNDED" ? (
  <div className="md:col-span-2 flex flex-wrap gap-3">
    <button
      type="button"
      onClick={() =>
        downloadRefundReceipt({
          refundId: String(selectedRefund.refundId),
          bookingId: String(selectedRefund.bookingId || ""),
          riderId: String(selectedRefund.riderId || ""),
          amount: Number(selectedRefund.amount || 0),
          paymentGateway: selectedRefund.paymentGateway,
          gatewayTxnId: selectedRefund.gatewayTxnId,
          razorpayRefundId: selectedRefund.razorpayRefundId,
          processedAt: selectedRefund.processedAt,
        })
      }
      className="rounded-xl bg-[#18B368] px-5 py-2.5 text-sm font-bold text-white"
    >
      Download payment slip
    </button>
    {selectedRefund.riderId ? (
      <button
        type="button"
        onClick={() => openOpsDesk("wallet", String(selectedRefund.riderId))}
        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
      >
        Open rider wallet
      </button>
    ) : null}
  </div>
) : null}

</div>

</div>

</div>

)}

{razorpayModal ? (
  <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-[#18B368]">Razorpay refund</p>
      <h3 className="mt-2 text-xl font-black text-[#0F172A]">
        ₹{Number(razorpayModal.amount || 0).toLocaleString("en-IN")}
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Booking <strong>{razorpayModal.bookingId}</strong> · Rider{" "}
        <strong>{razorpayModal.riderId || "—"}</strong>
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        EVUDDY sends this refund through Razorpay to the original card/UPI capture for this rider.
        You will get a downloadable payment slip when it completes.
      </p>
      {razorpayModalMsg ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{razorpayModalMsg}</p>
      ) : null}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={Boolean(processingId)}
          onClick={() => void confirmRazorpayRefund()}
          className="min-h-12 flex-1 rounded-xl bg-[#0F172A] text-sm font-bold text-white disabled:opacity-60"
        >
          {processingId ? "Processing..." : "Confirm refund on Razorpay"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRazorpayModal(null);
            setRazorpayModalMsg("");
          }}
          className="min-h-12 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
) : null}

</PageContainer>
);
}