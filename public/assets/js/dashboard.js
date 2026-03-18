// Function to update the greeting with the username
function updateGreeting(username) {
    const greetingElement = document.querySelector(".welcome-text h1");
    if (greetingElement) {
        greetingElement.textContent = `HELLO, ${username.toUpperCase()}!`;
    }
}

// Function to update the profile name
function updateProfileName(username) {
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) {
        profileNameElement.textContent = username;
    }
}

// Function to update the profile picture using the stored profilePicture
function updateProfilePicture(profilePicture) {
    const headerAvatar = document.getElementById("userAvatarHeader");
    const profileAvatar = document.getElementById("userAvatarProfile");
    
    const imageUrl = profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";

    if (headerAvatar) {
        headerAvatar.src = imageUrl;
    }
    if (profileAvatar) {
        profileAvatar.src = imageUrl;
    }
}

function getUid() {
    const uid = window.authService?.getCurrentUserId?.() || null;
    if (uid) return uid;
    const stored = localStorage.getItem("registeredUser");
    if (!stored) return null;
    try { return JSON.parse(stored)?.uid || null; } catch { return null; }
}

async function fetchDashboardData() {
    const uid = getUid();
    if (!uid) return { clients: [], billing: [] };
    // Wait for service
    let attempts = 0;
    while (!window.userDataService && attempts < 100) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }
    if (!window.userDataService) console.error('userDataService not ready');
    const [clients, billing] = await Promise.all([
        window.userDataService.getClients(uid),
        window.userDataService.getBillingRecords(uid),
    ]);
    return { clients, billing };
}

// Chart.js instances
let mainChart;
let lineChart;
let pieChart;

function initializeCharts(clients) {
    // Main Bar Chart
    const mainCtx = document.getElementById("mainChart").getContext("2d");
    mainChart = new Chart(mainCtx, {
        type: "bar",
        data: {
            labels: clients.map(client => client.businessName),
            datasets: [
                {
                    label: "2023",
                    data: clients.map(() => Math.floor(Math.random() * 2000) + 1000),
                    backgroundColor: "#8979ff",
                    borderRadius: 4,
                    maxBarThickness: 40
                },
                {
                    label: "2024",
                    data: clients.map(() => Math.floor(Math.random() * 2000) + 1500),
                    backgroundColor: "#ff928a",
                    borderRadius: 4,
                    maxBarThickness: 40
                },
                {
                    label: "2025",
                    data: clients.map(client => client.monthlyFee),
                    backgroundColor: "#00adef",
                    borderRadius: 4,
                    maxBarThickness: 40
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: "#a3a3a3",
                        maxRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: "#ced5e0",
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: "#a3a3a3",
                        callback: (value) => "$" + value
                    },
                    max: 4000
                }
            }
        }
    });

    // Line Chart
    const lineCtx = document.getElementById("lineChart").getContext("2d");
    lineChart = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    label: "Paid",
                    data: [8500, 9200, 8800, 10200, 9800, 11500, 10800, 11200, 9600, 10800, 11800, 12450],
                    borderColor: "#8979ff",
                    backgroundColor: "rgba(137, 121, 255, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: "#8979ff",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2
                },
                {
                    label: "Unpaid",
                    data: [3200, 2800, 3100, 2400, 2600, 1800, 2200, 1900, 2800, 2200, 1600, 1200],
                    borderColor: "#ff928a",
                    backgroundColor: "rgba(255, 146, 138, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: "#ff928a",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: "#a3a3a3"
                    }
                },
                y: {
                    grid: {
                        color: "#ced5e0",
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: "#a3a3a3",
                        callback: (value) => "$" + value
                    }
                }
            }
        }
    });

    // Pie Chart
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    pieChart = new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: ["Active Clients", "Pending Clients"],
            datasets: [
                {
                    data: [
                        clients.filter(c => c.status === 'active').length,
                        clients.filter(c => c.status === 'pending').length
                    ],
                    backgroundColor: ["#6fd195", "#ff928a"],
                    borderWidth: 0,
                    cutout: "60%"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
        item.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href && href !== "#" && !href.includes("javascript:")) {
                return;
            }
            e.preventDefault();
            navItems.forEach((nav) => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    const chartTabs = document.querySelectorAll(".chart-tab");
    chartTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            chartTabs.forEach((t) => t.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Search functionality
    const searchInput = document.querySelector(".search-container input");
    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        filterClients(query);
    });
}

function initializeModals() {
    window.addEventListener("click", (event) => {
        const profileModal = document.getElementById("profileModal");
        if (event.target === profileModal) {
            closeProfileModal();
        }
    });
}

function goToClients() {
    window.location.href = "clients.html";
}

