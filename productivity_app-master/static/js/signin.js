document.getElementById("email-signin").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Login successful!");
            window.location.href = "/dashboard";
        } else {
            errorMessage.style.display = "block";
            errorMessage.textContent = data.error || "Login failed.";
        }
    } catch (error) {
        console.error("Login error:", error);
        errorMessage.style.display = "block";
        errorMessage.textContent = "A server error occurred. Please try again.";
    }
});
