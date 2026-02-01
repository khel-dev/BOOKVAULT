let notifications = [
    {
        id: 1,
        type: "overdue",
        title: "Payment Overdue",
        message: "Bating's Fried Rice payment is 5 days overdue. Last invoice: INV-2024-003 (₱1,500)",
        client: "Bating's Fried Rice",
        clientId: 3,
        time: "2024-12-20T10:30:00",
        priority: "urgent",
        read: false,
        actionable: true,
    },
    {
        id: 2,
        type: "payment",
        title: "Payment Due Tomorrow",
        message: "Sticky Printing Shop payment due tomorrow. Invoice: INV-2024-004 (₱2,000)",
        client: "Sticky Printing Shop",
        clientId: 4,
        time: "2024-12-20T09:15:00",
        priority: "high",
        read: false,
        actionable: true,
    },
    {
        id: 3,
        type: "reminder",
        title: "Monthly Report Due",
        message: "Generate and send monthly financial reports to all active clients",
        client: null,
        clientId: null,
        time: "2024-12-20T08:00:00",
        priority: "medium",
        read: false,
        actionable: true,
    },
    {
        id: 4,
        type: "payment",
        title: "Payment Received",
        message: "Jepoy's N Grills payment received. Invoice: INV-2024-002 (₱3,000)",
        client: "Jepoy's N Grills",
        clientId: 2,
        time: "2024-12-19T16:45:00",
        priority: "low",
        read: true,
        actionable: false,
    },
    {
        id: 5,
        type: "update",
        title: "New Client Added",
        message: 'New client "Tech Solutions Inc." has been added to your portfolio',
        client: "Tech Solutions Inc.",
        clientId: 6,
        time: "2024-12-19T14:20:00",
        priority: "low",
        read: true,
        actionable: false,
    },
    {
        id: 6,
        type: "reminder",
        title: "Tax Filing Deadline",
        message: "Quarterly tax filing deadline approaching in 7 days. Prepare client documents.",
        client: null,
        clientId: null,
        time: "2024-12-19T12:00:00",
        priority: "high",
        read: false,
        actionable: true,
    },
    {
        id: 7,
        type: "overdue",
        title: "Payment Overdue",
        message: "Ashop Sari-Sari Store payment is 10 days overdue. Invoice: INV-2024-005 (₱1,200)",
        client: "Ashop Sari-Sari Store",
        clientId: 5,
        time: "2024-12-19T11:30:00",
        priority: "urgent",
        read: false,
        actionable: true,
    },
    {
        id: 8,
        type: "update",
        title: "System Backup Complete",
        message: "Weekly system backup completed successfully. All client data secured.",
        client: null,
        clientId: null,
        time: "2024-12-19T02:00:00",
        priority: "low",
        read: true,
        actionable: false,
    },
];

let filteredNotifications = [...notifications];
let currentView = "list";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Notifications page loaded, initializing...");
    const storedUserData = localStorage.getItem("registeredUser");
    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        updateProfilePicture(userData.profilePicture); // Updated to use profilePicture
        updateProfileName(userData.username);
    }

    renderNotifications();
    setupEventListeners();
    updateStats();
    populateClientSelect();
});

function updateProfilePicture(profilePicture) {
    console.log("Updating profile picture based on profilePicture");
    const headerAvatar = document.getElementById("userAvatarHeader");
    const profileAvatar = document.getElementById("userAvatarProfile");
    const imageUrl = profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";

    if (headerAvatar) headerAvatar.src = imageUrl;
    if (profileAvatar) profileAvatar.src = imageUrl;
}

function updateProfileName(username) {
    console.log("Updating profile name:", username);
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) profileNameElement.textContent = username || "User Name";
}

function setupEventListeners() {
    console.log("Setting up event listeners...");
    const notificationSearch = document.getElementById("notificationSearch");
    if (notificationSearch) {
        notificationSearch.addEventListener("input", (e) => {
            console.log("Search input:", e.target.value);
            const searchTerm = e.target.value.toLowerCase();
            filteredNotifications = notifications.filter(
                (notification) =>
                    notification.title.toLowerCase().includes(searchTerm) ||
                    notification.message.toLowerCase().includes(searchTerm) ||
                    (notification.client && notification.client.toLowerCase().includes(searchTerm)),
            );
            renderNotifications();
        });
    } else {
        console.error("Notification search input not found");
    }

    const typeFilter = document.getElementById("typeFilter");
    if (typeFilter) typeFilter.addEventListener("change", applyFilters);

    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);
}

