import type { AdminSessionInfo } from "@/lib/adminAuth";
import { DASHBOARD_LABELS } from "@/lib/adminRoles";
import { llmChat, llmConfigured } from "@/lib/llmChat";
import { redactOpsHitsForLlm } from "@/lib/redactOpsPii";
import {
  parseOpsQuery,
  universalOpsSearch,
  type OpsHit,
  type OpsStat,
} from "@/lib/opsSearch";

export type { OpsHit, OpsStat };

export type OpsAction = {
  type: "open_dashboard";
  dashboard: string;
  label: string;
  autoNavigate?: boolean;
  focusQuery?: string;
};

export type OpsAssistantResult = {
  answer: string;
  hits: OpsHit[];
  stats: OpsStat[];
  action?: OpsAction;
  elapsedMs?: number;
  mode?: "ai" | "search";
};

const DASHBOARD_ALIASES: { keys: RegExp; id: string }[] = [
  { keys: /\b(booking|bookings|yard desk|ride desk)\b/i, id: "bookings" },
  { keys: /\b(rent to own|rto)\b/i, id: "renttoown" },
  { keys: /\b(fleet)\b/i, id: "fleet" },
  { keys: /\b(vehicle|vehicles|scooter|scooters|bike management)\b/i, id: "vehicles" },
  { keys: /\b(hub management|manage hubs)\b/i, id: "hubmanagement" },
  { keys: /\b(hub dashboard|hub|yard)\b/i, id: "hub" },
  { keys: /\b(city|cities)\b/i, id: "citymanagement" },
  { keys: /\b(battery swap|swap)\b/i, id: "swap" },
  { keys: /\b(batteries|battery)\b/i, id: "battery" },
  { keys: /\b(iot|gps|tracking)\b/i, id: "iot" },
  { keys: /\b(wallet|wallets)\b/i, id: "wallet" },
  { keys: /\b(revenue)\b/i, id: "revenue" },
  { keys: /\b(partner|partners|fleet partner)\b/i, id: "partner" },
  { keys: /\b(user|users|rider|riders)\b/i, id: "users" },
  { keys: /\b(kyc)\b/i, id: "kyc" },
  { keys: /\b(support|ticket|tickets|complaint)\b/i, id: "support" },
  { keys: /\b(transaction|transactions|payments list)\b/i, id: "transactions" },
  { keys: /\b(analytics|stats board)\b/i, id: "analytics" },
  { keys: /\b(refund|refunds)\b/i, id: "refunds" },
  { keys: /\b(audit|logs)\b/i, id: "audit" },
  { keys: /\b(team|staff access)\b/i, id: "team" },
  { keys: /\b(admin home|home|overview)\b/i, id: "admin" },
];

function canOpenDashboard(session: AdminSessionInfo, dashboard: string) {
  if (session.role === "super") return true;
  return session.dashboards.includes(dashboard);
}

function hindiPreferred(language: string, question: string) {
  return language === "hi" || language === "mr" || /[\u0900-\u097F]/.test(question);
}

export function opsAssistantBlocked(question: string) {
  return /\b(pay|razorpay|upi|otp|unlock|delete permanently|transfer money|charge card)\b/i.test(
    question
  );
}

function resolveOpenDashboard(question: string): string {
  const lower = question.toLowerCase();
  const wantsOpen =
    /\b(open|go to|take me|show me|switch to|launch|खोलो|खोल)\b/i.test(question) ||
    /\b(approve|process|handle|review)\b/i.test(lower);
  if (!wantsOpen && !/\bopen\b/i.test(lower)) {
    if (!/\b(dashboard|section|page|screen)\b/i.test(lower)) return "";
  }
  for (const row of DASHBOARD_ALIASES) {
    if (row.keys.test(question)) return row.id;
  }
  return "";
}

function moneyDanger(question: string) {
  return (
    opsAssistantBlocked(question) &&
    /\b(for me|do it|now|complete|enter|execute|confirm payment)\b/i.test(question)
  );
}

export { getOpsPulse } from "@/lib/opsPulse";

