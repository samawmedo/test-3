const weddingDate = new Date("2026-06-21T21:00:00");
const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicState = document.getElementById("musicState");
let hasAutoPlayedMusic = false;

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const galleryItems = document.querySelectorAll(".gallery-item");

const messageForm = document.getElementById("messageForm");
const formStatus = document.getElementById("formStatus");

const qrContainer = document.getElementById("qrcode");
const downloadQrBtn = document.getElementById("downloadQr");

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    countdownEls.days.textContent = "00";
    countdownEls.hours.textContent = "00";
    countdownEls.minutes.textContent = "00";
    countdownEls.seconds.textContent = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownEls.days.textContent = String(days).padStart(2, "0");
  countdownEls.hours.textContent = String(hours).padStart(2, "0");
  countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
  countdownEls.seconds.textContent = String(seconds).padStart(2, "0");
}

function requestAndScheduleNotifications() {
  if (!("Notification" in window)) {
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission !== "granted") {
      return;
    }

    // Notify instantly once, then repeat every 8 hours while the tab is active.
    new Notification("Wedding Reminder", {
      body: "You are invited! Check the latest details on our invitation page.",
      icon: "https://cdn-icons-png.flaticon.com/512/2589/2589175.png",
    });

    setInterval(() => {
      new Notification("Wedding Reminder", {
        body: "Friendly reminder: our celebration is getting closer.",
        icon: "https://cdn-icons-png.flaticon.com/512/2589/2589175.png",
      });
    }, 8 * 60 * 60 * 1000);
  });
}

function setupMusicPlayer() {
  const tryAutoplay = () => {
    if (hasAutoPlayedMusic) return;
    hasAutoPlayedMusic = true;
    music
      .play()
      .then(() => {
        musicState.textContent = "Pause Music";
      })
      .catch(() => {
        musicState.textContent = "Play Music";
      });
  };

  ["click", "touchstart", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, tryAutoplay, { once: true });
  });

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().then(() => {
        musicState.textContent = "Pause Music";
      });
    } else {
      music.pause();
      musicState.textContent = "Play Music";
    }
  });
}

function setupLightbox() {
  galleryItems.forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

function setupMessageForm() {
  const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "Sending your message...";

    const formData = new FormData(messageForm);
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: formData.get("name"),
      message: formData.get("message"),
      subject: "New Wedding Wish",
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        formStatus.textContent = "Thank you! Your lovely message was sent successfully.";
        messageForm.reset();
      } else {
        formStatus.textContent = "Could not send right now. Please try again.";
      }
    } catch (error) {
      formStatus.textContent = "Network error. Please try again later.";
    }
  });
}

function setupQRCode() {
  const pageUrl = window.location.href;

  new QRCode(qrContainer, {
    text: pageUrl,
    width: 200,
    height: 200,
    colorDark: "#8c682f",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  downloadQrBtn.addEventListener("click", () => {
    const qrImage = qrContainer.querySelector("img");
    const qrCanvas = qrContainer.querySelector("canvas");
    const source = qrImage ? qrImage.src : qrCanvas?.toDataURL("image/png");

    if (!source) return;

    const tempLink = document.createElement("a");
    tempLink.href = source;
    tempLink.download = "wedding-invitation-qr.png";
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
  });
}

function setupRevealAnimation() {
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

updateCountdown();
setInterval(updateCountdown, 1000);
requestAndScheduleNotifications();
setupMusicPlayer();
setupLightbox();
setupMessageForm();
setupQRCode();
setupRevealAnimation();
