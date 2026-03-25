let billingStatements = [];
let filteredBillingStatements = [];
let revenueChart = null;
let isLoading = true;
let lastError = null;
let cachedClients = [];

function getUid() {
    const uid = window.authService?.getCurrentUserId?.() || null;
    if (uid) return uid;
    const stored = localStorage.getItem("registeredUser");
    if (!stored) return null;
    try { return JSON.parse(stored)?.uid || null; } catch { return null; }
}

async function loadClients() {
    const uid = getUid();
    if (!uid || !window.userDataService) return [];
    cachedClients = await window.userDataService.getClients(uid);
    return cachedClients;
}

async function loadBillingStatements() {
    const uid = getUid();
    if (!uid) return;
    if (!window.userDataService) {
        lastError = "Data service not ready. Please refresh.";
        isLoading = false;
        renderBillingStatements();
        return;
    }
    try {
        isLoading = true;
        lastError = null;
        renderBillingStatements();
        billingStatements = await window.userDataService.getBillingRecords(uid);
        filteredBillingStatements = [...billingStatements];
    } catch (e) {
        console.error(e);
        lastError = "Failed to load billing statements.";
    } finally {
        isLoading = false;
        renderBillingStatements();
        updateBillingStats();
        populateReminders();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Billing page loaded, initializing...");
    const storedUserData = localStorage.getItem("registeredUser");
    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        updateProfilePicture(userData.profilePicture);
        updateProfileName(userData.username);
    }

    renderBillingStatements();
    setupEventListeners();
    generateNewBillingStatementNumber();
    setNewDefaultDates();
    updateBillingStats();

    // Wait for both AuthService and UserDataService to be ready
    const waitForServices = setInterval(async () => {
        const uid = getUid();
        if (!uid || !window.userDataService || !window.authService) return;
        
        clearInterval(waitForServices); // stop checking
        console.log("Services ready, loading data...");

        try { await loadClients(); } catch (e) { console.error(e); }
        populateNewClientSelect();
        populateBulkClients();
        await loadBillingStatements();

        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('clientId');
        if (clientId) {
            openNewCreateBillingStatementModal(clientId);
            const clientSelect = document.getElementById("newClientSelect");
            if (clientSelect) clientSelect.value = clientId;
        }
    }, 200); // check every 200ms
});

function updateProfilePicture(profilePicture) {
    const headerAvatar = document.getElementById("userAvatarHeader");
    const profileAvatar = document.getElementById("userAvatarProfile");
    
    const imageUrl = profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";

    if (headerAvatar) headerAvatar.src = imageUrl;
    if (profileAvatar) profileAvatar.src = imageUrl;
}

function updateProfileName(username) {
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) profileNameElement.textContent = username;
}

function setupEventListeners() {
    console.log("Setting up event listeners...");
    const billingSearch = document.getElementById("billingSearch");
    if (billingSearch) {
        billingSearch.addEventListener("input", (e) => {
            console.log("Search input:", e.target.value);
            const searchTerm = e.target.value.toLowerCase();
            filteredBillingStatements = billingStatements.filter(
                (bs) =>
                    bs.id.toLowerCase().includes(searchTerm) || bs.clientName.toLowerCase().includes(searchTerm),
            );
            renderBillingStatements();
        });
    }

    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);

    const monthFilter = document.getElementById("monthFilter");
    if (monthFilter) monthFilter.addEventListener("change", applyFilters);

    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("service-amount")) {
            console.log("Service amount changed");
            calculateNewTotal();
        }
    });

    const createBillingStatementBtn = document.getElementById("createBillingStatementBtn");
    if (createBillingStatementBtn) {
        createBillingStatementBtn.addEventListener("click", () => {
            console.log("Create Billing Statement button clicked");
            openNewCreateBillingStatementModal();
        });
    }
}

