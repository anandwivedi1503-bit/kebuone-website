#!/usr/bin/env node
/**
 * Production smoke: endpoints used by evuddy_app (lib/api/evuddy_api.dart)
 * and the website. No auth secrets — only public + unauthenticated checks.
 */
const ORIGIN = process.env.EVUDDY_ORIGIN || "https://www.evuddy.com";

const results = [];

async function probe(name, fn) {
  try {
    const r = await fn();
    results.push({ name, ok: r.ok, detail: r.detail, severity: r.severity || (r.ok ? "pass" : "fail") });
  } catch (e) {
    results.push({ name, ok: false, detail: String(e), severity: "fail" });
  }
}

async function get(path) {
  const res = await fetch(`${ORIGIN}${path}`, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json, text: text.slice(0, 200) };
}

async function post(path, body, headers = {}) {
  const res = await fetch(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json, text: text.slice(0, 300) };
}

await probe("health", async () => {
  const { status, json } = await get("/api/health");
  const stale = json?.unpaidJob?.stale;
  return {
    ok: status === 200 && json?.success && json?.database === true,
    detail: `db=${json?.database} unpaidJob.stale=${stale}`,
    severity: stale ? "warn" : "pass",
  };
});

await probe("festive-today + brand-today", async () => {
  const fest = await get("/api/festive-today");
  const brand = await get("/api/brand-today");
  const modeOk =
    fest.json?.mode === "campaign" || fest.json?.mode === "normal";
  return {
    ok:
      fest.status === 200 &&
      brand.status === 200 &&
      modeOk &&
      brand.json?.mode === fest.json?.mode,
    detail: `mode=${fest.json?.mode} theme=${fest.json?.campaign?.theme ?? "normal"}`,
  };
});

await probe("client-contract (app + web)", async () => {
  const { status, json } = await get("/api/client-contract");
  const pay = json?.payment?.firstRentalPayment;
  return {
    ok:
      status === 200 &&
      json?.success &&
      pay?.legacyApp === "raised-to-server-minimum" &&
      pay?.website === "server-enforced-pickup-minimum",
    detail: JSON.stringify(pay),
  };
});

await probe("cities (app catalog)", async () => {
  const { status, json } = await get("/api/cities");
  return {
    ok: status === 200 && json?.success === true && Array.isArray(json?.data),
    detail: `count=${json?.data?.length ?? 0}`,
  };
});

await probe("hubs", async () => {
  const { status, json } = await get("/api/hubs");
  return {
    ok: status === 200 && json?.success === true && Array.isArray(json?.data),
    detail: `count=${json?.data?.length ?? 0}`,
  };
});

await probe("vehicles", async () => {
  const { status, json } = await get("/api/vehicles");
  return {
    ok: status === 200 && json?.success === true && Array.isArray(json?.data),
    detail: `count=${json?.data?.length ?? 0}`,
  };
});

await probe("home-catalog", async () => {
  const { status, json } = await get("/api/home-catalog");
  return { ok: status === 200 && json?.success === true, detail: `status=${status}` };
});

await probe("bookings/mine no auth → not 500", async () => {
  const { status, json } = await get("/api/bookings/mine");
  return {
    ok: status < 500,
    detail: `status=${status} success=${json?.success}`,
  };
});

await probe("bookings POST no auth → 401 not 500", async () => {
  const { status } = await post("/api/bookings", { userName: "Test", userPhone: "9999999999" });
  return { ok: status === 401 || status === 403 || status === 400, detail: `status=${status}` };
});

await probe("razorpay create-order no auth", async () => {
  const { status } = await post("/api/razorpay/create-order", { amount: 1 });
  return { ok: status < 500 && status !== 200, detail: `status=${status}` };
});

await probe("riders POST legacy app (no X-Evuddy-Client)", async () => {
  const { status, json } = await post("/api/riders", { phone: "9999999999", fullName: "Smoke Test" });
  const errors = json?.errors || json?.message || "";
  return {
    ok: status < 500,
    detail: `status=${status} (expect 400/401 without Firebase — must not 500) ${JSON.stringify(errors).slice(0, 80)}`,
  };
});

await probe("release-unpaid-reserve no auth", async () => {
  const { status } = await post("/api/bookings/release-unpaid-reserve", {});
  return { ok: status === 401, detail: `status=${status}` };
});

await probe("legacy payment rule (no header)", async () => {
  const { status } = await post("/api/razorpay/create-order", {
    amount: 1,
    bookingMongoId: "000000000000000000000000",
    firebaseIdToken: "invalid",
  });
  return {
    ok: status < 500,
    detail: `status=${status} (invalid token — shape must not break app)`,
  };
});

const failed = results.filter((r) => !r.ok);
const warned = results.filter((r) => r.severity === "warn");

console.log(JSON.stringify({ origin: ORIGIN, results, failed: failed.length, warned: warned.length }, null, 2));
process.exit(failed.length > 0 ? 1 : 0);
