"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { Mail, Phone } from "lucide-react";
import { startOpsPoll } from "@/lib/opsPoll";

import {
  PARTNER_SEGMENTS,
  type PartnerSegmentId,
  partnerMatchesSegment,
  partnerSheetRows,
} from "@/lib/partnerSegments";
import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import DashboardActions from "../DashboardUI/DashboardActions";
import StatusBadge from "../DashboardUI/StatusBadge";

type ChannelFilter = PartnerSegmentId;

export default function PartnerDashboard() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [channel, setChannel] = useState<ChannelFilter>("ALL");
  const [openId, setOpenId] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadPartners = async (blankDesk = false) => {
    try {
      if (blankDesk) setLoading(true);
      const res = await fetch("/api/partners?limit=120", { cache: "no-store" });
      const data = await res.json();
      setPartners(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPartners(true);
    return startOpsPoll(() => {
      void loadPartners(false);
    });
  }, []);

  const rows = useMemo(() => {
    const keyword = search.toLowerCase();
    return partners.filter((partner) => {
      const matchesSearch =
        partner.fullName?.toLowerCase().includes(keyword) ||
        partner.phone?.includes(keyword) ||
        partner.email?.toLowerCase().includes(keyword) ||
        partner.city?.toLowerCase().includes(keyword) ||
        partner.organizationName?.toLowerCase().includes(keyword) ||
        partner.partnerType?.toLowerCase().includes(keyword);

      const matchesStage = stageFilter === "ALL" || partner.applicationStage === stageFilter;
      const matchesChannel = partnerMatchesSegment(partner, channel);

      return matchesSearch && matchesStage && matchesChannel;
    });
  }, [partners, search, stageFilter, channel]);

  const pendingApplications = partners.filter((p) => p.applicationStatus === "Pending").length;
  const approvedApplications = partners.filter((p) => p.applicationStatus === "Approved").length;
  const selectedSegment =
    PARTNER_SEGMENTS.find((item) => item.id === channel)?.label || "All channels";
  const sheetName =
    channel === "ALL"
      ? "partner-applications"
      : `partner-${selectedSegment.toLowerCase().replace(/\s+/g, "-")}`;

  const patchPartner = async (id: string, body: Record<string, unknown>) => {
    setUpdating(id);
    await fetch(`/api/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await loadPartners(false);
    setUpdating("");
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-96 items-center justify-center text-xl font-semibold">
          Loading partner applications...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardHeader
        title="Partner Applications"
        subtitle="Dealer, distributor and franchise forms land here. Approve, reject and contact from one desk."
      />

      <DashboardActions
        filename={sheetName}
        rows={partnerSheetRows(rows)}
        onRefresh={() => void loadPartners(false)}
      />

      <KPIGrid>
        <KPICard
          title="All applications"
          value={partners.length}
          subtitle={channel === "ALL" ? "Showing all" : "Tap to show all"}
          icon="🤝"
          color="pink"
          selected={channel === "ALL"}
          onClick={() => setChannel("ALL")}
        />
        {PARTNER_SEGMENTS.map((segment) => (
          <KPICard
            key={segment.id}
            title={segment.label}
            value={partners.filter((partner) => partnerMatchesSegment(partner, segment.id)).length}
            subtitle={channel === segment.id ? "Showing this list" : segment.subtitle}
            icon={segment.icon}
            color={segment.color}
            selected={channel === segment.id}
            onClick={() => setChannel(segment.id)}
          />
        ))}
        <KPICard title="Pending" value={pendingApplications} subtitle={`${approvedApplications} approved`} icon="⏳" color="red" />
      </KPIGrid>

      <SectionHeader
        title="Incoming forms"
        subtitle={`Tap a segment above to highlight that list. Sheet download and print use ${selectedSegment.toLowerCase()}.`}
      />

      <DashboardCard title="Applications" subtitle="Review, approve, call or email">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search name, phone, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3"
          />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ChannelFilter)}
            className="rounded-xl border border-gray-200 px-4 py-3"
          >
            <option value="ALL">All channels</option>
            {PARTNER_SEGMENTS.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.label}
              </option>
            ))}
          </select>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3"
          >
            <option value="ALL">All Stages</option>
            <option>New</option>
            <option>Under Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-3xl">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-pink-100 bg-pink-50">
                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">Applicant</th>
                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">Channel</th>
                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">City</th>
                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">Investment</th>
                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">Status</th>
                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">Contact</th>
                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">Decide</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center font-medium text-gray-500">
                    No partner applications found
                  </td>
                </tr>
              )}
              {rows.map((partner) => (
                <Fragment key={partner._id}>
                  <tr className="border-b border-pink-50 transition hover:bg-pink-50/40">
                    <td className="px-6 py-5">
                      <p className="font-semibold">{partner.fullName}</p>
                      <p className="text-sm text-gray-500">{partner.organizationName}</p>
                    </td>
                    <td className="px-6 py-5 text-sm">{partner.partnerType}</td>
                    <td className="px-6 py-5">
                      {partner.city}
                      {partner.state ? `, ${partner.state}` : ""}
                    </td>
                    <td className="px-6 py-5 text-center font-bold">{partner.investmentCapacity}</td>
                    <td className="px-6 py-5 text-center">
                      {partner.applicationStatus === "Approved" && <StatusBadge status="active" />}
                      {partner.applicationStatus === "Pending" && <StatusBadge status="warning" />}
                      {partner.applicationStatus === "Rejected" && <StatusBadge status="inactive" />}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <a
                          href={`tel:+91${partner.phone}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#1F6B4A] px-3 py-2 text-xs font-semibold text-white"
                        >
                          <Phone size={14} />
                          Call
                        </a>
                        <a
                          href={`mailto:${partner.email}?subject=${encodeURIComponent(`EVUDDY ${partner.partnerType} application`)}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold"
                        >
                          <Mail size={14} />
                          Email
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {partner.applicationStatus === "Pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            disabled={updating === partner._id}
                            onClick={() =>
                              patchPartner(partner._id, {
                                applicationStatus: "Approved",
                                applicationStage: "Approved",
                                approvedDate: new Date(),
                              })
                            }
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            disabled={updating === partner._id}
                            onClick={() =>
                              patchPartner(partner._id, {
                                applicationStatus: "Rejected",
                                applicationStage: "Rejected",
                              })
                            }
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-sm font-semibold text-[#1F6B4A]"
                          onClick={() => {
                            setOpenId(openId === partner._id ? "" : partner._id);
                            setRemarks(partner.adminRemarks || "");
                          }}
                        >
                          Notes
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr key={`${partner._id}-detail`} className="border-b border-pink-50 bg-[#FBF9F5]">
                    <td colSpan={7} className="px-6 py-4 text-sm text-gray-600">
                      <p>
                        {partner.phone} · {partner.email}
                        {partner.territory ? ` · ${partner.territory}` : ""}
                      </p>
                      {partner.message ? <p className="mt-1 whitespace-pre-wrap">{partner.message}</p> : null}
                      {openId === partner._id || partner.applicationStatus === "Pending" ? (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <input
                            value={openId === partner._id ? remarks : partner.adminRemarks || ""}
                            onChange={(e) => {
                              setOpenId(partner._id);
                              setRemarks(e.target.value);
                            }}
                            placeholder="Admin notes after the call"
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2"
                          />
                          <button
                            disabled={updating === partner._id}
                            onClick={() =>
                              patchPartner(partner._id, {
                                adminRemarks: remarks,
                                applicationStage:
                                  partner.applicationStage === "New" ? "Under Review" : partner.applicationStage,
                              })
                            }
                            className="rounded-xl border border-[#1F6B4A] px-4 py-2 text-sm font-semibold text-[#1F6B4A]"
                          >
                            Save notes
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