function applyFilters() {
    console.log("Applying filters");
    const statusFilter = document.getElementById("statusFilter")?.value || "all";
    const monthFilter = document.getElementById("monthFilter")?.value || "all";

    filteredBillingStatements = billingStatements.filter((bs) => {
        const statusMatch = statusFilter === "all" || bs.status === statusFilter;
        const monthMatch = monthFilter === "all" || bs.billingPeriodStart.startsWith(monthFilter);
        return statusMatch && monthMatch;
    });

    renderBillingStatements();
}

function clearFilters() {
    console.log("Clearing filters");
    const statusFilter = document.getElementById("statusFilter");
    const monthFilter = document.getElementById("monthFilter");
    const billingSearch = document.getElementById("billingSearch");
    if (statusFilter) statusFilter.value = "all";
    if (monthFilter) monthFilter.value = "all";
    if (billingSearch) billingSearch.value = "";
    filteredBillingStatements = [...billingStatements];
    renderBillingStatements();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderBillingStatements() {
    const container = document.getElementById("billingStatementsTable");
    if (!container) {
        console.error("Billing statements table container not found");
        return;
    }

    if (filteredBillingStatements.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #a3a3a3;">
                <i class="fas fa-file-invoice" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No billing statements found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Billing Statement #</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Billing Period Start</th>
                    <th>Billing Period End</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredBillingStatements
                    .map(
                        (bs) => `
                        <tr>
                            <td class="invoice-number">${bs.id}</td>
                            <td class="client-name"><a href="clients.html?clientId=${bs.clientId}">${bs.clientName}</a></td>
                            <td class="invoice-amount">₱${bs.amount.toLocaleString()}</td>
                            <td>${formatDate(bs.billingPeriodStart)}</td>
                            <td>${formatDate(bs.billingPeriodEnd)}</td>
                            <td>
                                <span class="status-badge status-${bs.status}">
                                    ${bs.status}
                                </span>
                            </td>
                            <td>
                                <div class="invoice-actions">
                                    <button class="action-btn-small btn-view" onclick="viewBillingStatement('${bs.id}')" type="button">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn-small btn-send" onclick="sendBillingStatement('${bs.id}')" type="button">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                    <button class="action-btn-small btn-delete" onclick="deleteBillingStatement('${bs.id}')" type="button">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `,
                    )
                    .join("")}
            </tbody>
        </table>
    `;
}

function populateNewClientSelect() {
    const select = document.getElementById("newClientSelect");
    if (select) {
        select.innerHTML =
            '<option value="">Choose a client...</option>' +
            (cachedClients || [])
                .filter((client) => (client.status || "active") === "active")
                .map((client) => `<option value="${client.id}">${client.businessName || "Unnamed Client"}</option>`)
                .join("");
    } else {
        console.error("New Client select element not found");
    }
}

function generateNewBillingStatementNumber() {
    const nextNumber = billingStatements.length + 1;
    const billingStatementNumber = `BS-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, "0")}`;
    const billingStatementNumberInput = document.getElementById("newBillingStatementNumber");
    if (billingStatementNumberInput) billingStatementNumberInput.value = billingStatementNumber;
}

function setNewDefaultDates() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const billingPeriodStartInput = document.getElementById("newBillingPeriodStart");
    const billingPeriodEndInput = document.getElementById("newBillingPeriodEnd");
    if (billingPeriodStartInput) billingPeriodStartInput.value = startOfMonth.toISOString().split("T")[0];
    if (billingPeriodEndInput) billingPeriodEndInput.value = endOfMonth.toISOString().split("T")[0];
}

function openNewCreateBillingStatementModal(clientId = null) {
    const modal = document.getElementById("newCreateBillingStatementModal");
    if (modal) {
        document.body.appendChild(modal);
        modal.classList.add("active");
        generateNewBillingStatementNumber();
        setNewDefaultDates();
        resetNewServices();
        calculateNewTotal();
        if (clientId) {
            const clientSelect = document.getElementById("newClientSelect");
            if (clientSelect) clientSelect.value = clientId;
            const client = (cachedClients || []).find(c => c.id === clientId);
            if (client) {
                const servicesContainer = document.getElementById("newServicesContainer");
                if (servicesContainer) {
                    servicesContainer.innerHTML = `
                        <div class="service-item">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Service Description</label>
                                    <input type="text" class="service-description" value="Monthly Bookkeeping Services">
                                </div>
                                <div class="form-group">
                                    <label>Amount</label>
                                    <input type="number" class="service-amount" step="0.01" value="${client.monthlyFee}">
                                </div>
                                <div class="form-group">
                                    <button type="button" class="btn-remove" onclick="removeNewService(this)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    calculateNewTotal();
                }
            }
        }
    }
}

