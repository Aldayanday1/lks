document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const credentials = {
    username: username,
    password: password,
  };

  fetch("http://localhost:8080/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Menyimpan token di sessionStorage
      sessionStorage.setItem("token", data.token);

      // Mengarahkan pengguna ke halaman yang sesuai berdasarkan peran
      const role = data.role;
      if (role === "USER") {
        window.location.href = "../userpage/dashboard.html";
      } else if (role === "OPERATOR") {
        window.location.href = "../operatorpage/dashboard.html";
      } else if (role === "ADMIN") {
        window.location.href = "../adminpage/dashboard.html";
      } else {
        document.getElementById("error-message").textContent = "Role tidak dikenal.";
      }
    })
    .catch((error) => {
      document.getElementById("error-message").textContent = error.message;
    });
});

// ---------------- TOGGLE PASSWORD EYES ----------------

document.addEventListener("DOMContentLoaded", function () {
  const togglePasswordIcon = document.getElementById("toggle-password-icon");
  const passwordInput = document.getElementById("password");

  togglePasswordIcon.addEventListener("click", function () {
    const isPasswordVisible = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPasswordVisible ? "text" : "password");
    togglePasswordIcon.classList.toggle("fa-eye");
    togglePasswordIcon.classList.toggle("fa-eye-slash");
  });
});
