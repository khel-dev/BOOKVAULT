(() => {
  const PROTECTED_PAGES = new Set([
    "dashboard.html",
    "clients.html",
    "billing.html",
    "archive.html",
    "notifications.html",
    "settings.html",
    "help.html",
  ]);

  const path = window.location.pathname;
  const current = path.split("/").pop() || "";
  if (!PROTECTED_PAGES.has(current)) return;

  let checks = 0;
  const timer = setInterval(() => {
    checks++;
    if (window.firebaseInitialized && window.authService) {
      clearInterval(timer);
      if (!window.authService.isLoggedIn()) {
        window.location.href = "login.html";
      }
    }
    if (checks > 50) clearInterval(timer);
  }, 100);
})();

