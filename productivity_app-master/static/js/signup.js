// Firebase SDK initialization (for Google OAuth)
const auth = firebase.auth();

// DOM Elements
const googleSignUpBtn = document.getElementById("google-signup");
const emailSignUpForm = document.getElementById("email-signup");
const signInLink = document.getElementById("signin-link");
const errorMessage = document.getElementById("error-message");

// ------------------------------------
// ✅ Google OAuth Sign-Up (unchanged)
// ------------------------------------
googleSignUpBtn.addEventListener("click", async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const idToken = await result.user.getIdToken();

        // Check if user is new (only on first Google login)
        const isNewUser = result?.additionalUserInfo?.isNewUser;

        const payload = { idToken };

        if (isNewUser) {
            payload.createdAt = Date.now();  // Save account creation timestamp (ms)
        }

        const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            window.location.href = "/dashboard";
        } else {
            const data = await response.json();
            showError(data.error || "Google authentication failed.");
        }
    } catch (error) {
        console.error("Google signup error:", error);
        showError(error.message || "An unexpected error occurred during Google signup.");
    }
});

// ----------------------------------------
// ✅ Local Email/Password Sign-Up (Flask)
// ----------------------------------------
emailSignUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    errorMessage.style.display = "none";

    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }

    try {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            window.location.href = "/dashboard";
        } else {
            showError(data.error || "Signup failed.");
        }
    } catch (err) {
        console.error("Signup error:", err);
        showError("An unexpected error occurred. Please try again.");
    }
});

// ------------------------------------
// 🔁 Redirect to Sign In Page
// ------------------------------------
signInLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/signin";
});

// ------------------------------------
// ❗ Show Error Message on the Page
// ------------------------------------
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}
