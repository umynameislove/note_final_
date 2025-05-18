// Log In Form
const log_in_submit_button = document.getElementById("log-in-button")
const log_in_form = document.getElementById('log-in-form');
const email_log_in = document.getElementById("log-in-email");
const password_log_in = document.getElementById("log-in-password");

// Sign Up Form
const sign_up_submit_button = document.getElementById("sign-up-button")
const sign_up_form = document.getElementById('sign-up-form');
const username_sign_up = document.getElementById('sign-up-name');
const email_sign_up = document.getElementById('sign-up-email');
const password_sign_up = document.getElementById('sign-up-password');
const confirm_password = document.getElementById('sign-up-confirm-password');



// Check validation of email
const isEmailValid = (email) => {
    const check_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return check_email.test(String(email).toLowerCase());
}

// Show Error
const showError = (field, icon, error_text, check, who_shake) => {
    const error_element = document.getElementById(field);
    const icon_element = document.getElementById(icon)
    const shake_element = document.getElementById(who_shake)

    error_element.innerText = error_text

    if (check == false) {
        error_element.classList.remove("hidden");
        icon_element.classList.remove("hidden");

        shake_element.classList.add("shake");

        document.getElementById('sign-up-title').classList.add("hidden");
        document.getElementById('sign-up-sub-title').classList.add("hidden");

        setInterval(() => {
            document.getElementById('sign-up-title').classList.remove("hidden");
            document.getElementById('sign-up-sub-title').classList.remove("hidden");

            error_element.classList.add("hidden");
            icon_element.classList.add("hidden");
        }, 10000);

        setInterval(() => {
            shake_element.classList.remove("shake");
        }, 1000)
    } else {
        error_element.classList.add("hidden");
        icon_element.classList.add("hidden");
    }
}

//! FURTHER UPDATE 
// Show Success ( Sign Up Form )

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

// Validation Sign Up Form
function validateSignUpForm() {
    let is_valid = true;

    // Check Username
    if (username_sign_up.value === "") {
        showError("sign-up-name-error", "sign-up-name-error-icon", "Username is required.", false, "sign-up-name-shake")
        is_valid = false;
    } else {
        showError("sign-up-name-error", "sign-up-name-error-icon", "", true, "")
    }

    // Check Email
    if (!email_sign_up.value.trim()) {
        showError("sign-up-email-error", "sign-up-email-error-icon", "Email is required.", false, "sign-up-email-shake")
        is_valid = false;
    } else if (!isEmailValid(email_sign_up.value.trim())) {
        showError("sign-up-email-error", "sign-up-email-error-icon", "Email is invalid.", false, "sign-up-email-shake")
        is_valid = false;
    } else {
        showError("sign-up-email-error", "sign-up-email-error-icon", "", true, "")
    }

    // Check Password
    if (password_sign_up.value === "") {
        showError("sign-up-password-error", "sign-up-password-error-icon", "Password is required.", false, "sign-up-password-shake")
        is_valid = false;
    } else {
        showError("sign-up-password-error", "sign-up-password-error-icon", "", true, "")
    }

    // Check Confirm Password
    if (confirm_password.value === "") {
        showError("sign-up-confirm-password-error", "sign-up-confirm-password-error-icon", "Confirm password is required.", false, "sign-up-confirm-password-shake")
        is_valid = false;
    } else {
        showError("sign-up-confirm-password-error", "sign-up-confirm-password-error-icon", "", true, "")
    }

    if ((confirm_password.value == password_sign_up.value) == false) {
        showError("sign-up-confirm-password-error", "sign-up-confirm-password-error-icon", "Confirm password is wrong.", false, "sign-up-confirm-password-shake")
        is_valid = false;
    }

    return is_valid;
}

sign_up_form.addEventListener('submit', (e) => {

    e.preventDefault() // Prevent Submit

    if (validateSignUpForm() == true) {
        alert("Sign Up Success")
    }

})


document.getElementById("sign-up-button").addEventListener("click", function () {
// Ẩn login form
document.getElementById("login-container").classList.add("hidden");
// Hiện signup form
document.getElementById("signup-container").classList.remove("hidden");
});

document.getElementById("log-in-button").addEventListener("click", function () {
    // Hiện login form
document.getElementById("login-container").classList.remove("hidden");
// Ẩn signup form
document.getElementById("signup-container").classList.add("hidden");
});

