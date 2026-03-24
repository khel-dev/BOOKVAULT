let clients = [];
let filteredClients = [];
let currentView = "grid";
let isLoading = true;
let lastError = null;

function getUid() {
    const uid = window.authService?.getCurrentUserId?.() || null;
    if (uid) return uid;
    const stored = localStorage.getItem("registeredUser");
    if (!stored) return null;
    try { return JSON.parse(stored)?.uid || null; } catch { return null; }
}

function setLoading(loading) {
    isLoading = loading;
    renderClients();
}

function showInlineState(container, { icon, title, body, actionLabel, actionFn } = {}) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6b7280;">
        <i class="${icon || "fas fa-users"}" style="font-size: 44px; margin-bottom: 18px; opacity: 0.6;"></i>
        <h3 style="margin:0; color:#2e3192;">${title || ""}</h3>
        <p style="margin:10px 0 18px;">${body || ""}</p>
        ${actionLabel ? `<button class="btn-primary" type="button" id="inlineActionBtn" style="margin:0 auto;">${actionLabel}</button>` : ""}
      </div>
    `;
    const btn = document.getElementById("inlineActionBtn");
    if (btn && typeof actionFn === "function") btn.addEventListener("click", actionFn);
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, initializing...");
    const storedUserData = localStorage.getItem("registeredUser");
    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        updateProfilePicture(userData.profilePicture); // Updated to use profilePicture
        updateProfileName(userData.username);
    }

    const addClientBtn = document.getElementById("addClientBtn");
    if (addClientBtn) {
        addClientBtn.addEventListener("click", () => openAddClientModal(false));
        console.log("Add New Client button event listener attached");
    } else {
        console.error("Add New Client button not found");
        alert("Error: Add New Client button not found. Please check the HTML.");
    }

    renderClients();
    updateClientStats();
    setupEventListeners();
    initializeModals();

    // Load real clients from Firestore
    setTimeout(() => loadClientsFromFirestore(), 500);
});

async function loadClientsFromFirestore() {
    const uid = getUid();
    if (!uid) {
        // Wait for auth to be ready
        let authAttempts = 0;
        while (!getUid() && authAttempts < 50) {
            await new Promise(r => setTimeout(r, 200));
            authAttempts++;
        }
        if (!getUid()) {
            lastError = "Please login first.";
            isLoading = false;
            renderClients();
            return;
        }
    }

    // Wait for userDataService
    let attempts = 0;
    while (!window.userDataService && attempts < 50) {
        await new Promise(r => setTimeout(r, 200));
        attempts++;
    }
    if (!window.userDataService) {
        lastError = "Data service failed to load. Refresh page.";
        isLoading = false;
        renderClients();
        return;
    }

    try {
        isLoading = true;
        lastError = null;
        renderClients();
        const uid = getUid();
        clients = await window.userDataService.getClients(uid);
        filteredClients = [...clients];
    } catch (e) {
        console.error(e);
        lastError = "Failed to load clients from database. Check console.";
    } finally {
        isLoading = false;
        renderClients();
        updateClientStats();
    }
}

// User Profile Functions
function updateProfilePicture(profilePicture) {
    const headerAvatar = document.getElementById("userAvatarHeader");
    const profileAvatar = document.getElementById("userAvatarProfile");
    
    const imageUrl = profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";

    if (headerAvatar) headerAvatar.src = imageUrl;
    if (profileAvatar) profileAvatar.src = imageUrl;
    console.log("Profile picture updated");
}

function updateProfileName(username) {
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) profileNameElement.textContent = username;
    console.log("Profile name updated");
}

function editProfile() {
    alert("Edit profile functionality is coming soon! For now, you can update your details in settings.");
}

function changePassword() {
    alert("Change password functionality is coming soon! Contact support if needed.");
}

function goToNotifications() {
    window.location.href = "notifications.html";
    console.log("Navigating to notifications");
}

// Modal Functions
function initializeModals() {
    const addClientModal = document.getElementById("addClientModal");
    const profileModal = document.getElementById("profileModal");

    window.addEventListener("click", (event) => {
        if (event.target === addClientModal) {
            closeAddClientModal();
        }
        if (event.target === profileModal) {
            closeProfileModal();
        }
    });
    console.log("Modal click listeners initialized");
}

function openAddClientModal(isEdit = false) {
    console.log("Attempting to open Add Client Modal...");
    const modalOverlay = document.getElementById("addClientModal");
    const modal = document.getElementById("addClientModalInner");
    if (!modalOverlay || !modal) {
        console.error("Add Client Modal or inner modal not found");
        alert("Error: Modal not found. Please check the HTML and refresh the page.");
        return;
    }

    if (!isEdit) {
        document.getElementById("addClientModal").dataset.editingId = "";
        document.getElementById("modalTitle").textContent = "Add New Client";
        document.getElementById("saveClientBtn").textContent = "Save Client";
        document.getElementById("addClientForm").reset();
    }

    modalOverlay.classList.add("active");
    modalOverlay.style.display = "flex";
    modalOverlay.style.zIndex = "1000";
    modal.style.display = "block";
    modal.style.zIndex = "1001";
    modal.style.opacity = "1";
    modal.style.position = "relative";
    modal.style.margin = "auto";
    console.log("Add Client Modal opened successfully");
}

function closeAddClientModal() {
    const modalOverlay = document.getElementById("addClientModal");
    const modal = document.getElementById("addClientModalInner");
    if (modalOverlay && modal) {
        modalOverlay.classList.remove("active");
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        document.getElementById("addClientForm").reset();
        console.log("Add Client Modal closed");
    }
}

function openProfileModal() {
    const modalOverlay = document.getElementById("profileModal");
    const modal = document.getElementById("profileModalInner");
    modalOverlay.style.display = "flex";
    modalOverlay.style.zIndex = "1000";
    modal.style.display = "block";
    modal.style.zIndex = "1001";
    modal.style.opacity = "1";
    modal.style.position = "relative";
    modal.style.margin = "auto";
    modalOverlay.classList.add("active");
    console.log("Profile Modal opened");
}

function closeProfileModal() {
    const modalOverlay = document.getElementById("profileModal");
    const modal = document.getElementById("profileModalInner");
    modalOverlay.classList.remove("active");
    modalOverlay.style.display = "none";
    modal.style.display = "none";
    console.log("Profile Modal closed");
}

// Client Management Functions
function updateClientStats() {
    const totalCount = clients.length;
    const activeCount = clients.filter(c => (c.status || "active") === 'active').length;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCount = clients.filter(c => c.startDate && new Date(c.startDate) >= firstOfMonth).length;
    const pendingCount = clients.filter(c => {
        if ((c.status || "active") !== 'active') return false;
        if (!c.lastPayment) return false;
        const lastPay = new Date(c.lastPayment);
        const daysSince = (now - lastPay) / (1000 * 60 * 60 * 24);
        return daysSince > 30;
    }).length;
    
    document.getElementById("totalClientsCount").textContent = totalCount;
    document.getElementById("activeClientsCount").textContent = activeCount;
    document.getElementById("pendingClientsCount").textContent = pendingCount;
    document.getElementById("newClientsCount").textContent = newCount;
    console.log("Client stats updated");
}

function setupEventListeners() {
    document.getElementById("clientSearch").addEventListener("input", applyFilters);
    document.getElementById("statusFilter").addEventListener("change", applyFilters);
    document.getElementById("typeFilter").addEventListener("change", applyFilters);
    document.getElementById("saveClientBtn").addEventListener("click", saveOrUpdateClient);
    console.log("Event listeners set up for filters and save button");
}

function applyFilters() {
    const searchTerm = document.getElementById("clientSearch").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const typeFilter = document.getElementById("typeFilter").value;

    filteredClients = clients.filter((client) => {
        const statusMatch = statusFilter === "all" || (client.status || "active") === statusFilter;
        const typeMatch = typeFilter === "all" || client.businessType === typeFilter;
        const searchMatch = (client.businessName || "").toLowerCase().includes(searchTerm) ||
                            (client.contactPerson || "").toLowerCase().includes(searchTerm) ||
                            (client.email || "").toLowerCase().includes(searchTerm);
        return statusMatch && typeMatch && searchMatch;
    });

    renderClients();
    console.log("Filters applied");
}

function clearFilters() {
    document.getElementById("statusFilter").value = "all";
    document.getElementById("typeFilter").value = "all";
    document.getElementById("clientSearch").value = "";
    filteredClients = [...clients];
    renderClients();
    console.log("Filters cleared");
}

function switchView(view) {
    currentView = view;
    document.querySelectorAll(".view-btn").forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`.view-btn[onclick="switchView('${view}')"]`).classList.add("active");

    const container = document.getElementById("clientsContainer");
    if (view === "list") {
        container.classList.add("list-view");
    } else {
        container.classList.remove("list-view");
    }
    renderClients();
    console.log(`Switched to ${view} view`);
}

function renderClients() {
    const container = document.getElementById("clientsContainer");

    if (isLoading) {
        showInlineState(container, {
            icon: "fas fa-circle-notch fa-spin",
            title: "Loading clients…",
            body: "Fetching your client list from the database.",
        });
        return;
    }

    if (lastError) {
        showInlineState(container, {
            icon: "fas fa-triangle-exclamation",
            title: "Couldn’t load clients",
            body: lastError,
            actionLabel: "Retry",
            actionFn: loadClientsFromFirestore,
        });
        return;
    }

    if (clients.length === 0) {
        showInlineState(container, {
            icon: "fas fa-users",
            title: "No clients yet",
            body: "Add your first client to start managing records and billing.",
            actionLabel: "Add New Client",
            actionFn: () => openAddClientModal(false),
        });
        return;
    }

    if (filteredClients.length === 0) {
        showInlineState(container, {
            icon: "fas fa-magnifying-glass",
            title: "No matches found",
            body: "Try adjusting your search or filters.",
            actionLabel: "Clear filters",
            actionFn: clearFilters,
        });
        return;
    }

    container.innerHTML = filteredClients
        .map(
            (client) => `
            <div class="client-card ${currentView === "list" ? "list-item" : ""}" onclick="viewClient('${client.id}')">
                <div class="client-header">
                    <div class="client-info">
                        <h3>${client.businessName}</h3>
                        <p>${client.contactPerson}</p>
                    </div>
                    <span class="client-status status-${client.status || "active"}">${(client.status || "active").toUpperCase()}</span>
                </div>
                
                <div class="client-details">
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${client.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${client.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Monthly Fee:</span>
                        <span class="detail-value">₱${Number(client.monthlyFee || 0).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">TIN:</span>
                        <span class="detail-value">${client.tin}</span>
                    </div>
                </div>
                
                <div class="client-actions">
                    <button class="action-btn btn-edit" onclick="editClient('${client.id}'); event.stopPropagation();" tabindex="0">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn btn-invoice" onclick="generateInvoice('${client.id}'); event.stopPropagation();" tabindex="0">
                        <i class="fas fa-file-invoice"></i> Invoice
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteClient('${client.id}'); event.stopPropagation();" tabindex="0">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `,
        )
        .join("");
    console.log("Clients rendered");
}

function saveOrUpdateClient() {
    const businessName = document.getElementById("businessName").value.trim();
    const contactPerson = document.getElementById("contactPerson").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const tin = document.getElementById("tin").value.trim();
    const businessType = document.getElementById("businessType").value;
    const monthlyFee = Number.parseFloat(document.getElementById("monthlyFee").value) || 0;
    const startDate = document.getElementById("startDate").value;

    if (!businessName || !email || !contactPerson) {
        alert("Client's Name, Business Name, and Email are required!");
        return;
    }

    const editingId = document.getElementById("addClientModal").dataset.editingId;
    const uid = getUid();
    if (!uid) {
        alert("Please login again.");
        window.location.href = "login.html";
        return;
    }
    if (!window.userDataService) {
        alert("Data service not ready. Please refresh.");
        return;
    }

    (async () => {
        try {
            if (editingId) {
                await window.userDataService.updateClient(uid, editingId, {
                    businessName,
                    contactPerson,
                    email,
                    phone,
                    address,
                    tin,
                    businessType,
                    monthlyFee,
                    startDate,
                });
                alert("Client updated successfully!");
            } else {
                await window.userDataService.addClient(uid, {
                    businessName,
                    contactPerson,
                    email,
                    phone,
                    address,
                    tin,
                    businessType,
                    monthlyFee,
                    startDate,
                    status: "active",
                    lastPayment: new Date().toISOString().split("T")[0],
                });
                alert("Client added successfully!");
            }
            closeAddClientModal();
            await loadClientsFromFirestore();
        } catch (e) {
            console.error(e);
            alert("Failed to save client. Please try again.");
        }
    })();
}

function viewClient(clientId) {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
        alert(`
            Client Details
            -----------------------
            Business: ${client.businessName}
            Contact Person: ${client.contactPerson}
            Email: ${client.email}
            Phone: ${client.phone}
            Address: ${client.address || "N/A"}
            TIN: ${client.tin || "N/A"}
            Business Type: ${client.businessType}
            Monthly Fee: ₱${Number(client.monthlyFee || 0).toLocaleString()}
            Start Date: ${client.startDate}
            Status: ${(client.status || "active").toUpperCase()}
            Last Payment: ${client.lastPayment}
        `);
    }
}

