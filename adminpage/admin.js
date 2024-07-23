// Ambil referensi elemen HTML yang dibutuhkan
const userTable = document.getElementById("userTable");
const userForm = document.getElementById("userForm");
const userModal = document.getElementById("userModal");
const modalTitle = document.getElementById("modalTitle");
const saveUserBtn = document.getElementById("saveUserBtn");

// Panggil fetchUsers untuk pertama kali saat halaman dimuat
fetchUsers();

// Fungsi untuk mengatur ulang form modal
function resetForm() {
  userForm.reset();
  document.getElementById("userId").value = "";
  modalTitle.innerText = "Tambah Pengguna";
}

// Fungsi untuk menampilkan modal Tambah Pengguna
function openAddUserModal() {
  resetForm();
  userModal.style.display = "flex"; // Menggunakan flex untuk memusatkan modal
  userModal.classList.remove("fade-out");
  document.querySelector(".modal-content").classList.remove("slide-out");
}

// Fungsi untuk menutup modal Tambah/Edit Pengguna
function closeUserModal() {
  userModal.classList.add("fade-out");
  document.querySelector(".modal-content").classList.add("slide-out");
  setTimeout(() => {
    userModal.style.display = "none";
  }, 500); // Waktu harus sesuai dengan durasi animasi
}

// Fungsi untuk menampilkan modal konfirmasi logout
function openLogoutModal() {
  logoutModal.style.display = "flex"; // Menggunakan flex untuk memusatkan modal
  logoutModal.classList.remove("fade-out");
  document.querySelector(".modal-content").classList.remove("slide-out");
}

// Fungsi untuk menutup modal konfirmasi logout
function closeLogoutModal() {
  logoutModal.classList.add("fade-out");
  document.querySelector(".modal-content").classList.add("slide-out");
  setTimeout(() => {
    logoutModal.style.display = "none";
  }, 500); // Waktu harus sesuai dengan durasi animasi
}

// Fungsi untuk menampilkan notifikasi dengan animasi
function showNotification(message, type) {
  const notificationContainer = document.getElementById("notification-container");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notificationContainer.appendChild(notification);

  // Tampilkan notifikasi dengan animasi
  setTimeout(() => {
    notification.classList.add("show");

    // Hilangkan notifikasi setelah 3 detik dengan animasi
    setTimeout(() => {
      notification.classList.remove("show");
      notification.classList.add("hide");

      // Hapus elemen notifikasi dari DOM setelah animasi selesai
      setTimeout(() => {
        notificationContainer.removeChild(notification);
      }, 500);
    }, 3000);
  }, 10);
}

/* ---------------------- LOGOUT ---------------------- */

// Fungsi untuk melakukan logout setelah konfirmasi
function confirmLogout() {
  // Validasi token sebelum logout
  const token = sessionStorage.getItem("token");

  fetch("http://localhost:8080/api/admin/logout", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        sessionStorage.removeItem("token"); // Hapus token dari sessionStorage
        window.location.href = "../landingpage/landingpage.html"; // Redirect ke halaman login
      } else {
        throw new Error("Gagal logout.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat logout.");
    });
}

// Tambahkan event listener untuk tombol logout
logoutLink.addEventListener("click", openLogoutModal);
confirmLogoutBtn.addEventListener("click", confirmLogout);

/* ------------------ FETCH ALL DATA ------------------ */

// Ambil data pengguna dari backend dan tampilkan dalam tabel
async function fetchUsers() {
  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/admin/users", {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token tidak valid atau kadaluarsa, arahkan pengguna ke halaman landing page dengan pesan
        sessionStorage.removeItem("token");
        window.location.href = "../landingpage/landingpage.html?message=sessionExpired";
        return;
      }
      throw new Error("Gagal mengambil data pengguna.");
    }

    const users = await response.json();
    renderUserTable(users);
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat mengambil data pengguna.");
  }
}

function renderUserTable(users) {
  const tableBody = document.getElementById("userTable");

  // Clear existing table rows
  tableBody.innerHTML = "";

  // Filter users based on role (misalnya, tidak menampilkan role ADMIN)
  const filteredUsers = users.filter((user) => user.role !== "ADMIN");

  if (filteredUsers.length > 0) {
    let tableHtml = `
      <thead>
        <tr>
          <th>No.</th>
          <th>Username</th>
          <th>Role</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
    `;

    filteredUsers.forEach((user, index) => {
      tableHtml += `
        <tr>
          <td>${index + 1}</td>
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td class="action-buttons">
            <button onclick="editUser(${user.id})">Edit</button>
            <button onclick="showDeleteUserModal(${user.id})">Hapus</button>
          </td>
        </tr>
      `;
    });

    tableHtml += `</tbody>`;
    tableBody.innerHTML = tableHtml;
  } else {
    tableBody.innerHTML = `
      <thead>
        <tr>
          <th>No.</th>
          <th>Username</th>
          <th>Role</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4">Tidak ada pengguna yang ditemukan.</td>
        </tr>
      </tbody>
    `;
  }
}