// Hàm hiển thị toast
function showToast(message, duration = 3000) {
    const toast_container = document.getElementById("toast-container");
    if (!toast_container) return // Nếu chưa có container, thoát sớm

    const toast = document.createElement("div")
    toast.className = "bg-green-500 text-white px-4 py-2 rounded shadow-md mb-2 transition-transform transform translate-x-full font-semibold";
    toast.innerText = message;

    // Thêm toast vào container
    toast_container.appendChild(toast);

    // Hiệu ứng xuất hiện (slide in)
    setTimeout(() => {
        toast.classList.remove("translate-x-full");
    }, 100)

    // Xóa toast sau 'duration' mili-giây
    setTimeout(() => {
        // Hiệu ứng biến mất (slide out)
        toast.classList.add("translate-x-full");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Hàm đăng ký



// function register() {
//     const username = document.getElementById("sign-up-name").value;
//     const password = document.getElementById("sign-up-password").value;
//     const email = document.getElementById("sign-up-email").value;
//     // const confirm_password = document.getElementById("sign-up-confirm-password").value;
//     const error_msg = document.getElementById("error-msg");

//     let users = JSON.parse(localStorage.getItem("users")) || [];
//     const user_exists = users.find(u => u.email === email)

//     const check_boolean = validateSignUpForm()

//     if (user_exists) {
//         error_msg.innerText = "Email Already Exists";
//         error_msg.classList.remove("hidden");
//     } else if (check_boolean == false) {
//         console.log("Wrong Input")
//     } else {
//         const hashed_password = CryptoJS.SHA256(password).toString();
//         console.log("TEST SIGN UP", hashed_password)

//         // Thêm người dùng mới
//         const new_user = { username: username, email: email, password: hashed_password, role: "user" };
//         users.push(new_user);
//         localStorage.setItem("users", JSON.stringify(users));

//         console.log(users)

//         // Hiển thị toast
//         showToast("Register Success!", 3000);

//         // Chuyển hướng sau 3 giây
//         setTimeout(() => {
//             window.location.href = "./index.html";
//         }, 3000)
//     }
// }

// Log In
function login() {
    const email = email_log_in.value;
    const password = password_log_in.value;
    const error_msg = document.getElementById("error-msg");

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Băm mật khẩu nhập vào để so sánh


    const hashed_password = CryptoJS.SHA256(password).toString();
    console.log(hashed_password)
    const user = users.find(u => u.email === email && u.password === hashed_password);

    if (user) {
        
        localStorage.setItem("user", JSON.stringify(user));

        // Hiển thị toast
        showToast("Log In Success!", 3000)

        // Chuyển hướng sau 3 giây
        setTimeout(() => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role === " ") {
                window.location.href = "../Leader/ProjectPage/index.html";
            } else {
                window.location.href = "../Staff/index.html";
            }
        }, 3000)
    } else {
        error_msg.classList.remove("hidden");
    }
}

const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    if (user.role === " ") {
        window.location.href = "../Leader/ProjectPage/index.html";
    } else {
        window.location.href = "../Staff/index.html";
    }
}

// Hàm ẩn danh (    ) - anonymous function
// Tránh việc nó bị gọi hoặc truy cập từ bên ngoài
// IIFE - Tự động chạy khi web load - ngay khi trang được mở, đoạn code này kiểm tra xem localStorage có chứa người dùng admin chưa.
// Tránh ô nhiễm BIẾN TOÀN CỤC (Global Scope Pollution)
// Các biến khai báo bên trong hàm (user, adminExists, adminUser, admin) giúp mã nguồn gọn gàng và tránh xung đột biến

// function checkCredentialsAndSendOTP() {
//     const email = email_log_in.value;
//     const password = password_log_in.value;
//     const error_msg = document.getElementById("error-msg");

//     let users = JSON.parse(localStorage.getItem("users")) || [];
//     const hashed_password = CryptoJS.SHA256(password).toString();
//     const user = users.find(u => u.email === email && u.password === hashed_password);

//     if (user) {
//         localStorage.setItem("pendingUser", JSON.stringify(user));
//         sendLoginOTP(email);
//     } else {
//         error_msg.innerText = "Wrong Email Or Password";
//         error_msg.classList.remove("hidden");
//     }
// }

// function sendLoginOTP(email) {
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     localStorage.setItem('generatedLoginOTP', otp);
//     localStorage.setItem("loginEmail", email);

//     emailjs.send("service_i3e2hks", "template_5yb6lrq", {
//         to_email: email,
//         otp_code: otp
//     }).then(function(response) {
//         console.log("OTP sent successfully!", response);
//         document.getElementById('otpSection').classList.remove('hidden');
//         showToast("OTP sent to your email!", 3000);
//     }, function(error) {
//         console.log("Error sending OTP:", error);
//         showToast("Failed to send OTP. Please try again.", 3000);
//     });
// }

// function verifyLoginOTP() {
//     const enteredOTP = document.getElementById('otp').value;
//     const correctOTP = localStorage.getItem('generatedLoginOTP');
//     const error_msg = document.getElementById("error-msg");

//     if (enteredOTP === correctOTP) {
//         const user = JSON.parse(localStorage.getItem("pendingUser"));
//         localStorage.setItem("user", JSON.stringify(user));
//         localStorage.removeItem("pendingUser");
//         localStorage.removeItem("generatedLoginOTP");
//         localStorage.removeItem("loginEmail");
//         showToast("Log In Success!", 3000);
//         setTimeout(() => {
//             if (user.role === "admin") {
//                 window.location.href = "../Leader/ProjectPage/index.html";
//             } else {
//                 window.location.href = "../Staff/index.html";
//             }
//         }, 3000);
//     } else {
//         error_msg.innerText = "Incorrect OTP. Please try again.";
//         error_msg.classList.remove("hidden");
//     }
// }
const session = {
    email: user.email,
    loginTime: Date.now(),
    expiresIn: 30 * 60 * 1000 // 30 phút
};
localStorage.setItem("session", JSON.stringify(session));

(function () {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const admin_exists = users.some(u => u.role === "admin");
    // .some: có ÍT NHẤT một phần tử trong mảng thỏa mãn điều kiện nào đó hay không
    // kiểm tra xem có ít nhất một người dùng có role là admin hay không
    // .every: yêu cầu TẤT CẢ phần tử trong mảng phải thỏa mãn điều kiện mới trả về true. 

    if (!admin_exists) {
        // nếu có adminExists là true, không chạy vào đây 
        const admin_user = { username: "Quan", email: "leader@leader.com", password: CryptoJS.SHA256("123").toString(), role: "admin" }
        const default_user = { username: "Bu", email: "quan@quan.com", password: CryptoJS.SHA256("123").toString(), role: "user" }
        users.push(admin_user);
        users.push(default_user);
        localStorage.setItem("users", JSON.stringify(users));
        console.log("Tạo tài khoản admin mặc định:", admin_user);
    }
})();