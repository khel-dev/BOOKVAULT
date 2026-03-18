async function bookvaultLogout({ confirmFirst = true } = {}) {
  try {
    if (confirmFirst) {
      const ok = confirm("Are you sure you want to logout?");
      if (!ok) return;
    }

    localStorage.removeItem("registeredUser");

    if (window.authService) {
      await window.authService.logout();
    } else if (window.firebaseAuth) {
      await window.firebaseAuth.signOut();
    }
  } catch (e) {
    console.warn("Logout warning:", e);
  } finally {
    window.location.href = "login.html";
  }
}

