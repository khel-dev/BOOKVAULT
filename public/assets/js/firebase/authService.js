/**
 * BookVault Authentication Service
 * Handles user registration, login, logout, and session management
 */

class AuthService {
  constructor() {
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.waitForInit();
  }

  /**
   * Wait for Firebase to be initialized
   */
  waitForInit() {
    let attempts = 0;
    const checkInit = setInterval(() => {
      if (window.firebaseInitialized && window.firebaseAuth && window.firebaseDb) {
        clearInterval(checkInit);
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDb;
        this.setupAuthListener();
        console.log("[AuthService] Ready");
      } else if (attempts++ > 100) {
        clearInterval(checkInit);
        console.error("[AuthService] Firebase failed to initialize after 10 seconds");
      }
    }, 100);
  }

  /**
   * Listen for auth state changes
   */
  setupAuthListener() {
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        console.log("[AuthService] User logged in:", user.email);
        // Dispatch custom event for logged in state
        window.dispatchEvent(new CustomEvent("userLoggedIn", { detail: user }));
      } else {
        console.log("[AuthService] User logged out");
        // Dispatch custom event for logged out state
        window.dispatchEvent(new CustomEvent("userLoggedOut"));
      }
    });
  }

  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user data (firstName, lastName, userType, etc.)
   * @returns {Promise<object>} - User data
   */
  async register(email, password, userData) {
    try {
      // Create auth user
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // Store user data in Firestore
      await this.db.collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...userData, // firstName, lastName, userType, company, phone, etc.
      });

      console.log("[AuthService] User registered successfully:", email);
      return {
        success: true,
        user: user,
        uid: user.uid,
      };
    } catch (error) {
      console.error("[AuthService] Registration error code:", error.code);
      console.error("[AuthService] Registration error message:", error.message);
      console.error("[AuthService] Full error:", error);
      throw {
        code: error.code || "unknown-error",
        message: this.getErrorMessage(error.code) || error.message,
      };
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} - User data
   */
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // Update last login time
      await this.db.collection("users").doc(user.uid).update({
        lastLogin: new Date(),
      });

      console.log("[AuthService] User logged in successfully:", email);
      return {
        success: true,
        user: user,
        uid: user.uid,
      };
    } catch (error) {
      console.error("[AuthService] Login error code:", error.code);
      console.error("[AuthService] Login error message:", error.message);
      console.error("[AuthService] Full error:", error);
      throw {
        code: error.code || "unknown-error",
        message: this.getErrorMessage(error.code) || error.message,
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await this.auth.signOut();
      console.log("[AuthService] User logged out");
      return { success: true };
    } catch (error) {
      console.error("[AuthService] Logout error:", error.message);
      throw {
        code: error.code,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Get current user
   * @returns {firebase.User|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user ID
   * @returns {string|null}
   */
  getCurrentUserId() {
    return this.currentUser?.uid || null;
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.currentUser;
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      console.log("[AuthService] Password reset email sent to:", email);
      return { success: true };
    } catch (error) {
      console.error("[AuthService] Password reset error:", error.message);
      throw {
        code: error.code,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updates - Profile updates
   * @returns {Promise<void>}
   */
  async updateUserProfile(userId, updates) {
    try {
      await this.db.collection("users").doc(userId).update({
        ...updates,
        updatedAt: new Date(),
      });
      console.log("[AuthService] User profile updated");
      return { success: true };
    } catch (error) {
      console.error("[AuthService] Profile update error:", error.message);
      throw {
        code: error.code,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Get user profile from Firestore
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User profile
   */
  async getUserProfile(userId) {
    try {
      const userDoc = await this.db
        .collection("users")
        .doc(userId)
        .get();
      if (userDoc.exists) {
        return userDoc.data();
      } else {
        throw new Error("User profile not found");
      }
    } catch (error) {
      console.error("[AuthService] Error getting user profile:", error.message);
      throw {
        code: "profile-error",
        message: this.getErrorMessage("profile-error"),
      };
    }
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   * @param {string} errorCode - Firebase error code
   * @returns {string} - User-friendly error message
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use":
        "This email is already registered. Please use a different email or try logging in.",
      "auth/invalid-email": "Invalid email address. Please check and try again.",
      "auth/weak-password":
        "Password is too weak. Please use at least 6 characters.",
      "auth/user-not-found":
        "User not found. Please check your email or register.",
      "auth/wrong-password":
        "Incorrect password. Please try again or reset your password.",
      "auth/user-disabled":
        "This account has been disabled. Please contact support.",
      "auth/too-many-requests":
        "Too many login attempts. Please try again later.",
      "auth/operation-not-allowed": "This operation is not allowed.",
      "profile-error": "Error fetching user profile.",
    };

    return (
      errorMessages[errorCode] ||
      "An error occurred. Please try again later."
    );
  }
}

// Create global instance
window.authService = new AuthService();
