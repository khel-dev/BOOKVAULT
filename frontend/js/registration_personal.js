document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("personalForm")

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
      notification.remove()
    })
  }

  // Load saved data from localStorage
  function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem("registrationData")) || {}

    if (savedData.firstName) document.getElementById("firstName").value = savedData.firstName
    if (savedData.lastName) document.getElementById("lastName").value = savedData.lastName
    if (savedData.email) document.getElementById("email").value = savedData.email
    if (savedData.phone) document.getElementById("phone").value = savedData.phone
    if (savedData.gender) {
      document.querySelector(`input[name="gender"][value="${savedData.gender}"]`).checked = true
    }
    if (savedData.certification) document.getElementById("certification").value = savedData.certification
  }

  // Validate form
  function validateForm() {
    const requiredInputs = form.querySelectorAll("input[required], select[required]")
    const requiredRadio = form.querySelector('input[type="radio"][required]')

    for (const input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus()
        showNotification("Please fill in all required fields", "error")
        return false
      }
    }

    // Validate gender selection
    if (requiredRadio && !document.querySelector('input[name="gender"]:checked')) {
      showNotification("Please select a gender", "error")
      return false
    }

    // Validate email format
    const email = document.getElementById("email").value
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      document.getElementById("email").focus()
      showNotification("Please enter a valid email address", "error")
      return false
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

    // Set profile picture based on gender
    const gender = data.gender
    data.profilePicture = gender === "male"
      ? "https://www.clipartmax.com/png/small/319-3191274_male-avatar-admin-profile.png"
      : "https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/87-512.png"

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
    showNotification("Personal information saved! Redirecting to business information...", "success")

    setTimeout(() => {
      window.location.href = "registration_business.html"
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