function closeNewCreateBillingStatementModal() {
    console.log("Closing New Create Billing Statement Modal");
    const modal = document.getElementById("newCreateBillingStatementModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
        const form = document.getElementById("newCreateBillingStatementForm");
        if (form) form.reset();
        resetNewServices();
        calculateNewTotal();
    }
}

function addNewService() {
    console.log("Adding new service");
    const container = document.getElementById("newServicesContainer");
    if (!container) {
        console.error("New Services container not found");
        return;
    }

    const serviceItem = document.createElement("div");
    serviceItem.className = "service-item";
    serviceItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Service Description</label>
                <input type="text" class="service-description" placeholder="Service description">
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" class="service-amount" step="0.01" placeholder="0.00">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove" onclick="removeNewService(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(serviceItem);
}

function removeNewService(button) {
    console.log("Removing service");
    button.closest(".service-item").remove();
    calculateNewTotal();
}

function resetNewServices() {
    const container = document.getElementById("newServicesContainer");
    if (container) {
        container.innerHTML = `
            <div class="service-item">
                <div class="form-row">
                    <div class="form-group">
                        <label>Service Description</label>
                        <input type="text" class="service-description" placeholder="Monthly bookkeeping services">
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" class="service-amount" step="0.01" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn-remove" onclick="removeNewService(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function calculateNewTotal() {
    const serviceAmounts = document.querySelectorAll(".service-amount");
    let subtotal = 0;

    serviceAmounts.forEach((input) => {
        const amount = Number.parseFloat(input.value) || 0;
        subtotal += amount;
    });

    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const subtotalElement = document.getElementById("newSubtotal");
    const taxElement = document.getElementById("newTax");
    const totalElement = document.getElementById("newTotal");

    if (subtotalElement) subtotalElement.textContent = `₱${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    if (taxElement) taxElement.textContent = `₱${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    if (totalElement) totalElement.textContent = `₱${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function createNewBillingStatement() {
    const clientSelect = document.getElementById("newClientSelect");
    if (!clientSelect || !clientSelect.value) {
        showNotification("Please select a client", "error");
        return;
    }

    const clientId = clientSelect.value; // ← string lang, huwag parseInt
    const client = (cachedClients || []).find(c => c.id === clientId);

    if (!client) {
        showNotification("Please select a client", "error");
        return;
    }

    const services = [];
    const serviceDescriptions = document.querySelectorAll(".service-description");
    const serviceAmounts = document.querySelectorAll(".service-amount");

    for (let i = 0; i < serviceDescriptions.length; i++) {
        const description = serviceDescriptions[i].value.trim();
        const amount = parseFloat(serviceAmounts[i].value) || 0;
        if (description && amount > 0) {
            services.push({ description, amount });
        }
    }

    if (services.length === 0) {
        showNotification("Please add at least one valid service with amount", "error");
        return;
    }

    const subtotal = services.reduce((sum, s) => sum + s.amount, 0);
    const totalAmount = Math.round(subtotal * 1.12 * 100) / 100;

    const newBillingStatement = {
        clientId: clientId,
        clientName: client.businessName,
        amount: totalAmount,
        status: "pending",
        billingPeriodStart: document.getElementById("newBillingPeriodStart")?.value,
        billingPeriodEnd: document.getElementById("newBillingPeriodEnd")?.value,
        services: services,
        notes: document.getElementById("newBillingNotes")?.value || "",
    };

    const uid = getUid();
    if (!uid || !window.userDataService) {
        showNotification("Please login again.", "error");
        return;
    }

    (async () => {
        try {
            const docId = await window.userDataService.addBillingRecord(uid, newBillingStatement);
            closeNewCreateBillingStatementModal();
            showNotification(`Billing Statement created for ${client.businessName}!`, "success");
            await loadBillingStatements();
        } catch (e) {
            console.error(e);
            showNotification("Failed to create billing statement.", "error");
        }
    })();
}

function saveNewDraft() {
    console.log("Saving new draft");
    const clientId = Number.parseInt(document.getElementById("newClientSelect")?.value);
    const client = (cachedClients || []).find((c) => c.id === String(clientId)) || (cachedClients || []).find(c => c.id === clientId);

    if (!client) {
        showNotification("Please select a client", "error");
        return;
    }

    const services = [];
    const serviceDescriptions = document.querySelectorAll(".service-description");
    const serviceAmounts = document.querySelectorAll(".service-amount");

    for (let i = 0; i < serviceDescriptions.length; i++) {
        const description = serviceDescriptions[i].value.trim();
        const amount = Number.parseFloat(serviceAmounts[i].value) || 0;

        if (description && amount > 0) {
            services.push({ description, amount });
        }
    }

    const newBillingStatement = {
        id: document.getElementById("newBillingStatementNumber")?.value,
        clientId: clientId,
        clientName: client.businessName,
        amount: services.reduce((sum, service) => sum + service.amount, 0) * 1.12,
        status: "draft",
        billingPeriodStart: document.getElementById("newBillingPeriodStart")?.value,
        billingPeriodEnd: document.getElementById("newBillingPeriodEnd")?.value,
        services: services,
        notes: document.getElementById("newBillingNotes")?.value,
    };

    const uid = getUid();
    if (!uid || !window.userDataService) {
        showNotification("Please login again.", "error");
        return;
    }

    (async () => {
        try {
            await window.userDataService.addBillingRecord(uid, newBillingStatement);
            closeNewCreateBillingStatementModal();
            showNotification(`Draft saved`, "info");
            await loadBillingStatements();
        } catch (e) {
            console.error(e);
            showNotification("Failed to save draft.", "error");
        }
    })();
}

function viewBillingStatement(billingStatementId) {
    console.log(`Viewing billing statement ${billingStatementId}`);
    const billingStatement = billingStatements.find((bs) => bs.id === billingStatementId);
    if (billingStatement) {
        const viewBillingStatementNumber = document.getElementById("viewBillingStatementNumber");
        const viewClientName = document.getElementById("viewClientName");
        const viewBillingPeriodStart = document.getElementById("viewBillingPeriodStart");
        const viewBillingPeriodEnd = document.getElementById("viewBillingPeriodEnd");
        const viewStatus = document.getElementById("viewStatus");
        const viewServices = document.getElementById("viewServices");
        const viewSubtotal = document.getElementById("viewSubtotal");
        const viewTax = document.getElementById("viewTax");
        const viewTotal = document.getElementById("viewTotal");
        const viewNotes = document.getElementById("viewNotes");

        if (viewBillingStatementNumber) viewBillingStatementNumber.textContent = billingStatement.id;
        if (viewClientName) viewClientName.innerHTML = `<a href="clients.html?clientId=${billingStatement.clientId}">${billingStatement.clientName}</a>`;
        if (viewBillingPeriodStart) viewBillingPeriodStart.textContent = formatDate(billingStatement.billingPeriodStart);
        if (viewBillingPeriodEnd) viewBillingPeriodEnd.textContent = formatDate(billingStatement.billingPeriodEnd);
        if (viewStatus) viewStatus.innerHTML = `<span class="status-badge status-${billingStatement.status}">${billingStatement.status}</span>`;

        if (viewServices) {
            viewServices.innerHTML = billingStatement.services
                .map((service) => `<p>${service.description}: ₱${service.amount.toLocaleString()}</p>`)
                .join("");
        }

        const subtotal = billingStatement.services.reduce((sum, service) => sum + service.amount, 0);
        const tax = subtotal * 0.12;
        if (viewSubtotal) viewSubtotal.textContent = `₱${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        if (viewTax) viewTax.textContent = `₱${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        if (viewTotal) viewTotal.textContent = `₱${billingStatement.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        if (viewNotes) viewNotes.textContent = billingStatement.notes || "No notes";

        const modal = document.getElementById("viewBillingStatementModal");
        if (modal) {
            modal.style.display = "flex";
            modal.classList.add("active");
        } else {
            console.error("View Billing Statement Modal not found");
            showNotification("Error: View Billing Statement modal not found", "error");
        }
    }
}

function closeViewBillingStatementModal() {
    console.log("Closing View Billing Statement Modal");
    const modal = document.getElementById("viewBillingStatementModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

function sendBillingStatement(billingStatementId) {
    console.log(`Sending billing statement ${billingStatementId}`);
    const billingStatement = billingStatements.find((bs) => bs.id === billingStatementId);
    if (billingStatement) {
        showNotification(`Billing Statement ${billingStatementId} sent to ${billingStatement.clientName}`, "success");
    }
}

function deleteBillingStatement(billingStatementId) {
    console.log(`Deleting billing statement ${billingStatementId}`);
    if (confirm(`Are you sure you want to delete billing statement ${billingStatementId}?`)) {
        const uid = getUid();
        if (!uid || !window.userDataService) return;
        (async () => {
            try {
                await window.userDataService.deleteBillingRecord(uid, billingStatementId);
                showNotification(`Billing Statement deleted`, "info");
                await loadBillingStatements();
            } catch (e) {
                console.error(e);
                showNotification("Failed to delete billing statement.", "error");
            }
        })();
    }
}

function populateBulkClients() {
    const container = document.getElementById("bulkClientsList");
    if (container) {
        container.innerHTML = (cachedClients || [])
            .filter((client) => (client.status || "active") === "active")
            .map(
                (client) => `
                <div class="bulk-client-item">
                    <input type="checkbox" class="bulk-client-checkbox" value="${client.id}">
                    <span>${client.businessName}</span>
                </div>
            `,
            )
            .join("");
    } else {
        console.error("Bulk clients list container not found");
    }
}

function openBulkBillingStatementModal() {
    console.log("Opening Bulk Billing Statement Modal");
    const modal = document.getElementById("bulkBillingStatementModal");
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("active");
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const bulkBillingPeriodStart = document.getElementById("bulkBillingPeriodStart");
        const bulkBillingPeriodEnd = document.getElementById("bulkBillingPeriodEnd");
        if (bulkBillingPeriodStart) bulkBillingPeriodStart.value = startOfMonth.toISOString().split("T")[0];
        if (bulkBillingPeriodEnd) bulkBillingPeriodEnd.value = endOfMonth.toISOString().split("T")[0];
    } else {
        console.error("Bulk Billing Statement Modal not found");
        showNotification("Error: Bulk Billing Statement modal not found", "error");
    }
}

function closeBulkBillingStatementModal() {
    console.log("Closing Bulk Billing Statement Modal");
    const modal = document.getElementById("bulkBillingStatementModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

function generateBulkBillingStatements() {
    console.log("Generating bulk billing statements");
    const selectedClients = Array.from(document.querySelectorAll(".bulk-client-checkbox:checked")).map(
        (checkbox) => Number.parseInt(checkbox.value),
    );

    if (selectedClients.length === 0) {
        showNotification("Please select at least one client", "error");
        return;
    }

    const serviceDescription = document.getElementById("bulkServiceDescription").value;
    const billingPeriodStart = document.getElementById("bulkBillingPeriodStart").value;
    const billingPeriodEnd = document.getElementById("bulkBillingPeriodEnd").value;
    const useMonthlyFee = document.getElementById("useMonthlyFee").checked;

    const uid = getUid();
    if (!uid || !window.userDataService) {
        showNotification("Please login again.", "error");
        return;
    }

    selectedClients.forEach((clientId) => {
        const client = (cachedClients || []).find((c) => c.id === String(clientId)) || (cachedClients || []).find(c => c.id === clientId);
        if (client) {
            const nextNumber = billingStatements.length + 1;
            const billingStatementId = `BS-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, "0")}`;
            const amount = useMonthlyFee ? client.monthlyFee : 1000;
            const newBillingStatement = {
                id: billingStatementId,
                clientId: client.id,
                clientName: client.businessName,
                amount: Math.round(amount * 1.12 * 100) / 100,
                status: "pending",
                billingPeriodStart: billingPeriodStart,
                billingPeriodEnd: billingPeriodEnd,
                services: [{ description: serviceDescription, amount }],
                notes: "",
            };
            // Save each statement to Firestore
            window.userDataService.addBillingRecord(uid, newBillingStatement).catch(console.error);
        }
    });

    closeBulkBillingStatementModal();
    showNotification(`${selectedClients.length} billing statements generated`, "success");
    setTimeout(() => loadBillingStatements(), 600);
}

function populateReminders() {
    const container = document.getElementById("remindersList");
    if (container) {
        const now = new Date();
        const overdueBillingStatements = billingStatements.filter((bs) => {
            return bs.status === "pending" && new Date(bs.billingPeriodEnd) < now;
        });
        container.innerHTML = overdueBillingStatements
            .map(
                (billingStatement) => `
                <div class="reminder-item">
                    <input type="checkbox" class="reminder-checkbox" value="${billingStatement.id}">
                    <span>${billingStatement.id} - ${billingStatement.clientName} (Due: ${formatDate(billingStatement.billingPeriodEnd)})</span>
                </div>
            `,
            )
            .join("");
    } else {
        console.error("Reminders list container not found");
    }
}

function openRemindersModal() {
    console.log("Opening Reminders Modal");
    const modal = document.getElementById("remindersModal");
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("active");
        populateReminders();
    } else {
        console.error("Reminders Modal not found");
        showNotification("Error: Reminders modal not found", "error");
    }
}

function closeRemindersModal() {
    console.log("Closing Reminders Modal");
    const modal = document.getElementById("remindersModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

function sendReminders() {
    console.log("Sending reminders");
    const selectedBillingStatements = Array.from(document.querySelectorAll(".reminder-checkbox:checked")).map(
        (checkbox) => checkbox.value,
    );

    if (selectedBillingStatements.length === 0) {
        showNotification("Please select at least one billing statement", "error");
        return;
    }

    selectedBillingStatements.forEach((billingStatementId) => {
        const billingStatement = billingStatements.find((bs) => bs.id === billingStatementId);
        if (billingStatement) {
            showNotification(`Reminder sent for billing statement ${billingStatementId} to ${billingStatement.clientName}`, "success");
        } else {
            console.error(`Billing Statement ${billingStatementId} not found`);
        }
      });

    closeRemindersModal();
}

function updateBillingStats() {
    const totalRevenue = document.getElementById("totalRevenue");
    const paidBillingStatements = document.getElementById("paidBillingStatements");
    const pendingBillingStatements = document.getElementById("pendingBillingStatements");
    const overdueBillingStatements = document.getElementById("overdueBillingStatements");
    const revenueChange = document.getElementById("revenueChange");
    const paidCount = document.getElementById("paidCount");
    const pendingCount = document.getElementById("pendingCount");
    const overdueCount = document.getElementById("overdueCount");

    if (totalRevenue) totalRevenue.textContent = `₱${billingStatements.reduce((sum, bs) => sum + (bs.status === "paid" ? bs.amount : 0), 0).toLocaleString()}`;
    if (paidBillingStatements) paidBillingStatements.textContent = `₱${billingStatements.reduce((sum, bs) => sum + (bs.status === "paid" ? bs.amount : 0), 0).toLocaleString()}`;
    if (pendingBillingStatements) pendingBillingStatements.textContent = `₱${billingStatements.reduce((sum, bs) => sum + (bs.status === "pending" ? bs.amount : 0), 0).toLocaleString()}`;
    if (overdueBillingStatements) overdueBillingStatements.textContent = `₱${billingStatements.reduce((sum, bs) => sum + (bs.status === "overdue" ? bs.amount : 0), 0).toLocaleString()}`;
    if (revenueChange) revenueChange.textContent = `+${Math.floor(Math.random() * 10)}% this month`;
    if (paidCount) paidCount.textContent = `${billingStatements.filter(bs => bs.status === "paid").length} statements`;
    if (pendingCount) pendingCount.textContent = `${billingStatements.filter(bs => bs.status === "pending").length} statements`;
    if (overdueCount) overdueCount.textContent = `${billingStatements.filter(bs => bs.status === "overdue").length} statements`;
}

function refreshBillingStatements() {
    console.log("Refreshing billing statements");
    filteredBillingStatements = [...billingStatements];
    renderBillingStatements();
    updateBillingStats();
}

function exportBilling() {
    console.log("Exporting billing statements");
    const csv = [
        ["Billing Statement #", "Client", "Amount", "Billing Period Start", "Billing Period End", "Status"],
        ...billingStatements.map(bs => [
            bs.id,
            bs.clientName,
            `₱${bs.amount.toLocaleString()}`,
            formatDate(bs.billingPeriodStart),
            formatDate(bs.billingPeriodEnd),
            bs.status
        ])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_statements_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function goToNotifications() {
    window.location.href = "notifications.html";
}

function openProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.classList.add("active");
    }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.classList.remove("active");
    }
}

function editProfile() {
    console.log("Edit profile clicked");
    window.location.href = "settings.html";
}

function changePassword() {
    console.log("Change password clicked");
    window.location.href = "settings.html";
}

function logout() {
    console.log("Logging out");
    if (typeof bookvaultLogout === "function") {
        bookvaultLogout({ confirmFirst: false });
        return;
    }
    localStorage.removeItem("registeredUser");
    window.location.href = "login.html";
}

function openReportsModal() {
    console.log("Opening Reports Modal");
    const modal = document.getElementById("reportsModal");
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("active");
    }
}

function closeReportsModal() {
    console.log("Closing Reports Modal");
    const modal = document.getElementById("reportsModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

function showReportTab(tab) {
    console.log(`Showing ${tab} report tab`);
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.tab-btn[onclick="showReportTab('${tab}')"]`).classList.add("active");

    const reportContent = document.querySelector(".report-content");
    if (reportContent) {
        if (revenueChart) revenueChart.destroy();
        const ctx = document.getElementById("revenueChart").getContext("2d");
        revenueChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: tab === "monthly" ? "Monthly Revenue" : tab === "client" ? "Client Revenue" : "Status Revenue",
                    data: Array(12).fill(0).map(() => Math.floor(Math.random() * 5000)),
                    backgroundColor: "#00adef",
                    borderColor: "#2e3192",
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: true } }
            }
        });
    }
}

function exportReport() {
    console.log("Exporting report");
    const csv = [["Month", "Revenue"], ...Array(12).fill(0).map((_, i) => [`${i + 1}`, Math.floor(Math.random() * 5000)])].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="${type === "success" ? "fas fa-check-circle" : type === "error" ? "fas fa-exclamation-circle" : "fas fa-info-circle"}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}