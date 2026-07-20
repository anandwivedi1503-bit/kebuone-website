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
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/riders")
    .then((res) => res.json())
    .then((data) => {
      setRiders(data.data || []);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      setLoading(false);
    });
}, []);

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

body: JSON.stringify({
  kycStatus: "Approved",
  approvalStatus: "Approved",
   approvedAt: new Date(),
   approvedBy: "Admin",
   activeRide: false,
}),

});

const refreshed = await fetch("/api/riders");
const refreshedData = await refreshed.json();
setRiders(refreshedData.data || []);

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

approvedBy:"",

}),

});

const refreshed = await fetch("/api/riders");
const refreshedData = await refreshed.json();
setRiders(refreshedData.data || []);

};

if (loading) {
  return (
    <PageContainer>
      <DashboardHeader
        title="KYC Verification Dashboard"
        subtitle="Loading KYC applications..."
      />
    </PageContainer>
  );
}

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

<table className="min-w-[1300px] w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

  <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Rider ID
</th>

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

  {riders.length === 0 && (
  <tr>
    <td
      colSpan={9}
      className="text-center py-12 text-gray-500"
    >
      No KYC applications found.
    </td>
  </tr>
)}

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
<td className="px-6 py-5 font-semibold text-[#FF165E]">
{rider.riderId}
</td>

<td className="px-6 py-5 font-semibold">
{rider.fullName}
</td>

<td className="px-6 py-5">
{rider.phone}
</td>

<td className="px-6 py-5 text-center">

{rider.aadhaarFileUrl ? (
  <a
    href={rider.aadhaarFileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#FF165E] font-semibold hover:underline"
  >
    View
  </a>
) : (
  <span className="text-gray-400">
    Not Uploaded
  </span>
)}

</td>

<td className="px-6 py-5 text-center">

{rider.licenseFileUrl ? (
  <a
    href={rider.licenseFileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#FF165E] font-semibold hover:underline"
  >
    View
  </a>
) : (
  <span className="text-gray-400">
    Not Uploaded
  </span>
)}

</td>

<td className="px-6 py-5 text-center">

{rider.profilePhotoUrl ? (

<a
href={rider.profilePhotoUrl}
target="_blank"
rel="noopener noreferrer"
className="
text-[#FF165E]
font-semibold
hover:underline
"
>
View
</a>

) : (

<span className="text-gray-400">
Not Uploaded
</span>

)}

</td>

<td className="px-6 py-5 text-center">

{rider.kycStatus==="Approved"&&(
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