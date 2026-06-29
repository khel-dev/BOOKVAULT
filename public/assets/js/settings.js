let settingsCache = {};

function getUid() {
  const uid = window.authService?.getCurrentUserId?.() || null;
  if (uid) return uid;
  const stored = localStorage.getItem("registeredUser");
  if (!stored) return null;
  try {
    return JSON.parse(stored)?.uid || null;
  } catch {
    return null;
  }
}

function goToNotifications() {
  window.location.href = "notifications.html";
}

async function updateNotificationBadge() {
  const uid = getUid();
  const badge = document.getElementById("notificationBadge");
  if (!badge || !uid || !window.userDataService) return;
  try {
    const n = await window.userDataService.getUnreadNotificationCount(uid);
    badge.textContent = n > 99 ? "99+" : String(n);
    badge.style.display = n > 0 ? "flex" : "none";
  } catch (e) {
    console.warn(e);
  }
}

function showNotification(message, type = "info") {
  const n = document.createElement("div");
  n.className = `notification ${type}`;
  n.textContent = message;
  n.style.cssText =
    "position:fixed;top:20px;right:20px;padding:12px 18px;border-radius:10px;color:#fff;z-index:10000;background:#2e3192;";
  if (type === "success") n.style.background = "#2d7a4f";
  if (type === "error") n.style.background = "#c0392b";
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2800);
}

function readTogglesFromUI() {
  return {
    emailNotifications: !!document.getElementById("emailNotif")?.checked,
    smsNotifications: !!document.getElementById("smsNotif")?.checked,
    desktopNotifications: !!document.getElementById("desktopNotif")?.checked,
    twoFactor: !!document.getElementById("twoFactor")?.checked,
    autoBackup: !!document.getElementById("autoBackup")?.checked,
    theme: document.querySelector('select[onchange="changeTheme(this.value)"]')?.value || "light",
    language: document.querySelector('select[onchange="changeLanguage(this.value)"]')?.value || "en",
    currency: document.querySelector('select[onchange="changeCurrency(this.value)"]')?.value || "PHP",
  };
}

async function persistSettings(partial = {}) {
  const uid = getUid();
  settingsCache = { ...settingsCache, ...partial };
  if (!uid || !window.userDataService) return;
  try {
    await window.userDataService.updateSettings(uid, settingsCache);
  } catch (e) {
    console.error(e);
    showNotification("Could not save settings.", "error");
  }
}

async function loadSettings() {
  const uid = getUid();
  if (!uid || !window.userDataService) return;
  try {
    settingsCache = await window.userDataService.getSettings(uid);
  } catch (e) {
    console.warn(e);
    settingsCache = {};
  }
  const s = { ...readTogglesFromUI(), ...settingsCache };
  document.getElementById("emailNotif").checked = !!s.emailNotifications;
  document.getElementById("smsNotif").checked = !!s.smsNotifications;
  document.getElementById("desktopNotif").checked = s.desktopNotifications !== false;
  document.getElementById("twoFactor").checked = !!s.twoFactor;
  document.getElementById("autoBackup").checked = s.autoBackup !== false;
  const themeSel = document.querySelector('select[onchange="changeTheme(this.value)"]');
  const langSel = document.querySelector('select[onchange="changeLanguage(this.value)"]');
  const curSel = document.querySelector('select[onchange="changeCurrency(this.value)"]');
  if (themeSel) themeSel.value = s.theme || "light";
  if (langSel) langSel.value = s.language || "en";
  if (curSel) curSel.value = s.currency || "PHP";
  if ((s.theme || "light") === "dark") document.body.classList.add("dark-theme");
  else document.body.classList.remove("dark-theme");
}

function updateProfile() {
  const stored = localStorage.getItem("registeredUser");
  if (!stored) return;
  const u = JSON.parse(stored);
  const fb = "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";
  const h = document.getElementById("userAvatarHeader");
  const p = document.getElementById("userAvatarProfile");
  const n = document.getElementById("profileName");
  if (h) h.src = u.profilePicture || fb;
  if (p) p.src = u.profilePicture || fb;
  if (n) n.textContent = u.username || "User";
}

