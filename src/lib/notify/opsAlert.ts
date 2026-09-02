function env(name: string) {
  return String(process.env[name] || "").trim();
}

export async function notifyOpsAlert(title: string, body: string) {
  const to = env("OPS_ALERT_EMAIL");
  const resend = env("RESEND_API_KEY");
  const from = env("NOTIFY_FROM_EMAIL") || "EVUDDY <noreply@evuddy.com>";
  console.error(`[OPS ALERT] ${title} — ${body.slice(0, 400)}`);
  if (!to || !resend) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `EVUDDY ops: ${title}`.slice(0, 120),
        text: body.slice(0, 4000),
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("OPS ALERT EMAIL SKIPPED:", error);
    return false;
  }
}
