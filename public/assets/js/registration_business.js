document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("businessForm")

  // Load saved data if exists
  loadSavedData()

  // Show notification function
  function showNotification(message, type = "info") {
    const existingNotification = document.querySelector(".notification")
    if (existingNotification) existingNotification.remove()

    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#00adef"};
            color: white;
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) notification.remove()
    }, 5000)

    notification.querySelector(".notification-close").addEventListener("click", () => {
      if (notification.parentNode) notification.remove()
    })
  }

  // Load saved data from localStorage
  function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem("registrationData")) || {}

    document.getElementById("businessName").value = savedData.businessName || ""
    document.getElementById("businessType").value = savedData.businessType || ""
    document.getElementById("experience").value = savedData.experience || ""
    document.getElementById("clientCount").value = savedData.clientCount || ""
    document.getElementById("address").value = savedData.address || ""
  }

  // Validate form
  function validateForm() {
    const requiredInputs = form.querySelectorAll("input[required], select[required]")

    for (const input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus()
        showNotification("Please fill in all required fields", "error")
        return false
      }
    }

    return true
  }

  // Save data to localStorage
  function saveData() {
    const formData = new FormData(form)
    const data = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    // Get existing data and merge
    const existingData = JSON.parse(localStorage.getItem("registrationData")) || {}
    const mergedData = { ...existingData, ...data }

    localStorage.setItem("registrationData", JSON.stringify(mergedData))
  }

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    saveData()
    showNotification("Business information saved! Redirecting to account setup...", "success")

    setTimeout(() => {
      window.location.href = "registration_account.html"
    }, 1500)
  })

  // Add CSS for notifications
  const style = document.createElement("style")
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 12px; 
        }
        .notification-close { 
            background: none; 
            border: none; 
            color: white; 
            font-size: 20px; 
            cursor: pointer; 
            padding: 0; 
            width: 24px; 
            height: 24px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 50%; 
            transition: background 0.2s ease; 
        }
        .notification-close:hover { 
            background: rgba(255, 255, 255, 0.2); 
        }
    `
  document.head.appendChild(style)
})