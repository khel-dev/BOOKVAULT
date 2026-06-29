document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm")
  const usernameInput = document.getElementById("username")
  const passwordInput = document.getElementById("password")
  const createAccountLink = document.querySelector(".create-account-link")

  let allowRedirectToDashboard = false

  // Pre-fill email from registration if provided
  const params = new URLSearchParams(window.location.search)
  const emailParam = params.get("email")
  if (emailParam) {
    usernameInput.value = emailParam
    passwordInput.focus()
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)
    // User came from registration, don't auto-redirect
    allowRedirectToDashboard = false
  } else {
    // User came directly to login, allow redirect if already logged in
    if (window.authService?.isLoggedIn?.()) {
      window.location.href = "dashboard.html"
    }
  }

  // Only redirect to dashboard after user submits login form
  window.addEventListener("userLoggedIn", () => {
    if (allowRedirectToDashboard && window.location.pathname.endsWith("/login.html")) {
      window.location.href = "dashboard.html"
    }
  })

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
      showFieldError(usernameInput, "Email is required")
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

    const email = usernameInput.value.trim()
    const password = passwordInput.value

    ;(async () => {
      try {
        // Wait for authService to be ready (max 3 seconds)
        let attempts = 0
        while (!window.authService && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.authService) {
          showNotification("Firebase services not available. Please refresh and try again.", "error")
          loginBtn.textContent = originalText
          loginBtn.disabled = false
          return
        }

        // Use authService to login
        const result = await window.authService.login(email, password)
        const user = result.user
        
        // Get user profile from Firestore - wait for userDataService to be ready
        let profile = null;
        if (window.firebaseInitialized && window.userDataService?.db) {
          try {
            const profileDoc = await window.userDataService.db?.collection("users")?.doc(user.uid)?.get()
            profile = profileDoc?.data()
          } catch (err) {
            console.warn("Could not fetch profile:", err)
          }
        }

        const profilePicture =
          profile?.gender === "male"
            ? "https://www.clipartmax.com/png/small/319-3191274_male-avatar-admin-profile.png"
            : profile?.gender === "female"
              ? "https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/87-512.png"
              : "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png"

        localStorage.setItem(
          "registeredUser",
          JSON.stringify({
            uid: user?.uid,
            username: profile?.username || `${profile?.firstName || ""}`.trim() || email,
            email: profile?.email || email,
            firstName: profile?.firstName || "",
            lastName: profile?.lastName || "",
            businessName: profile?.businessName || "",
            gender: profile?.gender || "",
            profilePicture,
          }),
        )

        showNotification("✅ Login successful! Welcome to BookVault", "success")
        // Enable dashboard redirect now that user successfully logged in
        allowRedirectToDashboard = true
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 400)
      } catch (err) {
        console.error("Login error:", err)
        console.error("Full error details:", JSON.stringify(err, null, 2))
        showNotification(`❌ ${err.message || "Invalid email or password"}`, "error")
      } finally {
        loginBtn.textContent = originalText
        loginBtn.disabled = false
      }
    })()
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