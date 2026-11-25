"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startOpsPoll } from "@/lib/opsPoll";

import {
  CreditCard,
  Wallet,
  Receipt,
  CheckCircle2,
  Clock3,
  Bike,
  RotateCcw,
  XCircle,
} from "lucide-react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import { transactionCgst, transactionSgst } from "@/lib/gst";
import { downloadTransactionInvoice } from "@/lib/transactionReceipt";
import { isRevenueTransaction, revenueAmount, revenueGst } from "@/lib/opsRevenue";
import SectionHeader from "../DashboardUI/SectionHeader";
import DashboardActions from "../DashboardUI/DashboardActions";
import StatusBadge from "../DashboardUI/StatusBadge";
import OpsMoneyStrip from "../DashboardUI/OpsMoneyStrip";
import CashHandoverPanel from "./CashHandoverPanel";

export default function TransactionDashboard(){

const [transactions,setTransactions]=useState<any[]>([]);
const [hasMoreTransactions,setHasMoreTransactions]=useState(false);
const [loadingMoreTransactions,setLoadingMoreTransactions]=useState(false);
const nextCursorRef=useRef("");
const loadingMoreRef=useRef(false);
const [search,setSearch]=useState("");
const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
const [loading, setLoading] = useState(true);

const fetchTransactions = useCallback(async (append = false) => {
if (append && (!nextCursorRef.current || loadingMoreRef.current)) return;
if (append) {
  loadingMoreRef.current = true;
  setLoadingMoreTransactions(true);
}

try {

const params = new URLSearchParams({ limit: "80" });
if (append) params.set("cursor", nextCursorRef.current);
const res = await fetch(`/api/transactions?${params.toString()}`, { cache: "no-store" });

const data = await res.json();

if (!data.success) {

alert(data.message || "Unable to load transactions.");

return;

}

const rows = Array.isArray(data.data) ? data.data : [];
setTransactions((current) => {
  if (append) {
    const seen = new Set(current.map((item) => String(item._id)));
    return [...current, ...rows.filter((item: { _id?: string }) => !seen.has(String(item._id)))];
  }
  if (!nextCursorRef.current) return rows;
  const seen = new Set(rows.map((item: { _id?: string }) => String(item._id)));
  return [...rows, ...current.filter((item) => !seen.has(String(item._id)))];
});
if (append || !nextCursorRef.current) {
  nextCursorRef.current = String(data.pagination?.nextCursor || "");
}
setHasMoreTransactions(Boolean(data.pagination?.hasMore));

}

catch (error) {
  console.error("TRANSACTION DASHBOARD LOAD ERROR:", error);
}

finally {

setLoading(false);
if (append) {
  loadingMoreRef.current = false;
  setLoadingMoreTransactions(false);
}

}

}, []);

useEffect(() => {
  void fetchTransactions();
  return startOpsPoll(() => void fetchTransactions());
}, [fetchTransactions]);

const filteredTransactions = transactions

.filter((item) => {

const keyword = search.toLowerCase();

return (

item.transactionId?.toLowerCase().includes(keyword) ||

item.bookingId?.toLowerCase().includes(keyword) ||

item.userName?.toLowerCase().includes(keyword) ||

item.paymentMethod?.toLowerCase().includes(keyword) ||

item.status?.toLowerCase().includes(keyword) ||

item.transactionType?.toLowerCase().includes(keyword) ||

item.razorpayPaymentId?.toLowerCase().includes(keyword) ||

item.invoiceNumber?.toLowerCase().includes(keyword)

);

})

.sort(

(a,b)=>

new Date(b.createdAt).getTime() -

new Date(a.createdAt).getTime()

);

const totalRevenue = transactions
.filter(item => isRevenueTransaction(item))
.reduce(
(sum,item)=>sum+revenueAmount(item),
0
);

const totalGST = transactions
.filter(item => isRevenueTransaction(item))
.reduce(
(sum,item)=>sum+revenueGst(item),
0
);

const bookingPayments = transactions.filter(
(item)=>item.transactionType==="Booking Payment"
).length;

const refundPayments = transactions.filter(
(item)=>item.transactionType==="Refund"
).length;

const failedPayments = transactions.filter(
(item)=>item.status==="Failed"
).length;

const loadedScopeLabel = hasMoreTransactions ? "Loaded rows only · load older for more" : "Full ledger loaded";

const refundedPayments = transactions.filter(
(item)=>item.status==="Refunded"
).length;

const successfulPayments=transactions.filter(

(item)=>item.status==="Success"

).length;

const pendingPayments =
transactions.filter(
item=>item.status==="Pending"
).length;

return(

<PageContainer>

<DashboardHeader

title="Transaction Dashboard"

subtitle="Razorpay, wallet, and yard cash share one transaction ledger. Yard cash stays due until a counted handover is reconciled."

/>

<OpsMoneyStrip />

<CashHandoverPanel onDone={() => void fetchTransactions()} />

<KPIGrid>

<KPICard
title="Transactions loaded"
value={transactions.length}
subtitle={hasMoreTransactions ? "More records are available below" : "Full ledger loaded"}
icon={<CreditCard size={28} />}
color="pink"
/>

<KPICard
title="Revenue"
value={`₹${totalRevenue.toLocaleString("en-IN")}`}
subtitle={`Rent + GST from Success booking payments · ${loadedScopeLabel}`}
icon={<Wallet size={28} />}
color="green"
/>

<KPICard
title="GST"
value={`₹${totalGST.toLocaleString("en-IN")}`}
subtitle={`Rent + GST only; excludes deposits, refunds, and wallet top-ups · ${loadedScopeLabel}`}
icon={<Receipt size={28} />}
color="blue"
/>

<KPICard
title="Successful"
value={successfulPayments}
subtitle={`Completed · ${loadedScopeLabel}`}
icon={<CheckCircle2 size={28} />}
color="green"
/>

<KPICard
title="Pending"
value={pendingPayments}
subtitle={`Awaiting payment · ${loadedScopeLabel}`}
icon={<Clock3 size={28} />}
color="yellow"
/>

<KPICard
title="Booking Payments"
value={bookingPayments}
subtitle={`Successful bookings · ${loadedScopeLabel}`}
icon={<Bike size={28} />}
color="blue"
/>

<KPICard
title="Refunds"
value={refundPayments}
subtitle={`${refundedPayments} refunded · ${loadedScopeLabel}`}
icon={<RotateCcw size={28} />}
color="pink"
/>

<KPICard
title="Failed"
value={failedPayments}
subtitle={`Payment failures · ${loadedScopeLabel}`}
icon={<XCircle size={28} />}
color="red"
/>

</KPIGrid>

 <SectionHeader
 title="Payment Transactions"
subtitle="Search loaded records and use Load older transactions to continue through the full ledger. Sheet exports the currently loaded filtered list."
rightContent={
  <DashboardActions
    filename="transactions"
    rows={filteredTransactions.map((t: any) => ({
      TransactionID: t.transactionId,
      BookingID: t.bookingId,
      User: t.userName,
      Amount: t.amount,
      GST: t.gstAmount,
      Method: t.paymentMethod,
      Type: t.transactionType,
      Status: t.status,
      Refund: t.refundStatus,
      Invoice: t.invoiceNumber,
      Created: t.createdAt,
    }))}
    onRefresh={() => void fetchTransactions()}
  />
 }
 />



<div className="mb-8">

<input

type="text"

placeholder="Search Transaction ID..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="
w-full
rounded-3xl
border
border-slate-200
bg-white/90
backdrop-blur-xl
px-6
py-4
shadow-sm
transition-all
duration-300
focus:border-[#00C853]
focus:ring-4
focus:ring-[#00C853]/10
focus:outline-none
 "

/>

</div>

{loading && (

<div className="mb-6 rounded-2xl bg-blue-50 p-5 text-center font-semibold text-blue-700">

Loading latest transactions...

</div>

)}

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
Type
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Refund
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Invoice
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Created
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Cash handover
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
View
</th>

</tr>

</thead>

<tbody>

{filteredTransactions.length === 0 ? (

<tr>

<td
colSpan={13}
className="py-10 text-center text-gray-500 font-medium"
>

No transactions found.

<br />

<span className="text-sm text-gray-400">

Payments will appear here automatically.

</span>

</td>

</tr>

) : (

filteredTransactions.map((item)=>(

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
₹{Number(item.amount || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
₹{Number(item.gstAmount || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
{item.paymentMethod}
</td>

<td className="px-6 py-5 text-center">
{item.transactionType || "-"}
</td>

<td className="px-6 py-5 text-center">

{item.status === "Success" && (
<StatusBadge
status="active"
label="Success"
/>
)}

{item.status === "Pending" && (
<StatusBadge
status="warning"
label="Pending"
/>
)}

{item.status === "Failed" && (
<StatusBadge
status="danger"
label="Failed"
/>
)}

{item.status === "Refunded" && (
<StatusBadge
status="inactive"
label="Refunded"
/>
)}

</td>

<td className="px-6 py-5 text-center">

{item.refundStatus === "Completed" && (
<StatusBadge status="active" label="Completed" />
)}

{item.refundStatus === "Pending" && (
<StatusBadge status="warning" label="Pending" />
)}

{(!item.refundStatus || item.refundStatus === "None") && (
<span className="text-gray-400">None</span>
)}

</td>

<td className="px-6 py-5 text-center">

{item.invoiceGenerated ? (

<span className="font-semibold text-green-600">

Generated ✓

</span>

) : (

<span className="font-semibold text-orange-500">

Pending

</span>

)}

</td>

<td className="px-6 py-5 text-center">
{item.createdAt
? new Date(item.createdAt).toLocaleString("en-IN")
: "-"}
</td>

<td className="px-6 py-5 text-center">
{item.paymentMethod === "Cash" ? (
  item.cashHandoverStatus === "HandedOver" ? (
    <span className="text-xs font-bold text-emerald-700">Handed over</span>
  ) : item.cashHandoverStatus === "VarianceReview" ? (
    <span className="text-xs font-bold text-rose-700">Variance review</span>
  ) : (
    <span className="text-xs font-semibold text-amber-700">Due to company</span>
  )
) : (
  <span className="text-slate-400">—</span>
)}
</td>

<td className="px-6 py-5 text-center">

<button
onClick={() => setSelectedTransaction(item)}
className="
rounded-2xl
bg-gradient-to-r
from-[#00C853]
to-[#00E676]
px-5
py-2.5
font-bold
text-[#07111F]
shadow-md
transition-all
duration-300
hover:scale-[1.05]
hover:shadow-xl
"
>

View

</button>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

{hasMoreTransactions ? (
  <div className="mt-6 flex justify-center">
    <button
      type="button"
      disabled={loadingMoreTransactions}
      onClick={() => void fetchTransactions(true)}
      className="rounded-xl border border-pink-100 bg-white px-6 py-3 font-bold text-[#0A1134] hover:bg-pink-50 disabled:opacity-60"
    >
      {loadingMoreTransactions ? "Loading…" : "Load older transactions"}
    </button>
  </div>
) : null}

</DashboardCard>

{selectedTransaction && (

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
lg:pl-[272px]
"
>


<div
className="
relative
w-full
max-w-6xl
max-h-[92vh]
overflow-y-auto
rounded-[32px]
bg-white
border
border-slate-200
shadow-[0_40px_120px_rgba(0,0,0,0.25)]
p-6
md:p-8
xl:p-10
"
>
<div className="mb-8 flex items-center justify-between">

<div>

<h2 className="text-4xl font-black text-[#07111F]">

Transaction Overview

</h2>

<p className="mt-2 text-gray-500">

Payment information, invoice, timeline and transaction history

</p>

</div>

<button
onClick={() => setSelectedTransaction(null)}
className="
rounded-2xl
bg-gradient-to-r
from-red-500
to-red-600
px-5
py-2.5
font-bold
text-white
shadow-lg
transition-all
duration-300
hover:scale-[1.05]
"
>

Close

</button>

</div>

<div className="grid gap-6 md:grid-cols-2">

<div className="
rounded-[28px]
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-7
shadow-md
hover:shadow-xl
transition-all
duration-300
">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Transaction

</h3>

<p><b>Transaction ID :</b> {selectedTransaction.transactionId}</p>

<p><b>Booking ID :</b> {selectedTransaction.bookingId || "-"}</p>

<p><b>User :</b> {selectedTransaction.userName || "-"}</p>

<p><b>User ID :</b> {selectedTransaction.userId || "-"}</p>

</div>

<div className="
rounded-[28px]
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-7
shadow-md
hover:shadow-xl
transition-all
duration-300
">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Payment

</h3>

<p>

<b>Amount :</b>

₹{Number(selectedTransaction.amount || 0).toLocaleString("en-IN")}

</p>

<p>

<b>GST :</b>

₹{Number(selectedTransaction.gstAmount || 0).toLocaleString("en-IN")}

</p>

<p>

<b>CGST 2.5% :</b>

₹{transactionCgst(selectedTransaction).toLocaleString("en-IN")}

</p>

<p>

<b>SGST 2.5% :</b>

₹{transactionSgst(selectedTransaction).toLocaleString("en-IN")}

</p>

<p>

<b>Method :</b>

{selectedTransaction.paymentMethod}

</p>

<p>

<b>Status :</b>

{selectedTransaction.status}

</p>

</div>

<div className="
rounded-[28px]
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-7
shadow-md
hover:shadow-xl
transition-all
duration-300
">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Razorpay

</h3>

<p>

<b>Order ID :</b>

{selectedTransaction.razorpayOrderId || "-"}

</p>

<p>

<b>Payment ID :</b>

{selectedTransaction.razorpayPaymentId || "-"}

</p>

<p>

<b>Refund Status :</b>

{selectedTransaction.refundStatus || "-"}

</p>

<p>

<b>Refund Amount :</b>

₹{Number(selectedTransaction.refundAmount || 0).toLocaleString("en-IN")}

</p>

</div>

<div className="
rounded-[28px]
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-7
shadow-md
hover:shadow-xl
transition-all
duration-300
">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Invoice

</h3>

<p>

<b>Invoice Generated :</b>

{selectedTransaction.invoiceGenerated ? "Yes" : "No"}

</p>

<p>

<b>Invoice Number :</b>

{selectedTransaction.invoiceNumber || "-"}

</p>

<button
  type="button"
  onClick={() => downloadTransactionInvoice(selectedTransaction)}
  className="mt-4 rounded-xl bg-[#18B368] px-5 py-2.5 text-sm font-bold text-white"
>
  Download invoice
</button>

</div>

{selectedTransaction.cashHandoverPhotoUrl || selectedTransaction.cashHandoverPhotoPublicId ? (
  <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-7 md:col-span-2">
    <h3 className="mb-4 text-xl font-bold text-amber-900">Cash collection evidence</h3>
    <a href={`/api/payments/cash/evidence?transactionId=${encodeURIComponent(selectedTransaction.transactionId)}`} target="_blank" rel="noreferrer">
      <img
        src={`/api/payments/cash/evidence?transactionId=${encodeURIComponent(selectedTransaction.transactionId)}`}
        alt={`Cash evidence for ${selectedTransaction.bookingId || selectedTransaction.transactionId}`}
        className="max-h-80 rounded-2xl border border-amber-200 object-contain"
      />
    </a>
    <a
      href={`/api/payments/cash/evidence?transactionId=${encodeURIComponent(selectedTransaction.transactionId)}`}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex text-sm font-bold text-amber-900 underline"
    >
      Open full photo
    </a>
  </div>
) : null}

<div className="
rounded-[28px]
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-7
shadow-md
md:col-span-2
">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Remarks

</h3>

<p className="whitespace-pre-wrap">

{selectedTransaction.remarks || "No remarks"}

</p>

</div>

<div className="
rounded-[28px]
border
border-slate-200
bg-gradient-to-br
from-white
to-slate-50
p-7
shadow-md
md:col-span-2
">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Timeline

</h3>

<p>

<b>Created :</b>

<br/>

{selectedTransaction.createdAt
? new Date(selectedTransaction.createdAt).toLocaleString("en-IN")
: "-"}

</p>

<br/>

<p>

<b>Updated :</b>

<br/>

{selectedTransaction.updatedAt
? new Date(selectedTransaction.updatedAt).toLocaleString("en-IN")
: "-"}

</p>

</div>

</div>

</div>

</div>

)}

</PageContainer>
);
}
