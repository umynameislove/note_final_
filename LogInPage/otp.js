function sendOTP() {
    const email = document.getElementById('email').value;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit random OTP

    localStorage.setItem('generatedOTP', otp); // Lưu OTP
    localStorage.setItem("resetEmail", email);

    emailjs.send("service_i3e2hks", "template_5yb6lrq", {
        to_email: email,
        otp_code: otp
    }).then(function(response) {
        console.log("OTP sent successfully!", response);
        document.getElementById('otpSection').classList.remove('hidden');
    }, function(error) {
        console.log("Error sending OTP:", error);
        alert("Failed to send OTP. Please try again.");
    });
}

function verifyOTP() {
    const enteredOTP = document.getElementById('otp').value;
    const correctOTP = localStorage.getItem('generatedOTP');
    const status = document.getElementById('status');

    if (enteredOTP === correctOTP) {
        status.innerText = "OTP verified successfully!";
        status.classList.remove('text-red-500');
        status.classList.add('text-green-600');
        setTimeout(() => {
            window.location.href = "new_password.html";
        }, 1500);
    } else {
        status.innerText = "Incorrect OTP. Please try again.";
        status.classList.remove('text-green-600');
        status.classList.add('text-red-500');
    }
}
