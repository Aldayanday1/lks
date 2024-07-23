// Fungsi untuk menampilkan pesan notifikasi dengan efek animasi
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hide");
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.add("hide");
    setTimeout(() => (notification.style.display = "none"), 300); // Sesuaikan dengan durasi animasi
  }, 3000); // Menampilkan pesan selama 3 detik

  notification.style.display = "block";
}

// Menangani parameter URL untuk menampilkan pesan
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get("message");

if (message === "sessionExpired") {
  showNotification("Session telah habis silahkan login kembali.");
  // Hapus parameter message dari URL setelah menampilkan notifikasi
  const url = new URL(window.location);
  url.searchParams.delete("message");
  window.history.replaceState({}, document.title, url);
}

document.addEventListener("DOMContentLoaded", function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  const elements = document.querySelectorAll(".news, .course-col");
  elements.forEach((element) => observer.observe(element));
});
