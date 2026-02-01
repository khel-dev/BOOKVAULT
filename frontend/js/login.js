document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm")
  const usernameInput = document.getElementById("username")
  const passwordInput = document.getElementById("password")
  const createAccountLink = document.querySelector(".create-account-link")

  // Link to registration page
  createAccountLink.addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "registration_personal.html"
  })

  // Form validation and submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Clear previous error states
    clearErrors()

    // Validate inputs
    let isValid = true
    if (usernameInput.value.trim() === "") {
      showFieldError(usernameInput, "Username is required")
      isValid = false
    }
    if (passwordInput.value.trim() === "") {
      showFieldError(passwordInput, "Password is required")
      isValid = false
    }
    if (!isValid) {
      return
    }

    // Show loading state
    const loginBtn = form.querySelector(".login-button")
    const originalText = loginBtn.textContent
    loginBtn.textContent = "Signing in..."
    loginBtn.disabled = true

    // Simulate login process with local storage
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || []

      const foundUser = storedUsers.find(
        (user) => user.username === usernameInput.value && user.password === passwordInput.value
      )

      if (foundUser) {
        // Set profile picture based on gender
        const profilePicture = foundUser.gender === "male"
          ? "https://www.clipartmax.com/png/small/319-3191274_male-avatar-admin-profile.png"
          : "https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/87-512.png"
        foundUser.profilePicture = profilePicture // Add profile picture to user data

        // Save the found user with profile picture to localStorage
        localStorage.setItem("registeredUser", JSON.stringify(foundUser))

        showNotification("✅ Login successful! Welcome to BookVault", "success")
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1500)
      } else {
        showNotification("❌ Invalid username or password", "error")
        loginBtn.textContent = originalText
        loginBtn.disabled = false
      }
    }, 1500)
  })

  // Helper functions
  function showFieldError(field, message) {
    field.style.borderColor = "#ef4444"
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) existingError.remove()
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error"
    errorDiv.textContent = message
    errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 5px;
            font-weight: 500;
        `
    field.parentNode.appendChild(errorDiv)
  }

  function clearErrors() {
    const errorDivs = document.querySelectorAll(".field-error")
    errorDivs.forEach((div) => div.remove())
    if (usernameInput) usernameInput.style.borderColor = "#00adef"
    if (passwordInput) passwordInput.style.borderColor = "#00adef"
  }

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
    }, 4000)
    notification.querySelector(".notification-close").addEventListener("click", () => {
      notification.remove()
    })
  }

  const style = document.createElement("style")
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .notification-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s ease; }
        .notification-close:hover { background: rgba(255, 255, 255, 0.2); }
    `
  document.head.appendChild(style)
})