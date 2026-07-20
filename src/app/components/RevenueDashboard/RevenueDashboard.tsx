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
const [refunds, setRefunds] = useState<any[]>([]);
const [wallets, setWallets] = useState<any[]>([]);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");
const [paymentFilter, setPaymentFilter] = useState("ALL");
const [dateFilter,setDateFilter] = useState("ALL");

const [selectedTransaction, setSelectedTransaction] =
  useState<any | null>(null);

const fetchRevenue = async () => {

  try {

    const [transactionRes, refundRes, walletRes] =
      await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/refunds"),
        fetch("/api/wallet"),
      ]);

    const transactionData = await transactionRes.json();
    const refundData = await refundRes.json();
    const walletData = await walletRes.json();

    if (transactionData.success) {
      setTransactions(transactionData.data || []);
    }

    if (refundData.success) {
      setRefunds(refundData.data || []);
    }

    if (walletData.success) {
      setWallets(walletData.data || []);
    }

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  fetchRevenue();

}, []);

const totalRevenue = transactions.reduce(
  (sum, t) =>
    t.status === "Success"
      ? sum + Number(t.amount || 0)
      : sum,
  0
);

const totalGST = transactions.reduce(
  (sum, t) =>
    sum + Number(t.gstAmount || 0),
  0
);

const pendingPayments = transactions
  .filter((t) => t.status === "Pending")
  .reduce(
    (sum, t) =>
      sum + Number(t.amount || 0),
    0
  );

const successfulPayments =
  transactions.filter(
    (t) => t.status === "Success"
  ).length;

const refundedAmount = refunds.reduce(
  (sum, r) =>
    r.refundStatus === "REFUNDED"
      ? sum + Number(r.amount || 0)
      : sum,
  0
);

const walletBalance = wallets.reduce(
  (sum, w) =>
    sum + Number(w.balance || 0),
  0
);

const walletHold = wallets.reduce(
  (sum, w) =>
    sum +
    Number(w.securityDepositHold || 0),
  0
);

const totalTransactions =
  transactions.length;

  const filteredTransactions = transactions.filter((txn) => {

  const keyword = search.toLowerCase();

  const matchesSearch =

    txn.transactionId?.toLowerCase().includes(keyword) ||

    txn.bookingId?.toLowerCase().includes(keyword) ||

    txn.userName?.toLowerCase().includes(keyword) ||

    txn.userId?.toLowerCase().includes(keyword);

  const matchesStatus =

    statusFilter === "ALL" ||

    txn.status === statusFilter;

  const matchesPayment =

    paymentFilter === "ALL" ||

    txn.paymentMethod === paymentFilter;

    const today = new Date();

const transactionDate = txn.createdAt
  ? new Date(txn.createdAt)
  : null;

let matchesDate = true;

if (dateFilter === "TODAY" && transactionDate) {

  matchesDate =
    transactionDate.toDateString() ===
    today.toDateString();

}

if (dateFilter === "THIS_MONTH" && transactionDate) {

  matchesDate =
    transactionDate.getMonth() === today.getMonth() &&
    transactionDate.getFullYear() === today.getFullYear();

}

if (dateFilter === "THIS_YEAR" && transactionDate) {

  matchesDate =
    transactionDate.getFullYear() === today.getFullYear();

}

  return (
    matchesSearch &&
    matchesStatus &&
    matchesPayment &&
    matchesDate
  );

});

const invoiceTransactions = filteredTransactions.filter(
  (txn) => txn.invoiceGenerated
);

