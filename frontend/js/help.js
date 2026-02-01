document.addEventListener("DOMContentLoaded", () => {
    initializeHelp()
    initializeModals()
    updateProfile()
})

function initializeHelp() {
    // Initialize any help-specific features
    console.log("Help & Support page loaded")
}

function initializeModals() {
    window.addEventListener("click", (event) => {
        const contactModal = document.getElementById("contactModal")
        const ticketModal = document.getElementById("ticketModal")
        const profileModal = document.getElementById("profileModal")
        const passwordModal = document.getElementById("passwordModal")

        if (event.target === contactModal) {
            closeContactModal()
        }
        if (event.target === ticketModal) {
            closeTicketModal()
        }
        if (event.target === profileModal) {
            closeProfileModal()
        }
        if (event.target === passwordModal) {
            closePasswordModal()
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

function openPasswordModal() {
    document.getElementById("passwordModal").style.display = "block"
}

function closePasswordModal() {
    document.getElementById("passwordModal").style.display = "none"
    document.getElementById("passwordForm").reset()
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

// Search functionality
function searchHelp(query) {
    const searchTerm = query.toLowerCase()
    const faqItems = document.querySelectorAll(".faq-item")
    const knowledgeLinks = document.querySelectorAll(".knowledge-category a")

    // Search FAQ items
    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question h3").textContent.toLowerCase()
        const answer = item.querySelector(".faq-answer p").textContent.toLowerCase()

        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = "block"
            if (searchTerm.length > 0) {
                item.classList.add("active")
            }
        } else {
            item.style.display = searchTerm.length > 0 ? "none" : "block"
        }
    })

    // Search knowledge base
    knowledgeLinks.forEach((link) => {
        const text = link.textContent.toLowerCase()
        const category = link.closest(".knowledge-category")

        if (text.includes(searchTerm)) {
            link.style.display = "block"
            if (searchTerm.length > 0) {
                link.style.background = "#fff3cd"
            }
        } else {
            link.style.display = searchTerm.length > 0 ? "none" : "block"
            link.style.background = "none"
        }
    })
}

// FAQ functionality
function toggleFAQ(element) {
    const isActive = element.classList.contains("active")

    // Close all FAQ items
    document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active")
    })

    // Open clicked item if it wasn't active
    if (!isActive) {
        element.classList.add("active")
    }
}

// Quick action functions
function openContactModal() {
    document.getElementById("contactModal").style.display = "block"
}

function closeContactModal() {
    document.getElementById("contactModal").style.display = "none"
    document.getElementById("contactForm").reset()
}

function openTicketModal() {
    document.getElementById("ticketModal").style.display = "block"
}

function closeTicketModal() {
    document.getElementById("ticketModal").style.display = "none"
    document.getElementById("ticketForm").reset()
}

function scheduleDemo() {
    showNotification("Demo scheduling feature coming soon! Please contact support for now.", "info")
}

function downloadGuide() {
    showNotification("Downloading user guide...", "info")

    // Simulate download
    setTimeout(() => {
        showNotification("User guide downloaded successfully!", "success")
    }, 2000)
}

// Video functions
function playVideo(videoId) {
    showNotification(`Playing video: ${videoId}. Video player would open here.`, "info")
}

// Knowledge base functions
function openArticle(articleId) {
    showNotification(`Opening article: ${articleId}. Article viewer would open here.`, "info")
}

// Form handling
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const subject = formData.get("subject")
    const message = formData.get("message")
    const priority = formData.get("priority")

    if (!subject || !message) {
        showNotification("Please fill in all required fields.", "error")
        return
    }

    // Simulate sending message
    showNotification("Your message has been sent! We'll get back to you soon.", "success")
    closeContactModal()
})

document.getElementById("ticketForm").addEventListener("submit", function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const type = formData.get("type")
    const title = formData.get("title")
    const description = formData.get("description")

    if (!type || !title || !description) {
        showNotification("Please fill in all required fields.", "error")
        return
    }

    // Generate ticket number
    const ticketNumber = "BV-" + Math.random().toString(36).substr(2, 9).toUpperCase()

    // Simulate ticket submission
    showNotification(`Support ticket ${ticketNumber} has been created! You'll receive updates via email.`, "success")
    closeTicketModal()
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