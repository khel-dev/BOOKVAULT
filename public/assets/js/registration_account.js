document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("accountForm")
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirmPassword")
  const passwordStrength = document.getElementById("passwordStrength")
  const passwordMatch = document.getElementById("passwordMatch")
  const usernameInput = document.getElementById("username")
  const submitButton = document.getElementById("submitButton")

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

    if (savedData.username) usernameInput.value = savedData.username
    if (savedData.securityQuestion) document.getElementById("securityQuestion").value = savedData.securityQuestion
    if (savedData.securityAnswer) document.getElementById("securityAnswer").value = savedData.securityAnswer
    if (savedData.newsletter) document.getElementById("newsletter").checked = savedData.newsletter
  }

  // Password strength checker
  function checkPasswordStrength(password) {
    let strength = 0
    let feedback = ""

    if (password.length >= 8) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++

    switch (strength) {
      case 0:
      case 1:
      case 2:
        feedback = "Weak"
        passwordStrength.className = "password-strength weak"
        break
      case 3:
        feedback = "Medium"
        passwordStrength.className = "password-strength medium"
        break
      default:
        feedback = "Strong"
        passwordStrength.className = "password-strength strong"
        break
    }
    passwordStrength.textContent = password ? `Password strength: ${feedback}` : ""
  }

  // Check password match
  function checkPasswordMatch() {
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value

    if (confirmPassword) {
      if (password === confirmPassword) {
        passwordMatch.textContent = "✓ Passwords match"
        passwordMatch.className = "password-match match"
      } else {
        passwordMatch.textContent = "✗ Passwords do not match"
        passwordMatch.className = "password-match no-match"
      }
    } else {
      passwordMatch.textContent = ""
    }
  }

  // Validate form
  function validateForm() {
    const requiredInputs = form.querySelectorAll("input[required], select[required]")

    for (const input of requiredInputs) {
      if (input.type === "checkbox") {
        if (!input.checked) {
          showNotification("Please agree to the Terms of Service", "error")
          return false
        }
      } else if (!input.value.trim()) {
        input.focus()
        showNotification("Please fill in all required fields", "error")
        return false
      }
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.focus()
      showNotification("Passwords do not match", "error")
      return false
    }

    if (passwordInput.value.length < 8) {
      passwordInput.focus()
      showNotification("Password must be at least 8 characters long", "error")
      return false
    }

    return true
  }

  // Save form step to localStorage (multi-step registration)
  function saveLocalStepData() {
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

  // Event listeners
  passwordInput.addEventListener("input", (e) => {
    checkPasswordStrength(e.target.value)
    checkPasswordMatch()
  })

  confirmPasswordInput.addEventListener("input", checkPasswordMatch)

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!validateForm()) return

    submitButton.textContent = "Creating Account..."
    submitButton.disabled = true

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
          submitButton.textContent = "Create Account"
          submitButton.disabled = false
          return
        }

        const existingData = JSON.parse(localStorage.getItem("registrationData")) || {}
        const username = usernameInput.value.trim()
        const password = passwordInput.value
        const email = (existingData.email || "").trim()

        if (!email || !email.includes("@")) {
          showNotification("Please go back and enter a valid email address.", "error")
          submitButton.textContent = "Create Account"
          submitButton.disabled = false
          return
        }

        if (!username) {
          usernameInput.focus()
          showNotification("Please enter a username.", "error")
          submitButton.textContent = "Create Account"
          submitButton.disabled = false
          return
        }

        saveLocalStepData()

        // Use authService to register - just create account with username
        const result = await window.authService.register(email, password, {
          username,
          firstName: existingData.firstName || "",
          lastName: existingData.lastName || "",
          fullName: `${existingData.firstName || ""} ${existingData.lastName || ""}`.trim(),
          gender: existingData.gender || "",
          businessName: existingData.businessName || "",
          businessType: existingData.businessType || "",
          experience: existingData.experience || "",
          clientCount: existingData.clientCount || "",
          address: existingData.address || "",
          phone: existingData.phone || "",
          certification: existingData.certification || "",
        })

        const user = result.user

        const profilePicture =
          existingData.gender === "male"
            ? "https://www.clipartmax.com/png/small/319-3191274_male-avatar-admin-profile.png"
            : existingData.gender === "female"
              ? "https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/87-512.png"
              : "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png"

        localStorage.setItem(
          "registeredUser",
          JSON.stringify({
            uid: user.uid,
            username,
            email: email,
            fullName: `${existingData.firstName || ""} ${existingData.lastName || ""}`.trim(),
            businessName: existingData.businessName || "",
            gender: existingData.gender || "",
            profilePicture,
          }),
        )

        showNotification("Account created successfully! Redirecting to login...", "success")

        setTimeout(() => {
          // After registration, sign out so user can login manually
          if (window.authService) {
            window.authService.logout().catch(() => {})
          }
          localStorage.removeItem("registrationData")
          localStorage.removeItem("registeredUser")
          // Redirect to login with email pre-filled
          window.location.href = `login.html?email=${encodeURIComponent(email)}`
        }, 1200)
      } catch (err) {
        console.error("Registration error:", err)
        console.error("Full error details:", JSON.stringify(err, null, 2))
        const msg =
          err?.code === "auth/email-already-in-use"
            ? "That email is already registered. Please login instead."
            : err?.message || `Registration failed: ${err?.toString() || "Unknown error"}`
        console.error(`[FROM AUTHSERVICE] ${msg}`)
        showNotification(msg, "error")
      } finally {
        submitButton.textContent = "Create Account"
        submitButton.disabled = false
      }
    })()
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