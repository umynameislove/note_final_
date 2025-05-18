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