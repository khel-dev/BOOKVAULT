let currentClient = null;
let currentClientBilling = [];

function getUid() {
  const uid = window.authService?.getCurrentUserId?.() || null;
  if (uid) return uid;
  const s = localStorage.getItem("registeredUser");
  if (!s) return null;
  try {
    return JSON.parse(s)?.uid || null;
  } catch {
    return null;
  }
}

function getClientIdFromURL() {
  return new URLSearchParams(window.location.search).get("clientId");
}

function loadUserProfile() {
  const s = localStorage.getItem("registeredUser");
  if (!s) return;
  const u = JSON.parse(s);
  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "User";
  const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.slice(0, 2))}&background=2e3192&color=fff`;
  const url = u.profilePicture || fb;
  const a = document.getElementById("userAvatarHeader");
  const b = document.getElementById("userAvatarProfile");
  if (a) a.src = url;
  if (b) b.src = url;
  const n = document.getElementById("profileName");
  if (n) n.textContent = name;
}

async function updateNotificationBadge() {
  const uid = getUid();
  const badge = document.getElementById("notificationBadge");
  if (!uid || !badge || !window.userDataService) return;
  try {
    const c = await window.userDataService.getUnreadNotificationCount(uid);
    badge.textContent = c > 99 ? "99+" : String(c);
    badge.style.display = c > 0 ? "inline-flex" : "none";
  } catch (e) {
    console.warn(e);
  }
}

async function loadClientDetails() {
  const id = getClientIdFromURL();
  if (!id) return showNotFound();

  let w = 0;
  while (!window.userDataService && w++ < 50) await new Promise((r) => setTimeout(r, 100));
  if (!window.userDataService) return showNotFound();

  let uid = getUid();
  if (!uid) {
    let t = 0;
    while (!getUid() && t++ < 40) await new Promise((r) => setTimeout(r, 150));
    uid = getUid();
  }
  if (!uid) return showNotFound();

  try {
    currentClient = await window.userDataService.getClient(uid, id);
    currentClientBilling = await window.userDataService.getBillingRecordsByClient(uid, id);
    renderClient();
    await updateNotificationBadge();
  } catch (e) {
    console.error(e);
    showNotFound();
  }
}

function renderClient() {
  if (!currentClient) return showNotFound();
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("clientContent").style.display = "block";
  const c = currentClient;
  const initial = (c.businessName || "C").charAt(0).toUpperCase();
  const av = document.getElementById("clientAvatar");
  if (av) av.textContent = initial;
  document.getElementById("clientBusinessName").textContent = c.businessName || "—";
  document.getElementById("clientContactPerson").textContent = c.contactPerson || "";
  document.getElementById("clientEmail").textContent = c.email || "—";
  document.getElementById("clientPhone").textContent = c.phone || "—";
  document.getElementById("clientBusinessType").textContent = c.businessType || "—";
  const pill = document.getElementById("clientStatusPill");
  if (pill) {
    pill.textContent = (c.status || "active").toUpperCase();
  }
  document.getElementById("statMonthlyFee").textContent = `₱${Number(c.monthlyFee || 0).toLocaleString()}`;
  const paid = currentClientBilling.filter((b) => b.status === "paid").reduce((s, b) => s + Number(b.amount || 0), 0);
  const out = currentClientBilling.filter((b) => b.status !== "paid").reduce((s, b) => s + Number(b.amount || 0), 0);
  document.getElementById("statTotalInvoices").textContent = String(currentClientBilling.length);
  document.getElementById("statTotalPaid").textContent = `₱${paid.toLocaleString()}`;
  document.getElementById("statOutstanding").textContent = `₱${out.toLocaleString()}`;

  document.getElementById("infoBizName").textContent = c.businessName || "—";
  document.getElementById("infoContact").textContent = c.contactPerson || "—";
  document.getElementById("infoBizType").textContent = c.businessType || "—";
  document.getElementById("infoTin").textContent = c.tin || c.tinNumber || "—";
  document.getElementById("infoStartDate").textContent = c.startDate || (c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : "—");
  document.getElementById("infoEmail").textContent = c.email || "—";
  document.getElementById("infoPhone").textContent = c.phone || "—";
  document.getElementById("infoAddress").textContent = c.address || "—";
  document.getElementById("infoMonthlyFee").textContent = `₱${Number(c.monthlyFee || 0).toLocaleString()}`;

  const lastPaid = currentClientBilling
    .filter((b) => b.status === "paid")
    .sort((a, b) => new Date(b.paidAt || b.updatedAt || 0) - new Date(a.paidAt || a.updatedAt || 0))[0];
  document.getElementById("infoLastPayment").textContent = lastPaid?.paidAt
    ? new Date(lastPaid.paidAt).toLocaleDateString()
    : "—";

  const box = document.getElementById("billingHistoryContainer");
  if (!currentClientBilling.length) {
    box.innerHTML = `<p style="text-align:center;color:#9ca3af;padding:40px;">No billing statements yet.</p>`;
    return;
  }
  box.innerHTML = `<table class="invoice-table" style="width:100%;border-collapse:collapse;">
    <thead><tr><th>ID</th><th>Amount</th><th>Period</th><th>Status</th></tr></thead><tbody>
    ${currentClientBilling
      .map(
        (b) => `<tr>
      <td><strong>${b.id}</strong></td>
      <td>₱${Number(b.amount || 0).toLocaleString()}</td>
      <td>${fmt(b.billingPeriodStart)} – ${fmt(b.billingPeriodEnd)}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
    </tr>`,
      )
      .join("")}
    </tbody></table>`;
}

function fmt(x) {
  if (!x) return "—";
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function showNotFound() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("clientContent").style.display = "none";
  document.getElementById("notFoundState").style.display = "block";
}

function switchTab(name, btn) {
  document.querySelectorAll(".tab-panel").forEach((p) => (p.style.display = "none"));
  document.querySelectorAll(".detail-tab").forEach((t) => t.classList.remove("active"));
  const cap = name.charAt(0).toUpperCase() + name.slice(1);
  const panel = document.getElementById(`tab${cap}`);
  if (panel) panel.style.display = "block";
  if (btn) btn.classList.add("active");
}

function editCurrentClient() {
  if (!currentClient) return;
  window.location.href = `clients.html?editClientId=${encodeURIComponent(currentClient.id)}`;
}

function goToBilling() {
  if (!currentClient) return;
  window.location.href = `billing.html?clientId=${encodeURIComponent(currentClient.id)}`;
}

async function deleteCurrentClient() {
  if (!currentClient) return;
  if (!confirm(`Delete ${currentClient.businessName}?`)) return;
  const uid = getUid();
  try {
    await window.userDataService.deleteClient(uid, currentClient.id);
    window.location.href = "clients.html";
  } catch (e) {
    console.error(e);
    alert("Delete failed.");
  }
}

function goToNotifications() {
  window.location.href = "notifications.html";
}

function openProfileModal() {
  const m = document.getElementById("profileModal");
  if (m) m.style.display = "flex";
}
function closeProfileModal() {
  const m = document.getElementById("profileModal");
  if (m) m.style.display = "none";
}

function logout() {
  if (typeof bookvaultLogout === "function") return bookvaultLogout();
  localStorage.removeItem("registeredUser");
  window.location.href = "login.html";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProfileModal();
});
document.getElementById("profileModal")?.addEventListener("click", (e) => {
  if (e.target.id === "profileModal") closeProfileModal();
});

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadClientDetails();
});