function openProfileModal() {
    document.getElementById("profileModal").style.display = "flex";
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

function openNotifications() {
    window.location.href = "notifications.html";
}

function viewClientDetails(clientName) {
    const clientList = document.querySelector(".client-list");
    const client = null;
    if (client) {
        alert(
            `Client: ${client.businessName}\nRevenue: $${client.monthlyFee}\nStatus: ${client.status}\nLast Payment: ${client.lastPayment}`
        );
    } else if (clientList) {
        // No-op: detailed view is handled on Clients page
    }
}

function updateClientsList(filteredData = []) {
    const clientList = document.querySelector(".client-list");
    clientList.innerHTML = "";

    const clientNames = filteredData.map(client => client.businessName);
    if (clientNames.length === 0) {
        clientList.innerHTML = `<p style="text-align:center; color: white; opacity:0.8;">No clients found.</p>`;
        return;
    }

    clientNames.forEach((clientName) => {
        const client = filteredData.find(c => c.businessName === clientName);
        const clientItem = document.createElement("div");
        clientItem.className = "client-item";
        clientItem.onclick = () => viewClientDetails(clientName);

        clientItem.innerHTML = `
            <div class="client-avatar"></div>
            <span>${clientName}</span>
            <div class="client-status ${client.status}">${client.status}</div>
        `;

        clientList.appendChild(clientItem);
    });
}

function filterClients(query) {
    const clients = [];
    const filteredClients = clients.filter(client => client.businessName.toLowerCase().includes(query));
    updateClientsList(filteredClients);
}

function updateMetrics() {
    // Legacy function retained for compatibility; metrics now come from Firestore.
}

function updateChartsData() {
    // Legacy function retained for compatibility; charts now come from Firestore.
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const storedUserData = localStorage.getItem("registeredUser");

    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const username = userData.username;
        const profilePicture = userData.profilePicture;
        
        // Update elements with the stored username and profile picture
        updateGreeting(username);
        updateProfileName(username);
        updateProfilePicture(profilePicture);
    } 

(async () => {
        let attempts = 0;
        while (attempts < 5) {
            try {
                const { clients, billing } = await fetchDashboardData();
                updateMetricsFromFirestore(clients, billing);
                initializeChartsFromFirestore(clients, billing);
                updateClientsListFromFirestore(clients);
                break;
            } catch (e) {
                console.error('Dashboard load attempt', attempts + 1, e);
                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }
        }
    })();
    initializeNavigation();
    initializeModals();
});

function updateMetricsFromFirestore(clients, billing) {
    const totalClientsEl = document.getElementById("totalClients");
    if (totalClientsEl) totalClientsEl.textContent = String(clients.length);

    const activeClients = clients.filter(c => c.status === 'active' || !c.status).length;
    const subscriptionRevenue = activeClients * 299;
    const paidBillingRevenue = billing.reduce((sum, b) => sum + (b.status === "paid" ? Number(b.amount || 0) : 0), 0);
    const totalRevenue = subscriptionRevenue + paidBillingRevenue;
    const revenueEl = document.getElementById("totalRevenue");
    if (revenueEl) revenueEl.textContent = `₱${totalRevenue.toLocaleString()}`;

    const upcoming = billing.filter(b => ["pending","overdue"].includes(b.status)).length;
    const upcomingEl = document.getElementById("upcomingDues");
    if (upcomingEl) upcomingEl.textContent = String(upcoming);
}

function initializeChartsFromFirestore(clients, billing) {
    // If no data, don't render noisy charts
    if (!clients.length) return;
    initializeCharts(clients);
}

function updateClientsListFromFirestore(clients) {
    const list = document.querySelector(".client-list");
    if (!list) return;
    if (!clients.length) {
        list.innerHTML = `<div style="opacity:.9;">No clients yet — add your first client.</div>`;
        return;
    }
    list.innerHTML = clients.slice(0, 5).map(c => `
      <div class="client-item">
        <div class="client-avatar"></div>
        <div>
          <div style="font-weight:700;">${c.businessName || "Unnamed Client"}</div>
          <div style="font-size:12px;opacity:.9;">${c.contactPerson || ""}</div>
        </div>
        <span class="client-status ${c.status || "active"}">${(c.status || "active")}</span>
      </div>
    `).join("");
}

// Dummy functions for buttons
function logout() {
    if (typeof bookvaultLogout === "function") {
        bookvaultLogout();
        return;
    }
    // Fallback
    localStorage.removeItem("registeredUser");
    window.location.href = "login.html";
}

function editProfile() {
    alert("Redirecting to profile edit page...");
}

function changePassword() {
    alert("Redirecting to change password page...");
}