// Firebase Authentication
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const googleSignInBtn = document.getElementById('google-signin');
const emailSignInForm = document.getElementById('email-signin');
const signUpLink = document.getElementById('signup-link');
const errorMessage = document.getElementById('error-message');

// Google Sign In
googleSignInBtn.addEventListener('click', async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        window.location.href = '/dashboard';
    } catch (error) {
        showError(error.message);
    }
});

// Email Sign In
emailSignInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = '/dashboard';
    } catch (error) {
        showError(error.message);
    }
});

// Sign Up Link
signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/signup';
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