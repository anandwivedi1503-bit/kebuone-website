export function notifyBrowser(title: string, body: string) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const show = () => {
      new Notification(title, {
        body,
        icon: "/Evuddy-logo-dark-E.png",
      });
    };

    if (Notification.permission === "granted") {
      show();
      return;
    }

    if (Notification.permission !== "denied") {
      void Notification.requestPermission().then((permission) => {
        if (permission === "granted") show();
      });
    }
  } catch {
    /* Browser push is optional. Payment already succeeded. */
  }
}