function buildAction(
  session: AdminSessionInfo,
  asked: string,
  q: ReturnType<typeof parseOpsQuery>,
  hits: OpsHit[]
): OpsAction | undefined {
  const openDashboardId = resolveOpenDashboard(asked);
  let action: OpsAction | undefined;
  if (openDashboardId && canOpenDashboard(session, openDashboardId)) {
    action = {
      type: "open_dashboard",
      dashboard: openDashboardId,
      label: `Open ${DASHBOARD_LABELS[openDashboardId] || openDashboardId}`,
      autoNavigate: /\b(open|go to|take me|switch to|launch|खोलो|खोल|approve|review|process)\b/i.test(
        asked
      ),
    };
  }

  const focusQuery =
    q.bookingId ||
    q.riderId ||
    q.phone ||
    q.ticketId ||
    q.vehicleToken ||
    hits.find((hit) => hit.id)?.id ||
    "";

  const wantInstruction =
    /\b(approve|click|press|process|handle|review|find|show me|take me|jump|locate|search)\b/i.test(
      asked
    ) || /मंज़ूर|खोजो|दिखाओ|खोलो/.test(asked);

  if (/\b(approve|click|press|process|review|handle)\b/i.test(asked) || /मंज़ूर/.test(asked)) {
    if (q.wantRefunds && canOpenDashboard(session, "refunds")) {
      return {
        type: "open_dashboard",
        dashboard: "refunds",
        label: "Open Refunds — finish Approve there",
        autoNavigate: true,
        focusQuery: focusQuery || undefined,
      };
    }
    if (
      (q.wantKyc || hits.some((hit) => hit.kind === "rider")) &&
      canOpenDashboard(session, "users")
    ) {
      return {
        type: "open_dashboard",
        dashboard: "users",
        label: "Open Users — finish Approve there",
        autoNavigate: true,
        focusQuery: focusQuery || undefined,
      };
    }
    if (q.wantKyc && canOpenDashboard(session, "kyc")) {
      return {
        type: "open_dashboard",
        dashboard: "kyc",
        label: "Open KYC — finish Approve there",
        autoNavigate: true,
        focusQuery: focusQuery || undefined,
      };
    }
    if (hits[0]?.dashboard && canOpenDashboard(session, hits[0].dashboard)) {
      return {
        type: "open_dashboard",
        dashboard: hits[0].dashboard,
        label: `Open ${DASHBOARD_LABELS[hits[0].dashboard] || hits[0].dashboard} — finish on staff buttons`,
        autoNavigate: true,
        focusQuery: focusQuery || undefined,
      };
    }
  }

  if (wantInstruction && focusQuery && hits[0]?.dashboard) {
    return {
      type: "open_dashboard",
      dashboard: hits[0].dashboard,
      label: `Open ${DASHBOARD_LABELS[hits[0].dashboard] || hits[0].dashboard}`,
      autoNavigate: true,
      focusQuery,
    };
  }

  if (q.wantReadyPickup && canOpenDashboard(session, "bookings")) {
    return {
      type: "open_dashboard",
      dashboard: "bookings",
      label: "Open Bookings — Ready for Pickup",
      autoNavigate: true,
      focusQuery: "Ready For Pickup",
    };
  }

  if (!action && hits[0]?.dashboard && canOpenDashboard(session, hits[0].dashboard)) {
    action = {
      type: "open_dashboard",
      dashboard: hits[0].dashboard,
      label: `Open ${DASHBOARD_LABELS[hits[0].dashboard] || hits[0].dashboard}`,
      autoNavigate: false,
      focusQuery: focusQuery || undefined,
    };
  }

  if (action && focusQuery && !action.focusQuery) {
    action = { ...action, focusQuery };
  }

  return action;
}

export function formatOpsAnswer(
  question: string,
  hits: OpsHit[],
  stats: OpsStat[],
  action: OpsAction | undefined,
  hindi: boolean,
  elapsedMs?: number
) {
  const parts: string[] = [];
  if (typeof elapsedMs === "number") {
    parts.push(hindi ? `खोज ${elapsedMs}ms में।` : `Search ${elapsedMs}ms.`);
  }
  if (stats.length) {
    parts.push(
      hindi
        ? `लाइव आँकड़े: ${stats.map((s) => `${s.label} ${s.value}`).join(" · ")}`
        : `Live pulse: ${stats.map((s) => `${s.label} ${s.value}`).join(" · ")}`
    );
  }
  if (hits.length) {
    const lines = hits.slice(0, 8).map((hit, index) => `${index + 1}. ${hit.title} — ${hit.detail}`);
    parts.push(
      hindi
        ? `${hits.length} रिकॉर्ड। टैप करके डैशबोर्ड खोलें।\n${lines.join("\n")}`
        : `${hits.length} match${hits.length === 1 ? "" : "es"}. Tap a card to jump.\n${lines.join("\n")}`
    );
  } else if (!stats.length && !action) {
    parts.push(
      hindi
        ? `“${question}” के लिए कुछ नहीं मिला। BK- ID, 10 अंक फोन, नाम, “unpaid”, “in ride”, “pending kyc” आज़माएँ।`
        : `No matches for “${question}”. Try BK- ID, phone, name, “unpaid”, “in ride”, or “pending kyc”.`
    );
  }
  if (action?.autoNavigate) {
    parts.push(
      hindi
        ? `${action.label} खोल रहा हूँ${action.focusQuery ? ` · खोज: ${action.focusQuery}` : ""}। Approve/Pay वहीं स्टाफ बटन से — चैट से क्लिक नहीं।`
        : `${action.label}${action.focusQuery ? ` · search: ${action.focusQuery}` : ""}. Finish Approve/Pay on the staff button — chat never clicks it.`
    );
  }
  parts.push(
    hindi
      ? "भुगतान, OTP, अनलॉक या रिफंड मंज़ूरी चैट से नहीं — डैशबोर्ड बटन से।"
      : "Pay, OTP, unlock, and refund approval stay on dashboard buttons — not in chat."
  );
  return parts.join("\n\n");
}