return(

<PageContainer>

<DashboardHeader

title="Revenue Dashboard"

subtitle="Monitor revenue, GST collection, payment performance and financial reports."

/>

<KPIGrid>

<KPICard
title="Revenue"
value={`₹${totalRevenue.toLocaleString("en-IN")}`}
subtitle="Total Revenue"
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
value={`₹${totalGST.toLocaleString("en-IN")}`}
subtitle="Collected"
icon="🧾"
color="yellow"
/>

<KPICard
title="Pending"
value={`₹${pendingPayments.toLocaleString("en-IN")}`}
subtitle="Awaiting"
icon="⏳"
color="pink"
/>

<KPICard
title="Refunds"
value={`₹${refundedAmount.toLocaleString("en-IN")}`}
subtitle="Processed"
icon="💸"
color="red"
/>

<KPICard
title="Wallet Balance"
value={`₹${walletBalance.toLocaleString("en-IN")}`}
subtitle="Available"
icon="👛"
color="blue"
/>

<KPICard
title="Deposit Hold"
value={`₹${walletHold.toLocaleString("en-IN")}`}
subtitle="Security"
icon="🔒"
color="yellow"
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

 {invoiceTransactions.length === 0 && (

<tr>

<td
colSpan={9}
className="px-6 py-10 text-center text-gray-500"
>

No Invoice Records Found

</td>

</tr>

)}

{invoiceTransactions.map((txn) => (

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

{txn.invoiceNumber}

</td>

 <td className="px-6 py-5">

{txn.bookingId}

 </td>

<td className="px-6 py-5 text-center">

₹{(
Number(txn.amount || 0) -
Number(txn.gstAmount || 0)
).toLocaleString("en-IN")}

</td>

 <td className="px-6 py-5 text-center">

₹{Number(txn.gstAmount || 0).toLocaleString("en-IN")}

</td>

<td className="px-6 py-5 text-center">

₹{(
Number(txn.gstAmount || 0) / 2
).toFixed(2)}

</td>

 <td className="px-6 py-5 text-center">

₹{(
Number(txn.gstAmount || 0) / 2
).toFixed(2)}

 </td>

<td className="px-6 py-5 text-center font-bold text-green-600">

₹{Number(txn.amount || 0).toLocaleString("en-IN")}

 </td>

 <td className="px-6 py-5 text-center">

<StatusBadge status="active" />

 </td>

<td className="px-6 py-5 text-center">

{txn.createdAt
? new Date(txn.createdAt).toLocaleDateString("en-IN")
: "-"}

 </td>

 </tr>



))}

</tbody>

</table>

</div>

</DashboardCard>

<SectionHeader
title="Payment Transactions"
subtitle="Live payment transactions from MongoDB."
/>

<div className="mb-8">

<input

type="text"

placeholder="Search Transaction ID, Booking ID, Customer..."

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
"Success",
"Pending",
"Failed",
"Refunded",
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

<div className="mb-8 flex flex-wrap gap-3">

{[
"ALL",
"Cash",
"UPI",
"Card",
"Bank Transfer",
"Razorpay",
].map((method)=>(

<button

key={method}

onClick={()=>setPaymentFilter(method)}

className={`

rounded-xl

px-5

py-2

font-semibold

transition

${
paymentFilter===method

? "bg-blue-600 text-white"

: "bg-gray-100 hover:bg-blue-100"

}

`}

>

{method}

</button>

))}

</div>

<div className="mb-8 flex flex-wrap gap-3">

{[
"ALL",
"TODAY",
"THIS_MONTH",
"THIS_YEAR",
].map((filter)=>(

<button

key={filter}

onClick={()=>setDateFilter(filter)}

className={`

rounded-xl
px-5
py-2
font-semibold
transition

${
dateFilter===filter

? "bg-green-600 text-white"

: "bg-gray-100 hover:bg-green-100"

}

`}

>

{filter.replaceAll("_"," ")}

</button>

))}

</div>

<DashboardCard
title="Transactions"
subtitle="Payment Gateway Records"
>

  <button

onClick={() => {

const headers = [
"Transaction ID",
"Booking ID",
"Customer",
"Amount",
"GST",
"Payment Method",
"Status",
];

const rows = filteredTransactions.map((t)=>[
t.transactionId,
t.bookingId,
t.userName,
t.amount,
t.gstAmount,
t.paymentMethod,
t.status,
]);

const csv = [
headers,
...rows,
]
.map((e)=>e.join(","))
.join("\n");

const blob = new Blob(
[csv],
{
type:"text/csv",
}
);

const url =
window.URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href=url;

a.download="RevenueReport.csv";

a.click();

}}

className="
mb-6
rounded-xl
bg-[#0A1134]
px-6
py-3
font-bold
text-white
hover:bg-[#16204d]
transition
"

>

Export CSV

</button>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Txn ID
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Booking
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Customer
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Type
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
Invoice
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Refund
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Action
</th>

</tr>

</thead>

<tbody>

{filteredTransactions.length === 0 && (

<tr>

<td
colSpan={11}
className="px-6 py-10 text-center text-gray-500"
>

No Transactions Found

</td>

</tr>

)}

{filteredTransactions.map((txn) => (

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
{txn.bookingId || "-"}
</td>

<td className="px-6 py-5">
{txn.userName}
</td>

<td className="px-6 py-5 text-center">
{txn.transactionType}
</td>

<td className="px-6 py-5 text-center font-bold">
₹{Number(txn.amount || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
₹{Number(txn.gstAmount || 0).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
{txn.paymentMethod}
</td>

<td className="px-6 py-5 text-center">

{txn.invoiceGenerated ? (

<span className="font-semibold text-green-600">

{txn.invoiceNumber || "Generated"}

</span>

) : (

<span className="text-gray-500">

Pending

</span>

)}

</td>

<td className="px-6 py-5 text-center">

{txn.refundStatus || "None"}

</td>

<td className="px-6 py-5 text-center">

{txn.status === "Success" && (
<StatusBadge status="active" />
)}

{txn.status === "Pending" && (
<StatusBadge status="warning" />
)}

{txn.status === "Failed" && (
<StatusBadge status="danger" />
)}

{txn.status === "Refunded" && (
<StatusBadge status="inactive" />
)}

</td>

<td className="px-6 py-5 text-center">

<button
onClick={() => setSelectedTransaction(txn)}
className="
rounded-xl
bg-blue-600
px-4
py-2
font-semibold
text-white
hover:bg-blue-700
transition
"
>

View

</button>

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

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

<div className="rounded-2xl border border-green-100 bg-green-50 p-6">

<p className="text-sm text-gray-500">
Total  Revenue
</p>

<h2 className="mt-2 text-3xl font-black text-green-700">

₹{totalRevenue.toLocaleString("en-IN")}

</h2>

</div>

<div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

<p className="text-sm text-gray-500">

Transactions

</p>

<h2 className="mt-2 text-3xl font-black text-blue-700">

{totalTransactions}

</h2>

</div>

<div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6">

<p className="text-sm text-gray-500">

GST Collection

</p>

<h2 className="mt-2 text-3xl font-black text-yellow-700">

₹{totalGST.toLocaleString("en-IN")}

</h2>

</div>

<div className="rounded-2xl border border-pink-100 bg-pink-50 p-6">

<p className="text-sm text-gray-500">

Refund Amount

</p>

<h2 className="mt-2 text-3xl font-black text-pink-700">

₹{refundedAmount.toLocaleString("en-IN")}

</h2>

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

{refunds.length === 0 && (

<tr>

<td
colSpan={5}
className="px-6 py-10 text-center text-gray-500"
>

No Refund Records Found

</td>

</tr>

)}

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

₹{Number(refund.amount||0).toLocaleString("en-IN")}

</td>

<td className="px-6 py-5 text-center">

{refund.gatewayTxnId||"-"}

</td>

<td className="px-6 py-5 text-center">

{refund.refundStatus==="REFUNDED"&&(
<StatusBadge status="active"/>
)}

{refund.refundStatus==="APPROVED"&&(
<StatusBadge status="warning"/>
)}

{refund.refundStatus==="PROCESSING"&&(
<StatusBadge status="inactive"/>
)}

{refund.refundStatus==="REJECTED"&&(
<StatusBadge status="danger"/>
)}

{refund.refundStatus==="FAILED"&&(
<StatusBadge status="danger"/>
)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

{selectedTransaction && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">

<div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8">

<div className="mb-8 flex items-center justify-between">

<h2 className="text-3xl font-black text-[#0A1134]">

Transaction Details

</h2>

<button
onClick={() => setSelectedTransaction(null)}
className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
>

Close

</button>

</div>

<div className="grid gap-6 md:grid-cols-2">

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Transaction

</h3>

<p><b>Transaction ID :</b> {selectedTransaction.transactionId}</p>

<p><b>Booking ID :</b> {selectedTransaction.bookingId}</p>

<p><b>Transaction Type :</b> {selectedTransaction.transactionType}</p>

<p><b>Status :</b> {selectedTransaction.status}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Customer

</h3>

<p><b>User :</b> {selectedTransaction.userName}</p>

<p><b>User ID :</b> {selectedTransaction.userId}</p>

<p><b>Payment Method :</b> {selectedTransaction.paymentMethod}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Payment

</h3>

<p><b>Amount :</b> ₹{Number(selectedTransaction.amount || 0).toLocaleString("en-IN")}</p>

<p><b>GST :</b> ₹{Number(selectedTransaction.gstAmount || 0).toLocaleString("en-IN")}</p>

<p><b>Refund :</b> ₹{Number(selectedTransaction.refundAmount || 0).toLocaleString("en-IN")}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Gateway

</h3>

<p><b>Order ID :</b> {selectedTransaction.razorpayOrderId || "-"}</p>

<p><b>Payment ID :</b> {selectedTransaction.razorpayPaymentId || "-"}</p>

<p><b>Refund Status :</b> {selectedTransaction.refundStatus}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Invoice

</h3>

<p><b>Invoice Generated :</b> {selectedTransaction.invoiceGenerated ? "Yes" : "No"}</p>

<p><b>Invoice No :</b> {selectedTransaction.invoiceNumber || "-"}</p>

</div>

<div className="rounded-2xl border p-5">

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

</div>

<div className="rounded-2xl border p-5 md:col-span-2">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Remarks

</h3>

<p className="whitespace-pre-wrap">

{selectedTransaction.remarks || "No remarks available."}

</p>

</div>

</div>

</div>

</div>

)}

</PageContainer>

);

}