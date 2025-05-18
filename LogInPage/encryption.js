// Khai báo key – lưu ý: key này phải được bảo mật trong ứng dụng thật
const encryptionKey = "secret-key";

// Hàm mã hóa
function encryptText(text) {
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
}

// Hàm giải mã chưa đảo nha nha nha 
function decryptText(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}
