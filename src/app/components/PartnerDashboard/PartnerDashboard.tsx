"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function PartnerDashboard(){

const [partners,setPartners]=useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [updating, setUpdating] = useState("");
const [search, setSearch] = useState("");

const [stageFilter, setStageFilter] = useState("ALL");

const [priorityFilter, setPriorityFilter] = useState("ALL");

const loadPartners = async () => {
  try {
    setLoading(true);

    const res = await fetch("/api/partners");
    const data = await res.json();

    setPartners(data.data || []);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadPartners();
}, []);

const totalApplications=partners.length;

const pendingApplications=partners.filter(
(p)=>p.applicationStatus==="Pending"
).length;

const approvedApplications=partners.filter(
(p)=>p.applicationStatus==="Approved"
).length;

const rejectedApplications=partners.filter(
(p)=>p.applicationStatus==="Rejected"
).length;

const approvePartner = async (id: string) => {
  setUpdating(id);

  await fetch(`/api/partners/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  applicationStatus: "Approved",
  applicationStage: "Approved",
  reviewedDate: new Date(),
}),
  });

  await loadPartners();

  setUpdating("");
};

const rejectPartner = async (id: string) => {
  setUpdating(id);

  await fetch(`/api/partners/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationStatus: "Rejected",
      applicationStage: "Rejected",
      reviewedDate: new Date(),
    }),
  });

  await loadPartners();

  setUpdating("");
};

if (loading) {
  return (
    <PageContainer>
      <div className="flex items-center justify-center h-96 text-xl font-semibold">
        Loading partner applications...
      </div>
    </PageContainer>
  );
}

return(

<PageContainer>

<DashboardHeader

title="Partner Applications"

subtitle="Review and manage Kebu One franchise and partnership applications."

/>

<KPIGrid>

<KPICard
title="Applications"
value={totalApplications}
subtitle="Total"
icon="🤝"
color="pink"
/>

<KPICard
title="Pending"
value={pendingApplications}
subtitle="Waiting Review"
icon="⏳"
color="yellow"
/>

<KPICard
title="Approved"
value={approvedApplications}
subtitle="Accepted"
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

title="Partner Applications"

subtitle="Review all incoming partner requests."

/>

<DashboardCard

title="Applications"

subtitle="Live Partner Records"

>

  <div className="mb-6 grid gap-4 md:grid-cols-3">

<input
type="text"
placeholder="Search Name, Phone, City..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="rounded-xl border border-gray-200 px-4 py-3"
/>

<select
value={stageFilter}
onChange={(e)=>setStageFilter(e.target.value)}
className="rounded-xl border border-gray-200 px-4 py-3"
>

<option value="ALL">All Stages</option>

<option>New</option>

<option>Under Review</option>

<option>Meeting Scheduled</option>

<option>Documents Pending</option>

<option>Documents Verified</option>

<option>Business Evaluation</option>

<option>Approved</option>

<option>Agreement Signed</option>

<option>Onboarding</option>

<option>Live Partner</option>

<option>Rejected</option>

</select>

<select
value={priorityFilter}
onChange={(e)=>setPriorityFilter(e.target.value)}
className="rounded-xl border border-gray-200 px-4 py-3"
>

<option value="ALL">All Priority</option>

<option>High</option>

<option>Medium</option>

<option>Low</option>

</select>

</div>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Name
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Phone
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
City
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Partner Type
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Investment
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

{partners
  .filter((partner) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      partner.fullName?.toLowerCase().includes(keyword) ||
      partner.phone?.includes(keyword) ||
      partner.city?.toLowerCase().includes(keyword) ||
      partner.organizationName?.toLowerCase().includes(keyword);

    const matchesStage =
      stageFilter === "ALL" ||
      partner.applicationStage === stageFilter;

    const matchesPriority =
      priorityFilter === "ALL" ||
      partner.priority === priorityFilter;

    return matchesSearch && matchesStage && matchesPriority;
  })

  .map((partner) => (

    <tr
      key={partner._id}
      className="
      border-b
      border-pink-50
      hover:bg-pink-50/40
      transition
      "
    >

     <td className="px-6 py-5 font-semibold">
  {partner.fullName}
</td>

<td className="px-6 py-5">
  {partner.phone}
</td>

<td className="px-6 py-5">
  {partner.city}
</td>

<td className="px-6 py-5 text-center">
  {partner.partnerType}
</td>

<td className="px-6 py-5 text-center font-bold">
  {partner.investmentCapacity}
</td>

<td className="px-6 py-5 text-center">

  {partner.applicationStatus === "Approved" && (
    <StatusBadge status="active" />
  )}

  {partner.applicationStatus === "Pending" && (
    <StatusBadge status="warning" />
  )}

  {partner.applicationStatus === "Rejected" && (
    <StatusBadge status="inactive" />
  )}

</td>

<td className="px-6 py-5 text-center">

  {partner.applicationStatus === "Pending" ? (
    <button
      disabled={updating === partner._id}
      onClick={() => approvePartner(partner._id)}
      className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
    >
      {updating === partner._id ? "Approving..." : "Approve"}
    </button>
  ) : (
    <span className="text-gray-400 font-semibold">—</span>
  )}

</td>

<td className="px-6 py-5 text-center">

  {partner.applicationStatus === "Pending" ? (
    <button
      disabled={updating === partner._id}
      onClick={() => rejectPartner(partner._id)}
      className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
    >
      {updating === partner._id ? "Rejecting..." : "Reject"}
    </button>
  ) : (
    <span className="text-gray-400 font-semibold">—</span>
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
