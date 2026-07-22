"use client";

import { useEffect, useMemo, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import ActionButton from "../DashboardUI/ActionButton";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function WalletDashboard() {

const [wallets,setWallets]=useState<any[]>([]);
const [transactions,setTransactions]=useState<any[]>([]);

const [search,setSearch]=useState("");
const [statusFilter, setStatusFilter] = useState("ALL");

const [transactionFilter, setTransactionFilter] = useState("ALL");

const [selectedWallet,setSelectedWallet]=useState<any>(null);
const [showDetails,setShowDetails]=useState(false);

const [showRecharge,setShowRecharge]=useState(false);
const [showDebit,setShowDebit]=useState(false);
const [showHistory,setShowHistory]=useState(false);
const [amount,setAmount]=useState(0);
const [remarks,setRemarks]=useState("");
const [loading,setLoading]=useState(false);
const [history,setHistory]=useState<any[]>([]);

useEffect(()=>{

loadWallets();
loadTransactions();

},[]);

const loadWallets=async()=>{

const res=await fetch("/api/wallet");

const data=await res.json();

if (!data.success) {
  alert(data.message || "Unable to load wallets.");
  return;
}

if(data.success){

setWallets(data.data);

}

};

const loadTransactions=async()=>{

const res=await fetch("/api/wallet-transactions");

const data=await res.json();
if (!data.success) {
  alert(data.message || "Unable to load transactions.");
  return;
}

if(data.success){

setTransactions(data.data);

}

};

const rechargeWallet=async()=>{

if(!selectedWallet) return;

setLoading(true);

const res=await fetch("/api/wallet/recharge",{

method:"POST",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

walletId:selectedWallet._id,

amount,

remarks,

})

});

const data=await res.json();

setLoading(false);

if(data.success){

setShowRecharge(false);

setAmount(0);

setRemarks("");

loadWallets();

loadTransactions();

alert("Wallet Recharged Successfully");

}else{

alert(data.message||"Recharge Failed");

}

};

const debitWallet=async()=>{

if(!selectedWallet) return;

setLoading(true);

const res=await fetch("/api/wallet/debit",{

method:"POST",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

walletId:selectedWallet._id,

amount,

remarks,

})

});



const data=await res.json();

setLoading(false);

if(data.success){

setShowDebit(false);

setAmount(0);

setRemarks("");

loadWallets();

loadTransactions();

alert("Wallet Debited Successfully");

}else{

alert(data.message||"Debit Failed");

}

};

const loadHistory = async (riderId: string) => {

  const res = await fetch(`/api/wallet/history/${riderId}`);

  const data = await res.json();

  if (data.success) {
    setHistory(data.data);
  }

};

const toggleWalletStatus = async (
walletId:string,
status:string
)=>{

const res = await fetch(
`/api/wallet/${walletId}`,
{

method:"PATCH",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

status:
status==="Active"
? "Blocked"
: "Active",

}),

}
);

const data = await res.json();

if(data.success){

loadWallets();

}else{

alert("Unable to update wallet.");

}

};

const totalBalance=wallets.reduce(

(sum,w)=>sum+(w.balance||0),

0

);

const totalCredits = transactions
.filter((t) =>
  ["Admin Credit", "Recharge"].includes(t.transactionType)
)
.reduce((sum, t) => sum + Number(t.amount || 0), 0);

const totalDebits = transactions
.filter((t) =>
  [
    "Admin Debit",
    "Booking Payment",
  ].includes(t.transactionType)
)
.reduce((sum, t) => sum + Number(t.amount || 0), 0);
const filteredWallets = useMemo(() => {

  return wallets.filter((wallet) => {

    const keyword = search.toLowerCase();

    const matchesSearch =

      wallet.riderId?.toLowerCase().includes(keyword) ||

      wallet.userName?.toLowerCase().includes(keyword) ||

      wallet.phone?.includes(search);

    const matchesStatus =

      statusFilter === "ALL" ||

      wallet.status === statusFilter;

    return matchesSearch && matchesStatus;

  });

}, [wallets, search, statusFilter]);

