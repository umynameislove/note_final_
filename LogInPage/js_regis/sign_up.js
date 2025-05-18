const sign_up_submit_button = document.getElementById("sign-up-button")
const sign_up_form = document.getElementById('sign-up-form');
const username_sign_up = document.getElementById('sign-up-name');
const email_sign_up = document.getElementById('sign-up-email');
const password_sign_up = document.getElementById('sign-up-password');
const confirm_password = document.getElementById('sign-up-confirm-password');


async function validateSignUpForm() {
    let is_valid = true;

    // --- Check Username
    if (username_sign_up.value.trim() === "") {
        showError("sign-up-name-error", "sign-up-name-error-icon", "Username is required.", false, "sign-up-name-shake");
        is_valid = false;
    } else {
        showError("sign-up-name-error", "sign-up-name-error-icon", "", true, "");
    }

    // --- Check Email (rỗng + định dạng)
    const email = email_sign_up.value.trim();
    if (!email) {
        showError("sign-up-email-error", "sign-up-email-error-icon", "Email is required.", false, "sign-up-email-shake");
        is_valid = false;
    } else if (!isEmailValid(email)) {
        showError("sign-up-email-error", "sign-up-email-error-icon", "Email is invalid.", false, "sign-up-email-shake");
        is_valid = false;
    } else {
        // --- Check email tồn tại ở server
        const taken = await isEmailTaken(email);
        if (taken) {
            showError("sign-up-email-error", "sign-up-email-error-icon", "Email already exists.", false, "sign-up-email-shake");
            is_valid = false;
        } else {
            showError("sign-up-email-error", "sign-up-email-error-icon", "", true, "");
        }
    }

    // --- Check Password
    if (!password_sign_up.value) {
        showError("sign-up-password-error", "sign-up-password-error-icon", "Password is required.", false, "sign-up-password-shake");
        is_valid = false;
    } else {
        showError("sign-up-password-error", "sign-up-password-error-icon", "", true, "");
    }

    // --- Check Confirm Password
    if (!confirm_password.value) {
        showError("sign-up-confirm-password-error", "sign-up-confirm-password-error-icon", "Confirm password is required.", false, "sign-up-confirm-password-shake");
        is_valid = false;
    } else if (confirm_password.value !== password_sign_up.value) {
        showError("sign-up-confirm-password-error", "sign-up-confirm-password-error-icon", "Confirm password does not match.", false, "sign-up-confirm-password-shake");
        is_valid = false;
    } else {
        showError("sign-up-confirm-password-error", "sign-up-confirm-password-error-icon", "", true, "");
    }

    return is_valid;
}
async function isEmailTaken(email) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        return data.exists; // true nếu email đã tồn tại
    } catch (error) {
        console.error("Error checking email:", error);
        return false; // fallback: không ngăn submit nếu lỗi server
    }
}

sign_up_form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn submit mặc định
    if (await validateSignUpForm()) {
        register(); // Gọi hàm register nếu hợp lệ
    }
});

async function register() {
    const username = username_sign_up.value;
    const password = password_sign_up.value;
    const email = email_sign_up.value;
    const error_msg = document.getElementById("error-msg");

    try {
        const response = await fetch('http://localhost:4000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Register Success!", 3000);
            setTimeout(() => {
                window.location.href = "./index.html";
            }, 3000);
        } else {
            error_msg.innerText = data.message;
            error_msg.classList.remove("hidden");
        }
    } catch (error) {
        error_msg.innerText = "Server error";
        error_msg.classList.remove("hidden");
        console.error("Register error:", error);
    }
}