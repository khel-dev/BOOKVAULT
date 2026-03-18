/**
 * BookVault User Data Service
 * Handles all Firestore operations for user data, clients, billing, etc.
 */

class UserDataService {
  constructor() {
    this.db = null;
    this.waitForInit();
  }

  /**
   * Wait for Firebase to be initialized
   */
  waitForInit() {
    let attempts = 0;
    const checkInit = setInterval(() => {
      if (window.firebaseInitialized && window.firebaseDb) {
        clearInterval(checkInit);
        this.db = window.firebaseDb;
        console.log("[UserDataService] Ready");
      } else if (attempts++ > 100) {
        clearInterval(checkInit);
        console.error("[UserDataService] Firebase failed to initialize after 10 seconds");
      }
    }, 100);
  }

  /**
   * Create or update a client
   * @param {string} userId - User ID
   * @param {object} clientData - Client information
   * @returns {Promise<string>} - Client ID
   */
  async addClient(userId, clientData) {
    try {
      const docRef = await this.db
        .collection("users")
        .doc(userId)
        .collection("clients")
        .add({
          ...clientData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      console.log("[UserDataService] Client added:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("[UserDataService] Error adding client:", error.message);
      throw error;
    }
  }

  /**
   * Get all clients for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Array of client objects
   */
  async getClients(userId) {
    try {
      const snapshot = await this.db
        .collection("users")
        .doc(userId)
        .collection("clients")
        .orderBy("createdAt", "desc")
        .get();

      const clients = [];
      snapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return clients;
    } catch (error) {
      console.error("[UserDataService] Error getting clients:", error.message);
      throw error;
    }
  }

  /**
   * Get a specific client
   * @param {string} userId - User ID
   * @param {string} clientId - Client ID
   * @returns {Promise<object>} - Client object
   */
  async getClient(userId, clientId) {
    try {
      const doc = await this.db
        .collection("users")
        .doc(userId)
        .collection("clients")
        .doc(clientId)
        .get();

      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      } else {
        throw new Error("Client not found");
      }
    } catch (error) {
      console.error("[UserDataService] Error getting client:", error.message);
      throw error;
    }
  }

  /**
   * Update a client
   * @param {string} userId - User ID
   * @param {string} clientId - Client ID
   * @param {object} updates - Updated client data
   * @returns {Promise<void>}
   */
  async updateClient(userId, clientId, updates) {
    try {
      await this.db
        .collection("users")
        .doc(userId)
        .collection("clients")
        .doc(clientId)
        .update({
          ...updates,
          updatedAt: new Date(),
        });
      console.log("[UserDataService] Client updated:", clientId);
    } catch (error) {
      console.error("[UserDataService] Error updating client:", error.message);
      throw error;
    }
  }

  /**
   * Delete a client
   * @param {string} userId - User ID
   * @param {string} clientId - Client ID
   * @returns {Promise<void>}
   */
  async deleteClient(userId, clientId) {
    try {
      await this.db
        .collection("users")
        .doc(userId)
        .collection("clients")
        .doc(clientId)
        .delete();
      console.log("[UserDataService] Client deleted:", clientId);
    } catch (error) {
      console.error("[UserDataService] Error deleting client:", error.message);
      throw error;
    }
  }

  /**
   * Add an archive/book entry
   * @param {string} userId - User ID
   * @param {object} archiveData - Archive information
   * @returns {Promise<string>} - Archive ID
   */
  async addArchive(userId, archiveData) {
    try {
      const docRef = await this.db
        .collection("users")
        .doc(userId)
        .collection("archives")
        .add({
          ...archiveData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      console.log("[UserDataService] Archive added:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("[UserDataService] Error adding archive:", error.message);
      throw error;
    }
  }

  /**
   * Get all archives for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Array of archive objects
   */
  async getArchives(userId) {
    try {
      const snapshot = await this.db
        .collection("users")
        .doc(userId)
        .collection("archives")
        .orderBy("createdAt", "desc")
        .get();

      const archives = [];
      snapshot.forEach((doc) => {
        archives.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return archives;
    } catch (error) {
      console.error(
        "[UserDataService] Error getting archives:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Add a billing record
   * @param {string} userId - User ID
   * @param {object} billingData - Billing information
   * @returns {Promise<string>} - Billing record ID
   */
  async addBillingRecord(userId, billingData) {
    try {
      const docRef = await this.db
        .collection("users")
        .doc(userId)
        .collection("billing")
        .add({
          ...billingData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      console.log("[UserDataService] Billing record added:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(
        "[UserDataService] Error adding billing record:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Get all billing records for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Array of billing objects
   */
  async getBillingRecords(userId) {
    try {
      const snapshot = await this.db
        .collection("users")
        .doc(userId)
        .collection("billing")
        .orderBy("createdAt", "desc")
        .get();

      const records = [];
      snapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return records;
    } catch (error) {
      console.error(
        "[UserDataService] Error getting billing records:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Add a notification
   * @param {string} userId - User ID
   * @param {object} notificationData - Notification information
   * @returns {Promise<string>} - Notification ID
   */
  async addNotification(userId, notificationData) {
    try {
      const docRef = await this.db
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .add({
          ...notificationData,
          read: false,
          createdAt: new Date(),
        });
      console.log("[UserDataService] Notification added:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(
        "[UserDataService] Error adding notification:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Array of notification objects
   */
  async getNotifications(userId) {
    try {
      const snapshot = await this.db
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .orderBy("createdAt", "desc")
        .get();

      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return notifications;
    } catch (error) {
      console.error(
        "[UserDataService] Error getting notifications:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} userId - User ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async markNotificationRead(userId, notificationId) {
    try {
      await this.db
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .doc(notificationId)
        .update({
          read: true,
        });
    } catch (error) {
      console.error(
        "[UserDataService] Error marking notification as read:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Add settings/preferences
   * @param {string} userId - User ID
   * @param {object} settingsData - Settings information
   * @returns {Promise<void>}
   */
  async updateSettings(userId, settingsData) {
    try {
      await this.db
        .collection("users")
        .doc(userId)
        .collection("settings")
        .doc("preferences")
        .set(
          {
            ...settingsData,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      console.log("[UserDataService] Settings updated");
    } catch (error) {
      console.error("[UserDataService] Error updating settings:", error.message);
      throw error;
    }
  }

  /**
   * Get user settings
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Settings object
   */
  async getSettings(userId) {
    try {
      const doc = await this.db
        .collection("users")
        .doc(userId)
        .collection("settings")
        .doc("preferences")
        .get();

      if (doc.exists) {
        return doc.data();
      } else {
        return {};
      }
    } catch (error) {
      console.error("[UserDataService] Error getting settings:", error.message);
      throw error;
    }
  }
}

// Create global instance
window.userDataService = new UserDataService();