function editClient(clientId) {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
        document.getElementById("addClientModal").dataset.editingId = clientId;
        document.getElementById("modalTitle").textContent = "Edit Client";
        document.getElementById("saveClientBtn").textContent = "Update Client";
        
        document.getElementById("contactPerson").value = client.contactPerson;
        document.getElementById("businessName").value = client.businessName;
        document.getElementById("email").value = client.email;
        document.getElementById("phone").value = client.phone;
        document.getElementById("address").value = client.address || "";
        document.getElementById("tin").value = client.tin || "";
        document.getElementById("businessType").value = client.businessType;
        document.getElementById("monthlyFee").value = client.monthlyFee;
        document.getElementById("startDate").value = client.startDate;
        
        openAddClientModal(true);
        console.log(`Editing client ${clientId}`);
    }
}

function generateInvoice(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const invoice = `
Invoice for ${client.businessName}
------------------------
Contact: ${client.contactPerson}
Email: ${client.email}
Phone: ${client.phone}
Address: ${client.address || "N/A"}

Monthly Fee: ₱${client.monthlyFee.toLocaleString()}
Invoice Date: ${new Date().toLocaleDateString()}
Due Date: ${dueDate.toLocaleDateString()}

Please remit payment to BookVault Bookkeeping Services.
        `;
        alert(invoice);
        alert(`Invoice generated for ${client.businessName}`);
    }
}