return(

<PageContainer>

<DashboardHeader
title="Wallet Dashboard"
subtitle="Manage rider wallets, balances, recharges and deductions."
/>

<KPIGrid>

<KPICard
title="Wallets"
value={wallets.length}
subtitle="Registered"
icon="👛"
color="pink"
/>

<KPICard
title="Balance"
value={`₹${totalBalance}`}
subtitle="Available"
icon="💰"
color="green"
/>

<KPICard
title="Credits"
value={`₹${totalCredits}`}
subtitle="Total Added"
icon="⬆️"
color="blue"
/>

<KPICard
title="Debits"
value={`₹${totalDebits}`}
subtitle="Total Used"
icon="⬇️"
color="yellow"
/>

<KPICard
title="Average Balance"
value={`₹${
wallets.length
? Math.round(totalBalance / wallets.length)
: 0
}`}
subtitle="Per Wallet"
icon="📊"
color="blue"
/>

<KPICard
title="Security Hold"
value={`₹${wallets.reduce(
(sum,w)=>sum+(w.securityDepositHold||0),
0
)}`}
subtitle="Deposits"
icon="🔒"
color="yellow"
/>

</KPIGrid>

<SectionHeader
title="Wallet Search"
subtitle="Search rider wallet by Rider ID, Name or Phone."
/>

<div className="mb-8">

<input
type="text"
placeholder="Search Wallet..."
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
"Active",
"Blocked",
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

<SectionHeader
title="Wallet Analytics"
subtitle="Overall wallet statistics."
/>

<DashboardCard
title="Analytics"
subtitle="Wallet Overview"
>

<div className="grid gap-6 md:grid-cols-4">

<div className="rounded-2xl bg-green-50 border border-green-100 p-6">

<p className="text-sm text-gray-500">
Wallet Balance
</p>

<h2 className="mt-2 text-3xl font-black text-green-700">

₹{totalBalance.toLocaleString("en-IN")}

</h2>

</div>

<div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">

<p className="text-sm text-gray-500">

Transactions

</p>

<h2 className="mt-2 text-3xl font-black text-blue-700">

{transactions.length}

</h2>

</div>

<div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-6">

<p className="text-sm text-gray-500">

Credits

</p>

<h2 className="mt-2 text-3xl font-black text-yellow-700">

₹{totalCredits.toLocaleString("en-IN")}

</h2>

</div>

<div className="rounded-2xl bg-pink-50 border border-pink-100 p-6">

<p className="text-sm text-gray-500">

Debits

</p>

<h2 className="mt-2 text-3xl font-black text-pink-700">

₹{totalDebits.toLocaleString("en-IN")}

</h2>

</div>

</div>

</DashboardCard>

</div>

<SectionHeader
title="Transaction Analytics"
subtitle="Wallet transaction statistics."
/>

<KPIGrid>

<KPICard
title="Recharge"
value={
transactions.filter(
t=>t.transactionType==="Admin Credit"
).length
}
subtitle="Credits"
icon="➕"
color="green"
/>

<KPICard
title="Debit"
value={
transactions.filter(
t=>t.transactionType==="Admin Debit"
).length
}
subtitle="Debits"
icon="➖"
color="red"
/>

<KPICard
title="Refund"
value={
transactions.filter(
t=>t.transactionType==="Refund"
).length
}
subtitle="Refunds"
icon="💸"
color="blue"
/>

<KPICard
title="Transactions"
value={transactions.length}
subtitle="Overall"
icon="📊"
color="yellow"
/>

</KPIGrid>

<DashboardCard
title="Wallet Records"
subtitle="All registered rider wallets."
>

<div className="mb-6">

<button

onClick={() => {

const headers = [

"Rider ID",

"Name",

"Phone",

"Balance",

"Deposit Hold",

"Status",

];

const rows = filteredWallets.map((w)=>[

w.riderId,

w.userName,

w.phone,

w.balance,

w.securityDepositHold,

w.status,

]);

const csv = [

headers,

...rows,

]

.map((e)=>e.join(","))

.join("\n");

const blob = new Blob([csv],{

type:"text/csv",

});

const url=window.URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="WalletReport.csv";

a.click();

}}

className="

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

</div>

<div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left">Rider ID</th>

<th className="px-6 py-5 text-left">Name</th>

<th className="px-6 py-5 text-center">Phone</th>

<th className="px-6 py-5 text-center">Balance</th>

<th className="px-6 py-5 text-center">Deposit</th>

<th className="px-6 py-5 text-center">Status</th>

<th className="px-6 py-5 text-center">Actions</th>

</tr>

</thead>

<tbody>

{filteredWallets.map((wallet)=>(

<tr
key={wallet._id}
className="border-b border-pink-50 hover:bg-pink-50/40 transition"
>

<td className="px-6 py-5 font-semibold">
{wallet.riderId}
</td>

<td className="px-6 py-5">
{wallet.userName}
</td>

<td className="px-6 py-5 text-center">
{wallet.phone}
</td>

<td className="px-6 py-5 text-center font-bold text-green-600">
₹{Number(wallet.balance).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">
₹{Number(wallet.securityDepositHold).toLocaleString("en-IN")}
</td>

<td className="px-6 py-5 text-center">

<StatusBadge
status={wallet.status==="Active"?"active":"inactive"}
/>

</td>

<td className="px-6 py-5">

<div className="flex gap-2 justify-center">

    <button
onClick={()=>{
setSelectedWallet(wallet);
setShowDetails(true);
}}
className="
px-4
py-2
rounded-xl
bg-blue-600
text-white
"
>

View

</button>

<button
onClick={()=>{
setSelectedWallet(wallet);
setShowRecharge(true);
}}
className="px-4 py-2 rounded-xl bg-green-600 text-white"
>
Recharge
</button>

<button
onClick={()=>{
setSelectedWallet(wallet);
setShowDebit(true);
}}
className="px-4 py-2 rounded-xl bg-red-600 text-white"
>
Debit
</button>

<button
onClick={()=>{

setSelectedWallet(wallet);

loadHistory(wallet.riderId);

setShowHistory(true);

}}
className="px-4 py-2 rounded-xl bg-blue-600 text-white"
>
History
</button>

<button

onClick={()=>{

toggleWalletStatus(
wallet._id,
wallet.status
);

}}

className={`
px-4
py-2
rounded-xl
text-white

${
wallet.status==="Active"

? "bg-orange-600"

: "bg-green-600"

}
`}

>

{wallet.status==="Active"

? "Freeze"

: "Activate"}

</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

{showRecharge&&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">

<h2 className="text-2xl font-bold mb-6">

Recharge Wallet

</h2>

<input
type="number"
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(Number(e.target.value))}
className="w-full border rounded-xl p-3 mb-4"
/>

<textarea
placeholder="Remarks"
value={remarks}
onChange={(e)=>setRemarks(e.target.value)}
className="w-full border rounded-xl p-3 mb-6"
/>

<div className="flex gap-4">

<ActionButton
onClick={rechargeWallet}
disabled={loading}
>

{loading?"Processing...":"Recharge"}

</ActionButton>

<button
onClick={()=>{

setShowRecharge(false);

setAmount(0);

setRemarks("");

}}
className="px-6 py-3 rounded-xl border"
>

Cancel

</button>

</div>

</div>

</div>

)}

{showDebit&&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">

<h2 className="text-2xl font-bold mb-6">

Debit Wallet

</h2>

<input
type="number"
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(Number(e.target.value))}
className="w-full border rounded-xl p-3 mb-4"
/>

<textarea
placeholder="Remarks"
value={remarks}
onChange={(e)=>setRemarks(e.target.value)}
className="w-full border rounded-xl p-3 mb-6"
/>

<div className="flex gap-4">

<ActionButton
onClick={debitWallet}
disabled={loading}
>

{loading?"Processing...":"Debit"}

</ActionButton>

<button
onClick={()=>{

setShowDebit(false);

setAmount(0);

setRemarks("");

}}
className="px-6 py-3 rounded-xl border"
>

Cancel

</button>

</div>

</div>

</div>

)}

{showHistory&&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-3xl p-8 w-full max-w-5xl mx-4 max-h-[80vh] overflow-auto">

<div className="flex justify-between items-center mb-6">

<h2 className="text-2xl font-bold">

Wallet History

</h2>

<button
onClick={()=>setShowHistory(false)}
className="text-xl"
>

✕

</button>

</div>

<table className="min-w-full">

<thead>

<tr className="bg-pink-50">

<th className="px-5 py-4 text-left">

Date

</th>

<th className="px-5 py-4 text-left">

Type

</th>

<th className="px-5 py-4 text-center">

Amount

</th>

<th className="px-5 py-4 text-center">

Balance

</th>

<th className="px-5 py-4">

Remarks

</th>

</tr>

</thead>

<tbody>

{history.map((txn)=>(

<tr
key={txn._id}
className="border-b border-pink-50"
>

<td className="px-5 py-4">

{new Date(txn.createdAt).toLocaleString()}

</td>

<td className="px-5 py-4">

{txn.transactionType}

</td>

<td className="px-5 py-4 text-center font-bold">

₹{Number(txn.amount || 0).toLocaleString("en-IN")}

</td>

<td className="px-5 py-4 text-center">

₹{Number(txn.balanceAfter || 0).toLocaleString("en-IN")}

</td>

<td className="px-5 py-4">

{txn.remarks}

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)}

{showDetails && selectedWallet && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">

<div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8">

<div className="mb-8 flex items-center justify-between">

<h2 className="text-3xl font-black text-[#0A1134]">

Wallet Details

</h2>

<button

onClick={()=>setShowDetails(false)}

className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"

>

Close

</button>

</div>

<div className="grid gap-6 md:grid-cols-2">

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Rider

</h3>

<p><b>Rider ID :</b> {selectedWallet.riderId}</p>

<p><b>Name :</b> {selectedWallet.userName}</p>

<p><b>Phone :</b> {selectedWallet.phone}</p>

<p><b>Status :</b> {selectedWallet.status}</p>

</div>

<div className="rounded-2xl border p-5">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Wallet

</h3>

<p><b>Balance :</b> ₹{selectedWallet.balance}</p>

<p><b>Deposit Hold :</b> ₹{selectedWallet.securityDepositHold}</p>

<p><b>Total Recharge :</b> ₹{selectedWallet.totalRecharge}</p>

<p><b>Total Spent :</b> ₹{selectedWallet.totalSpent}</p>

<p><b>Total Refund :</b> ₹{selectedWallet.totalRefund}</p>

</div>

<div className="rounded-2xl border p-5 md:col-span-2">

<h3 className="mb-4 text-xl font-bold text-[#FF165E]">

Timeline

</h3>

<p>

<b>Created :</b>

<br/>

{selectedWallet.createdAt

? new Date(selectedWallet.createdAt).toLocaleString("en-IN")

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