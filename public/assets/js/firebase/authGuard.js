(() => {
  console.log('[AuthGuard] Starting auth check for:', window.location.pathname);
  
  const PROTECTED_PAGES = new Set([
    "dashboard.html",
    "clients.html",
    "billing.html",
    "archive.html",
    "notifications.html",
    "settings.html",
    "help.html"
  ]);

  const path = window.location.pathname;
  const current = path.split("/").pop() || "";
  if (!PROTECTED_PAGES.has(current)) {
    console.log('[AuthGuard] Page not protected:', current);
    return;
  }

  // Immediate localStorage check (from login success)
  function hasStoredAuth() {
    try {
      const stored = localStorage.getItem("registeredUser");
      if (stored) {
        const userData = JSON.parse(stored);
        if (userData.uid) {
          console.log('[AuthGuard] Auth OK: localStorage uid found');
          return true;
        }
      }
    } catch (e) {
      console.warn('[AuthGuard] localStorage parse error:', e);
    }
    return false;
  }

  if (hasStoredAuth()) {
    return;
  }

  // Poll for full auth
  let checks = 0;
  const maxChecks = 100; // 20 seconds at 200ms
  const timer = setInterval(() => {
    checks++;
    console.log(`[AuthGuard] Check ${checks}/${maxChecks}: firebase=${!!window.firebaseInitialized}, authService=${!!window.authService}, loggedIn=${window.authService?.isLoggedIn?.() || false}`);
    
    const ready = window.firebaseInitialized && window.authService && window.authService.isLoggedIn();
    
    if (ready || hasStoredAuth()) {
      console.log('[AuthGuard] Auth confirmed');
      clearInterval(timer);
      return;
    }
    
    if (checks > maxChecks) {
      console.error('[AuthGuard] Timeout - redirecting to login');
      window.location.href = "login.html";
      clearInterval(timer);
    }
  }, 200);

  console.log('[AuthGuard] Polling started, timeout 20s');
})();

