const API_BASE = "http://localhost:8000";

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const selectedFileDiv = document.getElementById("selectedFile");
const identifyBtn = document.getElementById("identifyBtn");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const resultBox = document.getElementById("resultBox");

let selectedFile = null;

// =====================================================
// FILE HANDLING
// =====================================================

function setFile(file) {

  const validTypes = [
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3"
  ];

  if (!validTypes.includes(file.type)) {
    showError("Unsupported format. Use WAV or MP3.");
    return;
  }

  selectedFile = file;

  selectedFileDiv.classList.remove("hidden");

  selectedFileDiv.innerHTML = `
    <strong>Selected File</strong><br><br>
    ${file.name}<br>
    ${(file.size / 1024 / 1024).toFixed(2)} MB
  `;
}

// Click Upload

dropArea.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    setFile(e.target.files[0]);
  }
});

// Drag & Drop

["dragenter", "dragover"].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "#22d3ee";
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "rgba(255,255,255,0.2)";
  });
});


dropArea.addEventListener("drop", (e) => {

  const file = e.dataTransfer.files[0];

  if (file) {
    setFile(file);
  }
});

// =====================================================
// IDENTIFICATION
// =====================================================

identifyBtn.addEventListener("click", async () => {

  hideError();

  if (!selectedFile) {
    showError("Please upload an audio file.");
    return;
  }

  loading.classList.remove("hidden");
  resultBox.classList.add("hidden");

  try {

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(`${API_BASE}/identify`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    loading.classList.add("hidden");

    if (!response.ok) {
      throw new Error(data.detail || "Identification failed");
    }

    if (!data.match_found) {
      showError("No matching song found.");
      return;
    }

    displayResult(data);

  } catch (err) {

    loading.classList.add("hidden");
    showError(err.message);
  }
});

// =====================================================
// DISPLAY RESULT
// =====================================================

function displayResult(data) {

  resultBox.classList.remove("hidden");

  document.getElementById("songTitle").textContent = data.result.title;

  document.getElementById("artistName").textContent = data.result.artist;

  const confidence = (data.result.confidence * 100).toFixed(1);

  document.getElementById("confidenceText").textContent = `${confidence}%`;

  document.getElementById("confidencePercent").textContent = `${confidence}%`;

  document.getElementById("progressFill").style.width = `${confidence}%`;

  document.getElementById("latencyText").textContent = `${data.latency_seconds}s`;
}

// =====================================================
// HEALTH CHECK
// =====================================================

async function fetchHealth() {

  try {

    const response = await fetch(`${API_BASE}/health`);

    const data = await response.json();

    document.getElementById("songsIndexed").textContent = data.total_songs;

    document.getElementById("fingerprints").textContent = data.total_fingerprints;

    document.getElementById("datasetLoaded").textContent =
      data.dataset_loaded ? "Yes" : "No";

    document.getElementById("indexReady").textContent =
      data.index_ready ? "Ready" : "Not Ready";

    document.getElementById("healthStatus").textContent = data.status;

  } catch (err) {
    console.error(err);
  }
}

fetchHealth();

// Refresh button

document.getElementById("refreshHealth")
  .addEventListener("click", fetchHealth);

// =====================================================
// ERROR HANDLING
// =====================================================

function showError(message) {

  errorBox.classList.remove("hidden");
  errorBox.textContent = message;
}

function hideError() {

  errorBox.classList.add("hidden");
}