/* ------------------ POST / PUT USER ------------------ */

// Fungsi untuk menambah atau mengedit pengguna
async function saveUser(event) {
  event.preventDefault();
  const formData = new FormData(userForm);
  const id = document.getElementById("userId").value; // Mengambil nilai userId dengan benar
  const username = formData.get("username");
  const password = formData.get("password");
  const role = formData.get("role");

  const user = { username, password, role };

  try {
    let response;
    const token = sessionStorage.getItem("token");

    if (id) {
      // Jika id ada, lakukan update
      response = await fetch(`http://localhost:8080/api/admin/users/${id}?role=${role}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(user),
      });

      // Tampilkan notifikasi untuk pembaruan
      showNotification("Pengguna berhasil diperbarui.", "update");
    } else {
      // Jika id tidak ada, lakukan tambah pengguna baru
      response = await fetch(`http://localhost:8080/api/admin/users?role=${role}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(user),
      });

      // Tampilkan notifikasi untuk pembuatan
      showNotification("Pengguna berhasil dibuat.", "create");
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token tidak valid atau kadaluarsa, arahkan pengguna ke halaman landing page
        sessionStorage.removeItem("token");
        window.location.href = "../landingpage/landingpage.html?message=sessionExpired";
        return;
      }
      const errorMessage = await response.text();
      throw new Error(`Gagal menyimpan pengguna: ${errorMessage}`);
    }

    // Refresh data pengguna setelah berhasil menyimpan
    fetchUsers();
    closeUserModal();
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menyimpan pengguna.");
  }
}

// Event listener untuk form pengguna
userForm.addEventListener("submit", saveUser);

/* ---------------- GET DATA BY ID (FOR EDIT) ---------------- */

// Fungsi untuk mengambil data pengguna berdasarkan ID dan mengisi form untuk edit
async function editUser(id) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/api/admin/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token tidak valid atau kadaluarsa, arahkan pengguna ke halaman landing page
        sessionStorage.removeItem("token");
        window.location.href = "../landingpage/landingpage.html?message=sessionExpired";
        return;
      }
      throw new Error("Gagal mengambil data pengguna.");
    }

    const userData = await response.json();
    modalTitle.innerText = "Edit Pengguna";
    document.getElementById("userId").value = userData.id;
    document.getElementById("username").value = userData.username;
    document.getElementById("password").value = ""; // Kosongkan field password untuk keamanan
    // document.getElementById("password").value = userData.password;
    document.getElementById("role").value = userData.role;

    // Tampilkan modal dengan animasi
    userModal.style.display = "flex";
    userModal.classList.remove("fade-out");
    document.querySelector(".modal-content").classList.remove("slide-out");
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat mengambil data pengguna untuk edit.");
  }
}

/* ------------------ DELETE USER ------------------ */

// Fungsi untuk menampilkan modal konfirmasi hapus pengguna
function openDeleteUserModal(id) {
  const deleteUserModal = document.getElementById("deleteUserModal");
  deleteUserModal.style.display = "flex"; // Menggunakan flex untuk memusatkan modal
  deleteUserModal.classList.remove("fade-out");
  document.querySelector("#deleteUserModal .modal-content").classList.remove("slide-out");

  // Menyimpan ID pengguna yang akan dihapus dalam variabel global
  window.currentUserId = id;
}

// Fungsi untuk menutup modal konfirmasi hapus pengguna
function closeDeleteUserModal() {
  const deleteUserModal = document.getElementById("deleteUserModal");
  deleteUserModal.classList.add("fade-out");
  document.querySelector("#deleteUserModal .modal-content").classList.add("slide-out");
  setTimeout(() => {
    deleteUserModal.style.display = "none";
  }, 500); // Waktu harus sesuai dengan durasi animasi
}

// Fungsi untuk menghapus pengguna berdasarkan ID
async function deleteUser() {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/api/admin/users/${window.currentUserId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token tidak valid atau kadaluarsa, arahkan pengguna ke halaman landing page
        sessionStorage.removeItem("token");
        window.location.href = "../landingpage/landingpage.html?message=sessionExpired";
        return;
      }
      throw new Error("Gagal menghapus pengguna.");
    }

    // Tampilkan notifikasi untuk penghapusan
    showNotification("Pengguna berhasil dihapus.", "delete");

    // Refresh data pengguna setelah berhasil menghapus
    fetchUsers();
    closeDeleteUserModal(); // Menutup modal setelah hapus pengguna
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menghapus pengguna.");
  }
}

// Event listener untuk tombol hapus
document.getElementById("confirmDeleteBtn").addEventListener("click", deleteUser);

// Fungsi untuk menampilkan modal hapus pengguna
function showDeleteUserModal(id) {
  openDeleteUserModal(id);
}

/* --------------- TOGGLE PASSWORD (EYES) -------------- */

// Event listener untuk ikon mata pada input password
document.getElementById("togglePassword").addEventListener("click", function (e) {
  const passwordInput = document.getElementById("password");
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  this.classList.toggle("fa-eye-slash");
});