function applyFilters() {
    console.log("Applying filters...");
    const typeFilter = document.getElementById("typeFilter")?.value || "all";
    const statusFilter = document.getElementById("statusFilter")?.value || "all";

    filteredNotifications = notifications.filter((notification) => {
        const typeMatch = typeFilter === "all" || notification.type === typeFilter;
        const statusMatch =
            statusFilter === "all" ||
            (statusFilter === "read" && notification.read) ||
            (statusFilter === "unread" && !notification.read);
        return typeMatch && statusMatch;
    });

    renderNotifications();
}

function clearFilters() {
    console.log("Clearing filters...");
    const typeFilter = document.getElementById("typeFilter");
    const statusFilter = document.getElementById("statusFilter");
    const notificationSearch = document.getElementById("notificationSearch");
    if (typeFilter) typeFilter.value = "all";
    if (statusFilter) statusFilter.value = "all";
    if (notificationSearch) notificationSearch.value = "";
    filteredNotifications = [...notifications];
    renderNotifications();
}

function switchView(view) {
    console.log(`Switching to ${view} view`);
    currentView = view;
    const viewButtons = document.querySelectorAll(".view-btn");
    viewButtons.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    const container = document.getElementById("notificationsList");
    if (container) {
        if (view === "card") {
            container.classList.add("card-view");
        } else {
            container.classList.remove("card-view");
        }
        renderNotifications();
    } else {
        console.error("Notifications list container not found");
    }
}

function updateStats() {
    console.log("Updating notification stats...");
    const urgent = notifications.filter((n) => n.priority === "urgent" && !n.read).length;
    const dueSoon = notifications.filter((n) => n.type === "payment" && !n.read).length;
    const reminders = notifications.filter((n) => n.type === "reminder" && !n.read).length;
    const updates = notifications.filter((n) => n.type === "update" && !n.read).length;

    const urgentCount = document.getElementById("urgentCount");
    const dueSoonCount = document.getElementById("dueSoonCount");
    const remindersCount = document.getElementById("remindersCount");
    const updatesCount = document.getElementById("updatesCount");
    const notificationBadge = document.getElementById("notificationBadge");

    if (urgentCount) urgentCount.textContent = urgent;
    if (dueSoonCount) dueSoonCount.textContent = dueSoon;
    if (remindersCount) remindersCount.textContent = reminders;
    if (updatesCount) updatesCount.textContent = updates;
    if (notificationBadge) notificationBadge.textContent = notifications.filter(n => !n.read).length;

    console.log(`Stats: Urgent: ${urgent}, Due Soon: ${dueSoon}, Reminders: ${reminders}, Updates: ${updates}`);
}

