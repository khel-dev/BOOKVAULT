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

// Function to get clients from localStorage (synchronized with clients.js)
function getClients() {
    const storedClients = localStorage.getItem('clientsData');
    if (storedClients) {
        return JSON.parse(storedClients);
    }
    return [
        {
            id: 1,
            businessName: "Niyan Vulcanizing Shop",
            contactPerson: "Juan Dela Cruz",
            email: "juan@niyanvulcanizing.com",
            phone: "+63 912 345 6789",
            address: "123 Main St, Quezon City",
            tin: "123-456-789-000",
            businessType: "business",
            monthlyFee: 2500,
            startDate: "2024-01-15",
            status: "active",
            lastPayment: "2024-12-01"
        },
        {
            id: 2,
            businessName: "Jepoy's N Grills",
            contactPerson: "Joseph Santos",
            email: "jepoy@ngrills.com",
            phone: "+63 917 234 5678",
            address: "456 Food St, Manila",
            tin: "234-567-890-111",
            businessType: "business",
            monthlyFee: 3000,
            startDate: "2024-02-01",
            status: "active",
            lastPayment: "2024-12-01"
        },
        {
            id: 3,
            businessName: "Bating's Fried Rice",
            contactPerson: "Roberto Bating",
            email: "berto@batingrice.com",
            phone: "+63 918 345 6789",
            address: "789 Rice Ave, Makati",
            tin: "345-678-901-222",
            businessType: "individual",
            monthlyFee: 1500,
            startDate: "2024-03-10",
            status: "pending",
            lastPayment: "2024-11-01"
        },
        {
            id: 4,
            businessName: "Sticky Printing Shop",
            contactPerson: "Maria Garcia",
            email: "maria@stickyprint.com",
            phone: "+63 919 456 7890",
            address: "321 Print Blvd, Pasig",
            tin: "456-789-012-333",
            businessType: "business",
            monthlyFee: 2000,
            startDate: "2024-04-05",
            status: "active",
            lastPayment: "2024-12-01"
        },
        {
            id: 5,
            businessName: "Ashop Sari-Sari Store",
            contactPerson: "Ana Reyes",
            email: "ana@ashopstore.com",
            phone: "+63 920 567 8901",
            address: "654 Store St, Taguig",
            tin: "567-890-123-444",
            businessType: "individual",
            monthlyFee: 1200,
            startDate: "2024-05-20",
            status: "inactive",
            lastPayment: "2024-10-01"
        }
    ];
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
    const clients = getClients();
    const client = clients.find(c => c.businessName === clientName);
    if (client) {
        alert(
            `Client: ${client.businessName}\nRevenue: $${client.monthlyFee}\nStatus: ${client.status}\nLast Payment: ${client.lastPayment}`
        );
    }
}

function updateClientsList(filteredData = getClients()) {
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
    const clients = getClients();
    const filteredClients = clients.filter(client => client.businessName.toLowerCase().includes(query));
    updateClientsList(filteredClients);
}

function updateMetrics() {
    const clients = getClients();
    const totalClients = clients.filter(c => c.status !== "deleted").length;
    const totalRevenue = clients.reduce((sum, client) => sum + (client.monthlyFee || 0), 0);
    const upcomingDues = clients.filter(c => {
        if (c.status !== 'active') return false;
        const lastPay = new Date(c.lastPayment);
        const now = new Date();
        const daysSince = (now - lastPay) / (1000 * 60 * 60 * 24);
        return daysSince > 30;
    }).length;

    document.getElementById("totalClients").textContent = totalClients;
    document.getElementById("totalRevenue").textContent = `$${totalRevenue.toLocaleString()}`;
    document.getElementById("upcomingDues").textContent = upcomingDues;
}

function updateChartsData() {
    const clients = getClients();
    // Update data for mainChart
    mainChart.data.labels = clients.map(client => client.businessName);
    mainChart.data.datasets[2].data = clients.map(client => client.monthlyFee);
    mainChart.update();

    // Update data for pieChart
    pieChart.data.datasets[0].data = [
        clients.filter(c => c.status === 'active').length,
        clients.filter(c => c.status === 'pending').length
    ];
    pieChart.update();
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

    const clients = getClients();
    initializeCharts(clients);
    initializeNavigation();
    initializeModals();
    updateClientsList();
    updateMetrics();
    updateChartsData();
});

// Dummy functions for buttons
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("registeredUser");
        window.location.href = "login.html";
    }
}

function editProfile() {
    alert("Redirecting to profile edit page...");
}

function changePassword() {
    alert("Redirecting to change password page...");
}