function openProfileModal() {
  const m = document.getElementById("profileModal");
  if (m) m.style.display = "flex";
}
function closeProfileModal() {
  const m = document.getElementById("profileModal");
  if (m) m.style.display = "none";
}
function openPasswordModal() {
  const m = document.getElementById("passwordModal");
  if (m) m.style.display = "block";
}
function closePasswordModal() {
  const m = document.getElementById("passwordModal");
  if (m) m.style.display = "none";
  document.getElementById("passwordForm")?.reset();
}

async function changeTheme(theme) {
  await persistSettings({ theme });
  if (theme === "dark") document.body.classList.add("dark-theme");
  else document.body.classList.remove("dark-theme");
  showNotification("Theme saved.", "success");
}
async function changeLanguage(language) {
  await persistSettings({ language });
  showNotification("Language saved.", "success");
}
async function changeCurrency(currency) {
  await persistSettings({ currency });
  showNotification("Currency saved.", "success");
}

async function toggleEmailNotifications() {
  await persistSettings({ emailNotifications: !!document.getElementById("emailNotif").checked });
  showNotification("Saved.", "info");
}
async function toggleSMSNotifications() {
  await persistSettings({ smsNotifications: !!document.getElementById("smsNotif").checked });
  showNotification("Saved.", "info");
}
async function toggleDesktopNotifications() {
  const on = !!document.getElementById("desktopNotif").checked;
  if (on && "Notification" in window) {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      document.getElementById("desktopNotif").checked = false;
      await persistSettings({ desktopNotifications: false });
      showNotification("Browser blocked notifications.", "error");
      return;
    }
  }
  await persistSettings({ desktopNotifications: on });
  showNotification("Saved.", "info");
}
async function toggleTwoFactor() {
  await persistSettings({ twoFactor: !!document.getElementById("twoFactor").checked });
  showNotification("Preference saved (enable 2FA in your auth provider for real security).", "info");
}
async function toggleAutoBackup() {
  await persistSettings({ autoBackup: !!document.getElementById("autoBackup").checked });
  showNotification("Saved.", "info");
}

function openCompanyModal() {
  showNotification("Company profile: use Account settings or contact admin to extend fields.", "info");
}
function openTaxModal() {
  showNotification("Default tax rate is applied on billing statements (12%).", "info");
}
function openTemplateModal() {
  showNotification("Invoice layout uses BookKeeper standard template.", "info");
}

function editProfile() {
  window.location.href = "registration_personal.html";
}
function exportData() {
  showNotification("Export queued (CSV exports available from Clients and Billing pages).", "info");
}
function confirmDeleteAccount() {
  if (confirm("This will only sign you out here. Account deletion is done in Firebase Console.")) {
    showNotification("Signed out locally.", "info");
    logout();
  }
}

function initializeModals() {
  window.addEventListener("click", (event) => {
    if (event.target === document.getElementById("passwordModal")) closePasswordModal();
    if (event.target === document.getElementById("profileModal")) closeProfileModal();
  });
}

function logout() {
  if (typeof bookvaultLogout === "function") return bookvaultLogout();
  localStorage.removeItem("registeredUser");
  window.location.href = "login.html";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePasswordModal();
    closeProfileModal();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  updateProfile();
  initializeModals();
  let tries = 0;
  while (!window.userDataService && tries++ < 50) await new Promise((r) => setTimeout(r, 100));
  await loadSettings();
  await updateNotificationBadge();

  const pf = document.getElementById("passwordForm");
  if (pf) {
    pf.addEventListener("submit", (e) => {
      e.preventDefault();
      const np = document.getElementById("newPassword")?.value || "";
      const cp = document.getElementById("confirmPassword")?.value || "";
      if (np.length < 8) return showNotification("Password min 8 characters.", "error");
      if (np !== cp) return showNotification("Passwords do not match.", "error");
      showNotification("Use Firebase “Forgot password” on login to change password securely.", "info");
      closePasswordModal();
    });
  }
});
