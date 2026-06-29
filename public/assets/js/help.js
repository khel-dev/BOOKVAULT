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

async function waitForServices() {
  let a = 0;
  while ((!window.userDataService || !getUid()) && a++ < 60) {
    await new Promise((r) => setTimeout(r, 120));
  }
  return !!window.userDataService && !!getUid();
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

function goToNotifications() {
  window.location.href = "notifications.html";
}

function closeAllHelpModals() {
  closeContactModal();
  closeTicketModal();
  closeProfileModal();
  closePasswordModal();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeHelp();
  initializeModals();
  updateProfile();
  (async () => {
    if (await waitForServices()) await updateNotificationBadge();
  })();

  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword")?.value;
      const confirmPassword = document.getElementById("confirmPassword")?.value;
      if (newPassword !== confirmPassword) {
        showNotification("New passwords do not match!", "error");
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        showNotification("Password must be at least 8 characters long!", "error");
        return;
      }
      showNotification("Use Settings or Forgot password to change your Firebase password securely.", "info");
      closePasswordModal();
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const subject = formData.get("subject");
      const message = formData.get("message");
      if (!subject || !message) {
        showNotification("Please fill in all required fields.", "error");
        return;
      }
      showNotification("Your message has been sent! We'll get back to you soon.", "success");
      closeContactModal();
    });
  }

  const ticketForm = document.getElementById("ticketForm");
  if (ticketForm) {
    ticketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const type = formData.get("type");
      const title = formData.get("title");
      const description = formData.get("description");
      if (!type || !title || !description) {
        showNotification("Please fill in all required fields.", "error");
        return;
      }
      const ticketNumber = "BK-" + Math.random().toString(36).substring(2, 11).toUpperCase();
      showNotification(`Support ticket ${ticketNumber} has been created! You'll receive updates via email.`, "success");
      closeTicketModal();
    });
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllHelpModals();
});

function initializeHelp() {
  console.log("Help & Support page loaded");
}

function initializeModals() {
  window.addEventListener("click", (event) => {
    const contactModal = document.getElementById("contactModal");
    const ticketModal = document.getElementById("ticketModal");
    const profileModal = document.getElementById("profileModal");
    const passwordModal = document.getElementById("passwordModal");

    if (event.target === contactModal) closeContactModal();
    if (event.target === ticketModal) closeTicketModal();
    if (event.target === profileModal) closeProfileModal();
    if (event.target === passwordModal) closePasswordModal();
  });
}

function updateProfile() {
  const storedUserData = localStorage.getItem("registeredUser");
  if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    const username = userData.username;
    const profilePicture = userData.profilePicture;
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) profileNameElement.textContent = username || "User";
    updateProfilePicture(profilePicture);
  }
}

function updateProfilePicture(profilePicture) {
  const headerAvatar = document.getElementById("userAvatarHeader");
  const profileAvatar = document.getElementById("userAvatarProfile");
  const imageUrl =
    profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";
  if (headerAvatar) headerAvatar.src = imageUrl;
  if (profileAvatar) profileAvatar.src = imageUrl;
}

function openProfileModal() {
  const m = document.getElementById("profileModal");
  if (m) m.style.display = "flex";
}

function closeProfileModal() {
  const m = document.getElementById("profileModal");
  if (m) m.style.display = "none";
}

function editProfile() {
  window.location.href = "settings.html";
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

function searchHelp(query) {
  const searchTerm = query.toLowerCase();
  const faqItems = document.querySelectorAll(".faq-item");
  const knowledgeLinks = document.querySelectorAll(".knowledge-category a");

  faqItems.forEach((item) => {
    const qEl = item.querySelector(".faq-question h3");
    const aEl = item.querySelector(".faq-answer p");
    if (!qEl || !aEl) return;
    const question = qEl.textContent.toLowerCase();
    const answer = aEl.textContent.toLowerCase();

    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
      item.style.display = "block";
      if (searchTerm.length > 0) item.classList.add("active");
    } else {
      item.style.display = searchTerm.length > 0 ? "none" : "block";
    }
  });

  knowledgeLinks.forEach((link) => {
    const text = link.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      link.style.display = "block";
      if (searchTerm.length > 0) link.style.background = "#fff3cd";
    } else {
      link.style.display = searchTerm.length > 0 ? "none" : "block";
      link.style.background = "none";
    }
  });
}

function toggleFAQ(element) {
  const isActive = element.classList.contains("active");
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("active");
  });
  if (!isActive) element.classList.add("active");
}

function openContactModal() {
  const m = document.getElementById("contactModal");
  if (m) m.style.display = "block";
}

function closeContactModal() {
  const m = document.getElementById("contactModal");
  if (m) m.style.display = "none";
  document.getElementById("contactForm")?.reset();
}

function openTicketModal() {
  const m = document.getElementById("ticketModal");
  if (m) m.style.display = "block";
}

function closeTicketModal() {
  const m = document.getElementById("ticketModal");
  if (m) m.style.display = "none";
  document.getElementById("ticketForm")?.reset();
}

function scheduleDemo() {
  showNotification("Demo scheduling feature coming soon! Please contact support for now.", "info");
}

function downloadGuide() {
  showNotification("Downloading user guide...", "info");
  setTimeout(() => {
    showNotification("User guide downloaded successfully!", "success");
  }, 2000);
}

function playVideo(videoId) {
  showNotification(`Playing video: ${videoId}. Video player would open here.`, "info");
}

function openArticle(articleId) {
  showNotification(`Opening article: ${articleId}. Article viewer would open here.`, "info");
}

function logout() {
  if (typeof bookvaultLogout === "function") {
    bookvaultLogout();
    return;
  }
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentElement) notification.remove();
  }, 5000);
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "exclamation-circle";
    case "warning":
      return "exclamation-triangle";
    default:
      return "info-circle";
  }
}

function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "#6fd195";
    case "error":
      return "#ff928a";
    case "warning":
      return "#ffd700";
    default:
      return "#00adef";
  }
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