function renderNotifications() {
    console.log("Rendering notifications...");
    const container = document.getElementById("notificationsList");
    if (!container) {
        console.error("Notifications list container not found");
        showNotification("Error: Notifications list container not found", "error");
        return;
    }

    if (filteredNotifications.length === 0) {
        container.innerHTML = `
            <div class="empty-notifications">
                <i class="fas fa-bell-slash"></i>
                <h3>No notifications found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    if (currentView === "card") {
        container.innerHTML = filteredNotifications
            .map(
                (notification) => `
                <div class="notification-item ${notification.read ? "read" : "unread"}" onclick="markAsRead(${notification.id}); event.stopPropagation();">
                    <div class="card-header">
                        <div class="notification-icon ${notification.type}">
                            <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-actions">
                            <span class="priority-badge priority-${notification.priority}">${notification.priority}</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                    </div>
                    <div class="card-footer">
                        <div class="notification-meta">
                            <div class="notification-time">
                                <i class="fas fa-clock"></i>
                                ${formatTime(notification.time)}
                            </div>
                            ${
                                notification.client
                                    ? `
                                    <div class="notification-client">
                                        <i class="fas fa-user"></i>
                                        <a href="clients.html?clientId=${notification.clientId}">${notification.client}</a>
                                    </div>
                                `
                                    : ""
                            }
                        </div>
                        <div class="notification-actions">
                            ${
                                !notification.read
                                    ? `
                                    <button class="notification-action-btn btn-mark-read" onclick="markAsRead(${notification.id}); event.stopPropagation();">
                                        Mark Read
                                    </button>
                                `
                                    : ""
                            }
                            <button class="notification-action-btn btn-dismiss" onclick="dismissNotification(${notification.id}); event.stopPropagation();">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            `,
            )
            .join("");
    } else {
        container.innerHTML = filteredNotifications
            .map(
                (notification) => `
                <div class="notification-item ${notification.read ? "read" : "unread"}" onclick="markAsRead(${notification.id}); event.stopPropagation();">
                    <div class="notification-icon ${notification.type}">
                        <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-meta">
                            <div class="notification-time">
                                <i class="fas fa-clock"></i>
                                ${formatTime(notification.time)}
                            </div>
                            ${
                                notification.client
                                    ? `
                                    <div class="notification-client">
                                        <i class="fas fa-user"></i>
                                        <a href="clients.html?clientId=${notification.clientId}">${notification.client}</a>
                                    </div>
                                `
                                    : ""
                            }
                        </div>
                    </div>
                    <div class="notification-actions">
                        <span class="priority-badge priority-${notification.priority}">${notification.priority}</span>
                        ${
                            !notification.read
                                ? `
                                <button class="notification-action-btn btn-mark-read" onclick="markAsRead(${notification.id}); event.stopPropagation();">
                                    Mark Read
                                </button>
                            `
                                : ""
                        }
                        <button class="notification-action-btn btn-dismiss" onclick="dismissNotification(${notification.id}); event.stopPropagation();">
                            Dismiss
                        </button>
                    </div>
                </div>
            `,
            )
            .join("");
    }
}

function getNotificationIcon(type) {
    const icons = {
        payment: "dollar-sign",
        overdue: "exclamation-triangle",
        reminder: "bell",
        update: "info-circle",
    };
    return icons[type] || "bell";
}

function formatTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        return "Just now";
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }
}

function markAsRead(notificationId) {
    console.log(`Marking notification ${notificationId} as read`);
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
        notification.read = true;
        filteredNotifications = [...notifications];
        renderNotifications();
        updateStats();
        showNotification(`Notification "${notification.title}" marked as read`, "success");
    } else {
        console.error(`Notification ${notificationId} not found`);
        showNotification("Error: Notification not found", "error");
    }
}

function dismissNotification(notificationId) {
    console.log(`Dismissing notification ${notificationId}`);
    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index > -1) {
        const notification = notifications[index];
        notifications.splice(index, 1);
        filteredNotifications = [...notifications];
        renderNotifications();
        updateStats();
        showNotification(`Notification "${notification.title}" dismissed`, "info");
    } else {
        console.error(`Notification ${notificationId} not found`);
        showNotification("Error: Notification not found", "error");
    }
}

function markAllRead() {
    console.log("Marking all notifications as read");
    notifications.forEach((notification) => {
        notification.read = true;
    });
    filteredNotifications = [...notifications];
    renderNotifications();
    updateStats();
    showNotification("All notifications marked as read", "success");
}

function sendPaymentReminders() {
    console.log("Sending payment reminders...");
    const overdueNotifications = notifications.filter((n) => n.type === "overdue" && !n.read);
    showNotification(`Sending payment reminders to ${overdueNotifications.length} clients`, "success");
}

function scheduleReminder() {
    console.log("Opening Schedule Reminder modal");
    const modal = document.getElementById("scheduleReminderModal");
    if (modal) {
        modal.classList.add("active");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const reminderDate = document.getElementById("reminderDate");
        const reminderTime = document.getElementById("reminderTime");
        if (reminderDate) reminderDate.value = tomorrow.toISOString().split("T")[0];
        if (reminderTime) reminderTime.value = "09:00";
    } else {
        console.error("Schedule Reminder modal not found");
        showNotification("Error: Schedule Reminder modal not found", "error");
    }
}

function closeScheduleReminderModal() {
    console.log("Closing Schedule Reminder modal");
    const modal = document.getElementById("scheduleReminderModal");
    const form = document.getElementById("scheduleReminderForm");
    if (modal) modal.classList.remove("active");
    if (form) form.reset();
}

function saveReminder() {
    console.log("Saving reminder...");
    const title = document.getElementById("reminderTitle")?.value;
    const description = document.getElementById("reminderDescription")?.value;
    const date = document.getElementById("reminderDate")?.value;
    const time = document.getElementById("reminderTime")?.value;
    const clientId = document.getElementById("reminderClient")?.value;
    const priority = document.getElementById("reminderPriority")?.value;

    if (!title || !date || !time) {
        console.error("Missing required fields for reminder");
        showNotification("Please fill in all required fields", "error");
        return;
    }

    const newReminder = {
        id: notifications.length + 1,
        type: "reminder",
        title: title,
        message: description || "Custom reminder",
        client: clientId ? getClientName(clientId) : null,
        clientId: clientId ? Number.parseInt(clientId) : null,
        time: `${date}T${time}:00`,
        priority: priority,
        read: false,
        actionable: true,
    };

    notifications.unshift(newReminder);
    filteredNotifications = [...notifications];
    renderNotifications();
    updateStats();
    closeScheduleReminderModal();
    showNotification(`Reminder "${title}" scheduled successfully`, "success");
}

function getClientName(clientId) {
    const clients = JSON.parse(localStorage.getItem("clientsData") || "[]");
    const client = clients.find(c => c.id === Number.parseInt(clientId));
    return client?.businessName || "Unknown Client";
}

function populateClientSelect() {
    console.log("Populating client select...");
    const select = document.getElementById("reminderClient");
    if (select) {
        const clients = JSON.parse(localStorage.getItem("clientsData") || "[]");
        select.innerHTML =
            '<option value="">Select client (optional)</option>' +
            clients
                .filter((client) => client.status === "active")
                .map((client) => `<option value="${client.id}">${client.businessName}</option>`)
                .join("");
    } else {
        console.error("Reminder client select not found");
    }
}

function viewCalendar() {
    console.log("Opening calendar view...");
    showNotification("Opening calendar view (not implemented yet)", "info");
}

function openNotificationSettings() {
    console.log("Opening Notification Settings modal");
    const modal = document.getElementById("notificationSettingsModal");
    if (modal) {
        modal.classList.add("active");
    } else {
        console.error("Notification Settings modal not found");
        showNotification("Error: Notification Settings modal not found", "error");
    }
}

function closeNotificationSettingsModal() {
    console.log("Closing Notification Settings modal");
    const modal = document.getElementById("notificationSettingsModal");
    if (modal) modal.classList.remove("active");
}

function saveNotificationSettings() {
    console.log("Saving notification settings...");
    const emailNotifications = document.getElementById("emailNotifications")?.checked;
    const pushNotifications = document.getElementById("pushNotifications")?.checked;
    const paymentNotifications = document.getElementById("paymentNotifications")?.checked;
    const overdueNotifications = document.getElementById("overdueNotifications")?.checked;
    const reminderNotifications = document.getElementById("reminderNotifications")?.checked;
    const updateNotifications = document.getElementById("updateNotifications")?.checked;

    const settings = {
        emailNotifications,
        pushNotifications,
        paymentNotifications,
        overdueNotifications,
        reminderNotifications,
        updateNotifications,
    };
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    closeNotificationSettingsModal();
    showNotification("Notification settings saved", "success");
}

function openProfileModal() {
    console.log("Opening Profile modal");
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.classList.add("active");
    } else {
        console.error("Profile modal not found");
        showNotification("Error: Profile modal not found", "error");
    }
}

function closeProfileModal() {
    console.log("Closing Profile modal");
    const modal = document.getElementById("profileModal");
    if (modal) modal.classList.remove("active");
}

function editProfile() {
    console.log("Opening Edit Profile...");
    showNotification("Opening edit profile (not implemented yet)", "info");
}

function changePassword() {
    console.log("Opening Change Password...");
    showNotification("Opening change password (not implemented yet)", "info");
}

function goToNotifications() {
    console.log("Navigating to Notifications page...");
    window.location.href = "notifications.html";
}

function showNotification(message, type = "info") {
    console.log(`Showing notification: ${message} (${type})`);
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
        <button class="notification-dismiss" onclick="this.parentElement.classList.remove('show'); setTimeout(() => this.parentElement.remove(), 300);">Dismiss</button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 100);

    setTimeout(() => {
        if (notification.isConnected) {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function logout() {
    console.log("Logging out...");
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "login.html";
    }
}