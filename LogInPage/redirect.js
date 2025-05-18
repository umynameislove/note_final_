// Check if user is log in
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../../LogInPage/index.html";s
}

const session = JSON.parse(localStorage.getItem("session"));
if (!session || Date.now() - session.loginTime > session.expiresIn) {
  localStorage.removeItem("session");
  window.location.href = "index.html";
}

// http://192.168.1.9:5504/LogInPage/index.html
