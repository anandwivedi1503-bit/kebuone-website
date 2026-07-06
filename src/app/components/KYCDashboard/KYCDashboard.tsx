"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function KYCDashboard(){

const [riders,setRiders]=useState<any[]>([]);

useEffect(()=>{

fetch("/api/riders")

.then((res)=>res.json())

.then((data)=>{

setRiders(data.data||[]);

});

},[]);

const totalApplications=riders.length;

const pendingApplications=riders.filter(
(r)=>r.approvalStatus==="Under Review"
).length;

const approvedApplications=riders.filter(
(r)=>r.approvalStatus==="Approved"
).length;

const rejectedApplications=riders.filter(
(r)=>r.approvalStatus==="Rejected"
).length;

const approveRider=async(id:string)=>{

await fetch(`/api/riders/${id}`,{

method:"PATCH",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

kycStatus:"Verified",

approvalStatus:"Approved",

approvedAt:new Date(),

}),

});

location.reload();

};

const rejectRider=async(id:string)=>{

const reason=prompt("Enter rejection reason");

if(!reason) return;

await fetch(`/api/riders/${id}`,{

method:"PATCH",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

kycStatus:"Rejected",

approvalStatus:"Rejected",

activeRide:false,

rejectedReason:reason,

}),

});

location.reload();

};

return(

<PageContainer>

<DashboardHeader

title="KYC Verification Dashboard"

subtitle="Review rider documents and approve KYC verification requests."

/>

<KPIGrid>

<KPICard
title="Applications"
value={totalApplications}
subtitle="Total Requests"
icon="🪪"
color="pink"
/>

<KPICard
title="Pending"
value={pendingApplications}
subtitle="Under Review"
icon="⏳"
color="yellow"
/>

<KPICard
title="Approved"
value={approvedApplications}
subtitle="Verified"
icon="✅"
color="green"
/>

<KPICard
title="Rejected"
value={rejectedApplications}
subtitle="Declined"
icon="❌"
color="red"
/>

</KPIGrid>

<SectionHeader

title="KYC Applications"

subtitle="Review submitted rider verification documents."

/>

<DashboardCard

title="Verification Requests"

subtitle="Live KYC Records"

>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Rider
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Phone
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Aadhaar
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Driving License
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Photo
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

{riders.map((rider)=>(

<tr
key={rider._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{rider.fullName}
</td>

<td className="px-6 py-5">
{rider.phone}
</td>

<td className="px-6 py-5 text-center">

<a
href={rider.aadhaarFileUrl}
target="_blank"
className="
text-[#FF165E]
font-semibold
hover:underline
"
>
View
</a>

</td>

<td className="px-6 py-5 text-center">

<a
href={rider.licenseFileUrl}
target="_blank"
className="
text-[#FF165E]
font-semibold
hover:underline
"
>
View
</a>

</td>

<td className="px-6 py-5 text-center">

<a
href={rider.profilePhotoUrl}
target="_blank"
className="
text-[#FF165E]
font-semibold
hover:underline
"
>
View
</a>

</td>

<td className="px-6 py-5 text-center">

{rider.kycStatus==="Verified"&&(
<StatusBadge status="active"/>
)}

{rider.kycStatus==="Pending"&&(
<StatusBadge status="warning"/>
)}

{rider.kycStatus==="Rejected"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center">

{rider.approvalStatus==="Approved"?(

<span className="text-green-600 font-bold">
Approved
</span>

):(

<button
onClick={()=>approveRider(rider._id)}
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

{rider.approvalStatus==="Rejected"?(

<span className="text-red-600 font-bold">
Rejected
</span>

):(

<button
onClick={()=>rejectRider(rider._id)}
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