// Check if user is log in
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../../LogInPage/index.html";
}

// http://192.168.1.9:5504/LogInPage/index.html
// http://192.168.1.9:5503/Leader/ProjectPage/index.html
// http://192.168.1.9:5503/Leader/UserPage/index.html