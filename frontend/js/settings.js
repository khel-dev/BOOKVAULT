// Settings functionality
document.addEventListener("DOMContentLoaded", () => {
    loadSettings()
    initializeModals()
    updateProfile()
})

function loadSettings() {
    // Load saved settings from localStorage
    const savedTheme = localStorage.getItem("theme") || "light"
    const savedLanguage = localStorage.getItem("language") || "en"
    const savedCurrency = localStorage.getItem("currency") || "USD"

    // Apply saved settings
    document.querySelector('select[onchange="changeTheme(this.value)"]').value = savedTheme
    document.querySelector('select[onchange="changeLanguage(this.value)"]').value = savedLanguage
    document.querySelector('select[onchange="changeCurrency(this.value)"]').value = savedCurrency

    // Load notification preferences
    const emailNotif = localStorage.getItem("emailNotifications") !== "false"
    const smsNotif = localStorage.getItem("smsNotifications") === "true"
    const desktopNotif = localStorage.getItem("desktopNotifications") !== "false"
    const twoFactor = localStorage.getItem("twoFactor") === "true"
    const autoBackup = localStorage.getItem("autoBackup") !== "false"

    document.getElementById("emailNotif").checked = emailNotif
    document.getElementById("smsNotif").checked = smsNotif
    document.getElementById("desktopNotif").checked = desktopNotif
    document.getElementById("twoFactor").checked = twoFactor
    document.getElementById("autoBackup").checked = autoBackup
}

function initializeModals() {
    window.addEventListener("click", (event) => {
        const passwordModal = document.getElementById("passwordModal")
        const profileModal = document.getElementById("profileModal")
        if (event.target === passwordModal) {
            closePasswordModal()
        }
        if (event.target === profileModal) {
            closeProfileModal()
        }
    })
}

function updateProfile() {
    const storedUserData = localStorage.getItem("registeredUser")
    if (storedUserData) {
        const userData = JSON.parse(storedUserData)
        const username = userData.username
        const profilePicture = userData.profilePicture // Updated to use profilePicture

        // Update profile name
        const profileNameElement = document.getElementById("profileName")
        if (profileNameElement) {
            profileNameElement.textContent = username
        }

        // Update profile picture
        updateProfilePicture(profilePicture) // Updated to use profilePicture
    }
}

function updateProfilePicture(profilePicture) {
    const headerAvatar = document.getElementById("userAvatarHeader")
    const profileAvatar = document.getElementById("userAvatarProfile")
    
    const imageUrl = profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png"

    if (headerAvatar) {
        headerAvatar.src = imageUrl
    }
    if (profileAvatar) {
        profileAvatar.src = imageUrl
    }
}

function openProfileModal() {
    document.getElementById("profileModal").style.display = "flex"
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none"
}

function editProfile() {
    showNotification("Redirecting to profile edit page...", "info")
    // In a real app, this would redirect to a profile edit page
}

// Theme functions
function changeTheme(theme) {
    localStorage.setItem("theme", theme)
    showNotification("Theme updated successfully!", "success")

    // Apply theme immediately
    if (theme === "dark") {
        document.body.classList.add("dark-theme")
    } else {
        document.body.classList.remove("dark-theme")
    }
}

function changeLanguage(language) {
    localStorage.setItem("language", language)
    showNotification("Language preference saved!", "success")
}

function changeCurrency(currency) {
    localStorage.setItem("currency", currency)
    showNotification("Currency updated successfully!", "success")
}

// Notification toggles
function toggleEmailNotifications() {
    const isEnabled = document.getElementById("emailNotif").checked
    localStorage.setItem("emailNotifications", isEnabled)
    showNotification(`Email notifications ${isEnabled ? "enabled" : "disabled"}!`, "info")
}

function toggleSMSNotifications() {
    const isEnabled = document.getElementById("smsNotif").checked
    localStorage.setItem("smsNotifications", isEnabled)
    showNotification(`SMS notifications ${isEnabled ? "enabled" : "disabled"}!`, "info")
}

function toggleDesktopNotifications() {
    const isEnabled = document.getElementById("desktopNotif").checked
    localStorage.setItem("desktopNotifications", isEnabled)

    if (isEnabled) {
        // Request permission for desktop notifications
        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    showNotification("Desktop notifications enabled!", "success")
                } else {
                    document.getElementById("desktopNotif").checked = false
                    localStorage.setItem("desktopNotifications", false)
                    showNotification("Desktop notification permission denied!", "error")
                }
            })
        }
    } else {
        showNotification("Desktop notifications disabled!", "info")
    }
}

function toggleTwoFactor() {
    const isEnabled = document.getElementById("twoFactor").checked
    localStorage.setItem("twoFactor", isEnabled)

    if (isEnabled) {
        showNotification("Two-factor authentication enabled! Please check your email for setup instructions.", "success")
    } else {
        showNotification("Two-factor authentication disabled!", "info")
    }
}

function toggleAutoBackup() {
    const isEnabled = document.getElementById("autoBackup").checked
    localStorage.setItem("autoBackup", isEnabled)
    showNotification(`Auto backup ${isEnabled ? "enabled" : "disabled"}!`, "info")
}

// Modal functions
function openPasswordModal() {
    document.getElementById("passwordModal").style.display = "block"
}

function closePasswordModal() {
    document.getElementById("passwordModal").style.display = "none"
    document.getElementById("passwordForm").reset()
}

function openCompanyModal() {
    showNotification("Company settings modal would open here!", "info")
}

function openTaxModal() {
    showNotification("Tax configuration modal would open here!", "info")
}

function openTemplateModal() {
    showNotification("Invoice template manager would open here!", "info")
}

// Data functions
function exportData() {
    showNotification("Preparing data export... You will receive an email when ready.", "info")

    // Simulate data export process
    setTimeout(() => {
        showNotification("Data export completed! Check your email for download link.", "success")
    }, 3000)
}

function confirmDeleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        if (confirm("This will permanently delete all your data. Are you absolutely sure?")) {
            showNotification("Account deletion initiated. You will receive a confirmation email.", "error")
        }
    }
}

// Password form handling
document.getElementById("passwordForm").addEventListener("submit", (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    if (newPassword !== confirmPassword) {
        showNotification("New passwords do not match!", "error")
        return
    }

    if (newPassword.length < 8) {
        showNotification("Password must be at least 8 characters long!", "error")
        return
    }

    // Simulate password change
    showNotification("Password updated successfully!", "success")
    closePasswordModal()
})

// Logout function
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "login.html"
    }
}

// Notification system
function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `

    // Add styles
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
    `

    // Add to page
    document.body.appendChild(notification)

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove()
        }
    }, 5000)
}

function getNotificationIcon(type) {
    switch (type) {
        case "success":
            return "check-circle"
        case "error":
            return "exclamation-circle"
        case "warning":
            return "exclamation-triangle"
        default:
            return "info-circle"
    }
}

function getNotificationColor(type) {
    switch (type) {
        case "success":
            return "#6fd195"
        case "error":
            return "#ff928a"
        case "warning":
            return "#ffd700"
        default:
            return "#00adef"
    }
}

// Add CSS animation
const style = document.createElement("style")
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
`
document.head.appendChild(style)