async function synthesizeOpsAnswer(options: {
  question: string;
  hindi: boolean;
  hits: OpsHit[];
  stats: OpsStat[];
  action?: OpsAction;
  elapsedMs: number;
}): Promise<string> {
  if (!llmConfigured()) return "";
  const { question, hindi, hits, stats, action, elapsedMs } = options;
  const context = JSON.stringify(
    {
      elapsedMs,
      stats,
      action: action
        ? {
            dashboard: action.dashboard,
            label: action.label,
            focusQuery: action.focusQuery,
            autoNavigate: action.autoNavigate,
          }
        : null,
      hits: redactOpsHitsForLlm(hits.slice(0, 12)).map((hit) => ({
        kind: hit.kind,
        id: hit.id,
        title: hit.title,
        detail: hit.detail,
        dashboard: hit.dashboard,
      })),
    },
    null,
    0
  );

  const system = `You are Ops Eva, EVUDDY's admin command-center copilot (Uber/Ola ops grade + ChatGPT clarity).
You receive LIVE database search results as JSON. Answer only from that JSON — never invent booking ids, phones, or counts.
Help the admin work in seconds: summarize what was found, what to do next, which dashboard to open.
If they asked to approve/click/pay: explain the record is ready and they must press the real staff button (you cannot click Approve/Pay/OTP/unlock from chat — audit-safe).
${hindi ? "Reply in clear Hindi (Devanagari), short and operational." : "Reply in clear English, short and operational."}
Max 120 words. Use short bullets when listing records.`;

  try {
    return await llmChat({
      system,
      messages: [
        {
          role: "user",
          content: `Admin asked: ${question}\n\nLive results JSON:\n${context}`,
        },
      ],
      maxTokens: 280,
      temperature: 0.15,
    });
  } catch (error) {
    console.error("OPS EVA LLM SKIPPED:", error);
    return "";
  }
}

export async function runOpsAssistant(
  session: AdminSessionInfo,
  question: string,
  language = "auto"
): Promise<OpsAssistantResult> {
  const asked = question.trim().slice(0, 240);
  const hindi = hindiPreferred(language, asked);

  if (asked.length < 2) {
    return {
      answer: hindi
        ? "BK- ID, फोन, नाम, unpaid, in-ride, KYC, refunds पूछें — या “open bookings”. मैं लाइव डेटा खोजता हूँ। भुगतान/OTP यहाँ से नहीं।"
        : "Ask a BK- ID, phone, name, unpaid rides, in-ride fleet, KYC, refunds — or say “open bookings”. I search live data in seconds. I cannot pay or enter OTP.",
      hits: [],
      stats: [],
      mode: llmConfigured() ? "ai" : "search",
    };
  }

  if (moneyDanger(asked)) {
    const openId = resolveOpenDashboard(asked);
    const dashboard =
      openId && canOpenDashboard(session, openId)
        ? openId
        : /\brefund\b/i.test(asked)
          ? "refunds"
          : /\bkyc\b/i.test(asked)
            ? "kyc"
            : "bookings";
    return {
      answer: hindi
        ? "मैं भुगतान, OTP, अनलॉक या डिलीट नहीं कर सकता। सही डैशबोर्ड खोल रहा हूँ — वहाँ स्टाफ बटन से पूरा करें।"
        : "I cannot pay, enter OTP, unlock, or delete from chat. Opening the right dashboard — finish with the staff buttons there.",
      hits: [],
      stats: [],
      action: canOpenDashboard(session, dashboard)
        ? {
            type: "open_dashboard",
            dashboard,
            label: `Open ${DASHBOARD_LABELS[dashboard] || dashboard}`,
            autoNavigate: true,
          }
        : undefined,
      mode: llmConfigured() ? "ai" : "search",
    };
  }

  const q = parseOpsQuery(asked);
  const { hits, stats, elapsedMs } = await universalOpsSearch(session, q);
  const action = buildAction(session, asked, q, hits);

  if (action?.autoNavigate && !hits.length && !stats.length) {
    return {
      answer: hindi
        ? `${action.label} खोल रहा हूँ। संवेदनशील कदम वहीं स्टाफ बटन से करें।`
        : `Opening ${DASHBOARD_LABELS[action.dashboard] || action.dashboard}. Sensitive steps stay on staff buttons.`,
      hits: [],
      stats: [],
      action,
      elapsedMs,
      mode: llmConfigured() ? "ai" : "search",
    };
  }

  const fallback = formatOpsAnswer(asked, hits, stats, action, hindi, elapsedMs);
  const ai = await synthesizeOpsAnswer({
    question: asked,
    hindi,
    hits,
    stats,
    action,
    elapsedMs,
  });

  return {
    answer: ai || fallback,
    hits: hits.slice(0, 24),
    stats: stats.slice(0, 8),
    action,
    elapsedMs,
    mode: ai ? "ai" : "search",
  };
}

/** @deprecated use runOpsAssistant */
export async function searchOpsRecords(session: AdminSessionInfo, question: string) {
  const result = await runOpsAssistant(session, question, "en");
  return result.hits;
}
