document.addEventListener('DOMContentLoaded', () => {
    // ---------- Change Name ----------
    const changeNameForm = document.getElementById('change-name-form');
    const nameInput = document.getElementById('new-name');
    const nameSuccessMsg = document.getElementById('name-change-success');
    const nameErrorMsg = document.getElementById('name-change-error');

    if (changeNameForm) {
        changeNameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = nameInput.value.trim();

            if (!newName) {
                nameErrorMsg.textContent = "Name cannot be empty.";
                nameErrorMsg.classList.remove('d-none');
                return;
            }

            try {
                const res = await fetch('/api/profile/change-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName })
                });
                const data = await res.json();

                if (res.ok) {
                    nameSuccessMsg.classList.remove('d-none');
                    nameErrorMsg.classList.add('d-none');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    nameErrorMsg.textContent = data.error || "Failed to update name.";
                    nameErrorMsg.classList.remove('d-none');
                }
            } catch (err) {
                nameErrorMsg.textContent = "An unexpected error occurred.";
                nameErrorMsg.classList.remove('d-none');
            }
        });
    }

    // ---------- Change Password ----------
    const changePasswordForm = document.getElementById('change-password-form');
    const currentPw = document.getElementById('current-password');
    const newPw = document.getElementById('new-password');
    const pwSuccess = document.getElementById('password-change-success');
    const pwError = document.getElementById('password-change-error');

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            pwError.classList.add('d-none');
            pwSuccess.classList.add('d-none');

            const current = currentPw.value.trim();
            const newPass = newPw.value.trim();

            const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

            if (!current || !newPass) {
                pwError.textContent = "Please fill in all fields.";
                pwError.classList.remove('d-none');
                return;
            }
            
            if (!passwordRegex.test(newPass)) {
                            pwError.textContent = "Password must be at least 8 characters long and include a lowercase letter, a number, and a special character.";
                            pwError.classList.remove('d-none');
                            return;
                        }

            try {
                const res = await fetch('/api/profile/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                });
                const data = await res.json();

                if (res.ok) {
                    pwSuccess.classList.remove('d-none');
                    changePasswordForm.reset();
                } else {
                    pwError.textContent = data.error || "Failed to update password.";
                    pwError.classList.remove('d-none');
                }
            } catch (err) {
                pwError.textContent = "Unexpected error occurred.";
                pwError.classList.remove('d-none');
            }
        });
    }

    // ---------- Delete Account ----------
    const deleteForm = document.getElementById('delete-account-form');
    const deletePassword = document.getElementById('confirm-password-delete');
    const deleteSuccess = document.getElementById('delete-account-success');
    const deleteError = document.getElementById('delete-account-error');

    if (deleteForm) {
        deleteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            deleteSuccess.classList.add('d-none');
            deleteError.classList.add('d-none');

            const password = deletePassword.value.trim();
            if (!password) {
                deleteError.textContent = "Please enter your password.";
                deleteError.classList.remove('d-none');
                return;
            }

            try {
                const res = await fetch('/api/profile/delete-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                const data = await res.json();

                if (res.ok) {
                    deleteSuccess.classList.remove('d-none');
                    deleteForm.reset();
                    setTimeout(() => {
                        window.location.href = '/goodbye';
                    }, 2000);
                } else {
                    deleteError.textContent = data.error || "Failed to delete account.";
                    deleteError.classList.remove('d-none');
                }
            } catch (err) {
                deleteError.textContent = "Unexpected error occurred.";
                deleteError.classList.remove('d-none');
            }
        });
    }
    
    // ---------- Request Email Verification Code ----------
    const emailRequestForm = document.getElementById('request-email-change-form');
    const emailInput = document.getElementById('new-email');
    const verifyCodeForm = document.getElementById('verify-code-form');
    const emailSuccess = document.getElementById('email-change-success');
    const emailError = document.getElementById('email-change-error');
    const passwordInputForEmail = document.getElementById('current-password-for-email'); // ✅ 추가


    if (emailRequestForm) {
        emailRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInputForEmail.value.trim();  // ✅ 비번 값도 확인
            emailError.classList.add('d-none');
            emailSuccess.classList.add('d-none');

            if (!email) {
                emailError.textContent = "Email cannot be empty.";
                emailError.classList.remove('d-none');
                return;
            }

            try {
                const res = await fetch('/api/profile/request-email-change', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, currentPassword: password })
                });
                const data = await res.json();

                if (res.ok) {
                    emailSuccess.textContent = "Verification code sent to your new email.";
                    emailSuccess.classList.remove('d-none');
                    verifyCodeForm.classList.remove('d-none');
                } else {
                    emailError.textContent = data.error || "Failed to send verification code.";
                    emailError.classList.remove('d-none');
                }
            } catch (err) {
                emailError.textContent = "Error sending verification code.";
                emailError.classList.remove('d-none');
            }
        });
    }

    // ---------- Confirm Verification Code ----------
    const verifyCodeInput = document.getElementById('email-verification-code');

    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            emailError.classList.add('d-none');
            emailSuccess.classList.add('d-none');

            const code = verifyCodeInput.value.trim();
            const email = emailInput.value.trim();

            if (!code || !email) {
                emailError.textContent = "All fields are required.";
                emailError.classList.remove('d-none');
                return;
            }

            try {
                const res = await fetch('/api/profile/verify-email-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newEmail: email, verificationCode: code })
                });

                const data = await res.json();

                if (res.ok) {
                    emailSuccess.textContent = "✅ Email changed successfully!";
                    emailSuccess.classList.remove('d-none');
                    verifyCodeForm.reset();
                    emailRequestForm.reset();
                    setTimeout(() => location.reload(), 1500);
                } else {
                    emailError.textContent = data.error || "Verification failed.";
                    emailError.classList.remove('d-none');
                }
            } catch (err) {
                emailError.textContent = "Error verifying code.";
                emailError.classList.remove('d-none');
            }
        });
    }
});