function deleteClient(clientId) {
    const client = clients.find((c) => c.id === clientId);
    const uid = getUid();
    if (!uid) return;
    if (!client) return;
    if (!confirm(`Are you sure you want to delete ${client.businessName}?`)) return;
    (async () => {
        try {
            await window.userDataService.deleteClient(uid, clientId);
            alert("Client deleted.");
            await loadClientsFromFirestore();
        } catch (e) {
            console.error(e);
            alert("Failed to delete client.");
        }
    })();
}

function exportClients() {
    const activeClients = clients;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Business Name,Contact Person,Email,Phone,Address,TIN,Business Type,Monthly Fee,Start Date,Status,Last Payment\n"
        + activeClients.map(client => `${client.id},"${client.businessName.replace(/"/g, '""')}","${client.contactPerson.replace(/"/g, '""')}","${client.email}","${client.phone}","${client.address ? client.address.replace(/"/g, '""') : "N/A"}","${client.tin || "N/A"}",${client.businessType},${client.monthlyFee},${client.startDate},${client.status},${client.lastPayment}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookvault_clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Active clients exported to CSV successfully!");
}

function logout() {
    if (typeof bookvaultLogout === "function") {
        bookvaultLogout();
        return;
    }
    localStorage.removeItem("registeredUser");
    window.location.href = "login.html";
}