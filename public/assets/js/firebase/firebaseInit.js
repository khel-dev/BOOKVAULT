(() => {
  const cfg = window.__BOOKVAULT_FIREBASE_CONFIG__;
  if (!cfg || !cfg.apiKey || cfg.apiKey.includes("PASTE_")) {
    console.error(
      "[BookVault] Firebase config is missing. Update public/assets/js/firebase/firebaseConfig.js",
    );
    return;
  }

  if (!window.firebase) {
    console.error("[BookVault] Firebase SDK not loaded. Check script tags.");
    return;
  }

  if (firebase.apps && firebase.apps.length) {
    console.log("[BookVault] Firebase already initialized");
    // Set refs even if already initialized
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    window.firebaseInitialized = true;
    return;
  }

  try {
    // Initialize Firebase
    firebase.initializeApp(cfg);
    
    // Initialize Firebase Authentication and get a reference to the service
    window.firebaseAuth = firebase.auth();
    
    // Initialize Cloud Firestore and get a reference to the service
    window.firebaseDb = firebase.firestore();
    
    // Set a flag that Firebase is ready
    window.firebaseInitialized = true;
    
    console.log("[BookVault] Firebase initialized successfully");
  } catch (error) {
    console.error("[BookVault] Firebase initialization error:", error);
  }
})();

