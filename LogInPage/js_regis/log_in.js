// Log In Form
const log_in_submit_button = document.getElementById("log-in-button")
const log_in_form = document.getElementById('log-in-form');
const email_log_in = document.getElementById("log-in-email");
const password_log_in = document.getElementById("log-in-password");

// Validation Log In Form 
function validateLogInForm() {
    let is_valid = true;

    // Check Email
    if (!email_log_in.value.trim()) {
        showError("log-in-email-error", "log-in-email-error-icon", "Email is required.", false, "log-in-email-shake")
        is_valid = false;
    } else if (!isEmailValid(email_log_in.value.trim())) {
        showError("log-in-email-error", "log-in-email-error-icon", "Email is invalid.", false, "log-in-email-shake")
        is_valid = false;
    } else {
        showError("log-in-email-error", "log-in-email-error-icon", "", true, "")
    }

    // Check Password
    if (password_log_in.value === "") {
        showError("log-in-password-error", "log-in-password-error-icon", "Password is required.", false, "log-in-password-shake")
        is_valid = false;
    } else {
        showError("log-in-password-error", "log-in-password-error-icon", "Password is wrong", true, "")
    }

    return is_valid;
}

// Form submit
log_in_form.addEventListener('submit', (e) => {

    e.preventDefault() // Prevent Submit

    if (validateLogInForm() == true) {
        login()
    }

})
async function login() {
    const email = document.getElementById("log-in-email").value;
    const password = document.getElementById("log-in-password").value;
    const error_msg = document.getElementById("error-msg");

    if (!validateLogInForm()) {
        console.log("Wrong Input");
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            // Lưu thông tin người dùng, bao gồm _id
            localStorage.setItem('user', JSON.stringify({
                _id: data.user._id, // Thêm _id
                email: data.user.email,
                username: data.user.username,
                role: data.user.role // Nếu bạn muốn lưu thêm role
            }));
            showToast("Login Success!", 1000);
            // Redirect sang notes.html sau 3 giây
            setTimeout(() => {
                window.location.href = "../notes/notes.html";
            }, 3000);
        } else {
            error_msg.innerText = data.message;
            error_msg.classList.remove("hidden");
        }
    } catch (error) {
        error_msg.innerText = "Server error";
        error_msg.classList.remove("hidden");
        console.error("Login error:", error);
    }
}