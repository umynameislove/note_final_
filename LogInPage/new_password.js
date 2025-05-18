// Hàm hiển thị thông báo trạng thái
function showStatus(message, isSuccess) {
    const status = document.getElementById('status');
    status.innerText = message;
    status.className = `mt-4 text-center font-semibold ${isSuccess ? 'text-green-600' : 'text-red-500'}`;
}

// Hàm bật/tắt hiển thị mật khẩu
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.innerHTML = isPassword
        ? `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`
        : `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
}

// Hàm đổi mật khẩu
async function changePassword() {
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const submitButton = document.getElementById('submitButton');
    const email = localStorage.getItem('resetEmail');

    // Reset thông báo lỗi
    newPasswordError.classList.add('hidden');
    confirmPasswordError.classList.add('hidden');
    showStatus('', true);

    // Kiểm tra input
    if (!newPassword || !confirmPassword) {
        showStatus('Vui lòng nhập đầy đủ thông tin.', false);
        return;
    }

    if (newPassword.length < 6) {
        newPasswordError.classList.remove('hidden');
        showStatus('Mật khẩu mới phải có ít nhất 6 ký tự.', false);
        return;
    }

    if (newPassword !== confirmPassword) {
        confirmPasswordError.classList.remove('hidden');
        showStatus('Mật khẩu xác nhận không khớp.', false);
        return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Email không hợp lệ. Vui lòng thử lại từ đầu.', false);
        setTimeout(() => {
            window.location.href = 'otp.html';
        }, 1500);
        return;
    }

    try {
        // Hiển thị trạng thái loading
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span>Đang xử lý...</span>
            <svg class="inline h-5 w-5 ml-2 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
        `;

        const response = await fetch('http://localhost:4000/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus('Đặt mật khẩu thành công!', true);
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('generatedOTP');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 1500);
        } else {
            showStatus(data.message || 'Không thể đặt mật khẩu. Vui lòng thử lại.', false);
        }
    } catch (error) {
        console.error('Lỗi đặt mật khẩu:', error);
        showStatus('Lỗi server. Vui lòng thử lại sau.', false);
    } finally {
        // Khôi phục nút submit
        submitButton.disabled = false;
        submitButton.innerText = 'Đặt Mật Khẩu';
    }
}