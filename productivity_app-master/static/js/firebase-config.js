// Firebase configuration
const firebaseConfig = {
    // Your Firebase configuration object goes here
    // You'll get this from your Firebase Console
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Authentication
const auth = firebase.auth(); 