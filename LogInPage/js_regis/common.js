// Check validation of email
const isEmailValid = (email) => {
    const check_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return check_email.test(String(email).toLowerCase());
}

function isUsernameValid(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

function isPasswordStrong(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
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