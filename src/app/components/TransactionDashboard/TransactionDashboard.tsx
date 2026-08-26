"use client";

import { useEffect, useState } from "react";

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
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";
import OpsMoneyStrip from "../DashboardUI/OpsMoneyStrip";

export default function TransactionDashboard(){

const [transactions,setTransactions]=useState<any[]>([]);
const [search,setSearch]=useState("");
const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
const [loading, setLoading] = useState(true);
const [handoverId, setHandoverId] = useState("");

useEffect(() => {

fetchTransactions();

const interval = setInterval(() => {

fetchTransactions();

},10000);

return () => clearInterval(interval);

},[]);

const fetchTransactions = async () => {

try {

setLoading(true);

const res = await fetch("/api/transactions?limit=500");

const data = await res.json();

if (!data.success) {

alert(data.message || "Unable to load transactions.");

return;

}

setTransactions(data.data || []);

}

finally {

setLoading(false);

}

};

const markCashHandedOver = async (transactionId: string) => {
  if (!confirm("Confirm this cash has been handed over to the company?")) return;
  setHandoverId(transactionId);
  try {
    const res = await fetch("/api/payments/cash/handover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Unable to mark handover.");
      return;
    }
    await fetchTransactions();
  } finally {
    setHandoverId("");
  }
};

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
.filter(item => item.status === "Success")
.reduce(
(sum,item)=>sum+Number(item.amount||0),
0
);

const totalGST = transactions
.filter(item => item.status === "Success")
.reduce(
(sum,item)=>sum+Number(item.gstAmount||0),
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

subtitle="Razorpay, wallet, and yard cash all land here from the same Mongo transactions. Cash stays Due to company until yard/admin marks handover."

/>

<OpsMoneyStrip />

<KPIGrid>

<KPICard
title="Transactions"
value={transactions.length}
subtitle="Total Records"
icon={<CreditCard size={28} />}
color="pink"
/>

<KPICard
title="Revenue"
value={`₹${totalRevenue.toLocaleString("en-IN")}`}
subtitle="Collected"
icon={<Wallet size={28} />}
color="green"
/>

<KPICard
title="GST"
value={`₹${totalGST.toLocaleString("en-IN")}`}
subtitle="Collected"
icon={<Receipt size={28} />}
color="blue"
/>

<KPICard
title="Successful"
value={successfulPayments}
subtitle="Completed"
icon={<CheckCircle2 size={28} />}
color="green"
/>

<KPICard
title="Pending"
value={pendingPayments}
subtitle="Awaiting Payment"
icon={<Clock3 size={28} />}
color="yellow"
/>

<KPICard
title="Booking Payments"
value={bookingPayments}
subtitle="Successful Bookings"
icon={<Bike size={28} />}
color="blue"
/>

<KPICard
title="Refunds"
value={refundPayments}
subtitle={`${refundedPayments} Refunded`}
icon={<RotateCcw size={28} />}
color="pink"
/>

<KPICard
title="Failed"
value={failedPayments}
subtitle="Payment Failures"
icon={<XCircle size={28} />}
color="red"
/>

</KPIGrid>

 <SectionHeader
 title="Payment Transactions"
subtitle="Search and monitor all transaction records."
/>

<div className="mb-6 flex justify-end">

<button

onClick={() => {
  if (transactions.length === 0) {

alert("No transactions available to export.");

return;

}

const rows = transactions.map((t:any)=>({

TransactionID:t.transactionId,

BookingID:t.bookingId,

User:t.userName,

Amount:t.amount,

GST:t.gstAmount,

Method:t.paymentMethod,

Type:t.transactionType,

Status:t.status,

Refund:t.refundStatus,

Invoice:t.invoiceNumber,

Created:t.createdAt,

}));

const csv=[

Object.keys(rows[0]||{}).join(","),

...rows.map(Object.values).map(r=>r.join(","))

].join("\n");

const blob=new Blob([csv],{type:"text/csv"});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="transactions.csv";

a.click();

URL.revokeObjectURL(url);

}}

className="
rounded-2xl
bg-gradient-to-r
from-[#00C853]
to-[#00E676]
px-6
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

Export CSV

</button>

</div>



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
  ) : (
    <button
      type="button"
      disabled={handoverId === item.transactionId}
      onClick={() => void markCashHandedOver(item.transactionId)}
      className="rounded-xl bg-[#0A1134] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {handoverId === item.transactionId ? "Saving..." : "Mark handed to company"}
    </button>
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