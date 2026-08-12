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
const [processingId, setProcessingId] = useState("");

useEffect(() => {

  const loadRiders = () => {

    fetch("/api/riders")
      .then((res) => res.json())
      .then((data) => {

        setRiders(data.data || []);

      })
      .catch(console.error)
      .finally(() => {

        setLoading(false);

      });

  };

  loadRiders();

  const interval = setInterval(loadRiders,10000);

  return () => clearInterval(interval);

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

const approveRider = async (id: string) => {
  if (processingId) return;

  setProcessingId(id);

  try {
    const response = await fetch(`/api/riders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approvalStatus: "Approved",
        kycStatus: "Approved",
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to approve KYC."
      );
    }

    const refreshed = await fetch("/api/riders");

    const refreshedData = await refreshed.json();

    setRiders(refreshedData.data || []);
  } catch (error) {
    console.error("KYC APPROVAL ERROR:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to approve KYC."
    );
  } finally {
    setProcessingId("");
  }
};

const rejectRider = async (id: string) => {
  if (processingId) return;

  const reason = prompt(
    "Enter KYC rejection reason"
  );

  if (!reason?.trim()) return;

  setProcessingId(id);

  try {
    const response = await fetch(
      `/api/riders/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvalStatus: "Rejected",
          kycStatus: "Rejected",
          rejectedReason: reason.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to reject KYC."
      );
    }

    const refreshed =
      await fetch("/api/riders");

    const refreshedData =
      await refreshed.json();

    setRiders(
      refreshedData.data || []
    );
  } catch (error) {
    console.error(
      "KYC REJECTION ERROR:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to reject KYC."
    );
  } finally {
    setProcessingId("");
  }
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
Aadhaar Front
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Aadhaar Back
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
DL Front
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
DL Back
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Photo
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Submitted On
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
      colSpan={12}
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
  {/* Rider ID */}
  <td className="px-6 py-5 font-semibold text-[#FF165E]">
    {rider.riderId}
  </td>

  {/* Rider */}
  <td className="px-6 py-5 font-semibold">
    {rider.fullName}
  </td>

  {/* Phone */}
  <td className="px-6 py-5">
    {rider.phone}
  </td>

  {/* Aadhaar Front */}
  <td className="px-6 py-5 text-center">
    {rider.aadhaarFrontUrl ? (
      <a
        href={rider.aadhaarFrontUrl}
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

  {/* Aadhaar Back */}
  <td className="px-6 py-5 text-center">
    {rider.aadhaarBackUrl ? (
      <a
        href={rider.aadhaarBackUrl}
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

  {/* DL Front */}
  <td className="px-6 py-5 text-center">
    {rider.licenseFrontUrl ? (
      <a
        href={rider.licenseFrontUrl}
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

  {/* DL Back */}
  <td className="px-6 py-5 text-center">
    {rider.licenseBackUrl ? (
      <a
        href={rider.licenseBackUrl}
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

  {/* Profile Photo */}
  <td className="px-6 py-5 text-center">
    {rider.profilePhotoUrl ? (
      <a
        href={rider.profilePhotoUrl}
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

  {/* Submitted On */}
  <td className="px-6 py-5 text-center text-sm">
    {rider.createdAt
      ? new Date(rider.createdAt).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "-"}
  </td>

  {/* KYC Status */}
  <td className="px-6 py-5 text-center">
    {rider.kycStatus === "Approved" && (
      <StatusBadge status="active" />
    )}

    {rider.kycStatus === "Pending" && (
      <StatusBadge status="warning" />
    )}

    {rider.kycStatus === "Rejected" && (
      <StatusBadge status="inactive" />
    )}
  </td>

  {/* Approve */}
  <td className="px-6 py-5 text-center">
    {rider.kycStatus === "Approved" ? (
      <span className="text-green-600 font-bold">
        Approved
      </span>
    ) : (
      <button
        disabled={processingId === rider._id}
        onClick={() => approveRider(rider._id)}
        className="
          px-5
          py-2
          rounded-xl
          bg-green-600
          text-white
          font-semibold
          hover:bg-green-700
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {processingId === rider._id
          ? "Approving..."
          : "Approve"}
      </button>
    )}
  </td>

  {/* Reject */}
  <td className="px-6 py-5 text-center">
    {rider.kycStatus === "Rejected" ? (
      <span className="text-red-600 font-bold">
        Rejected
      </span>
    ) : (
      <button
        disabled={processingId === rider._id}
        onClick={() => rejectRider(rider._id)}
        className="
          px-5
          py-2
          rounded-xl
          bg-red-600
          text-white
          font-semibold
          hover:bg-red-700
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {processingId === rider._id
          ? "Rejecting..."
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
</PageContainer>
);
}