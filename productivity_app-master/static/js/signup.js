// Firebase Authentication
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const googleSignUpBtn = document.getElementById('google-signup');
const emailSignUpForm = document.getElementById('email-signup');
const signInLink = document.getElementById('signin-link');
const errorMessage = document.getElementById('error-message');

// Google Sign Up
googleSignUpBtn.addEventListener('click', async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        // Create user document in Firestore
        await db.collection('users').doc(result.user.uid).set({
            name: result.user.displayName,
            email: result.user.email,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window.location.href = '/dashboard';
    } catch (error) {
        showError(error.message);
    }
});

// Email Sign Up
emailSignUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        // Create user with email and password
        const result = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with name
        await result.user.updateProfile({
            displayName: name
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(result.user.uid).set({
            name: name,
            email: email,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window.location.href = '/dashboard';
    } catch (error) {
        showError(error.message);
    }
});

// Sign In Link
signInLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/signin';
});

// Error Handling
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        window.location.href = '/dashboard';
    } else {
        // User is signed out
        console.log('User is signed out');
    }
}); 