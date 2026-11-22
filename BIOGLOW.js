// ==========================================
// CONFIGURATION: Your Live FastAPI Tunnel
// ==========================================
const API_BASE_URL = "https://reviewer-debian-maximum-adsl.trycloudflare.com          ";

const STORAGE_KEY = "neuralNestworkSightings_v1";

const initialSightings = [
  {
    id: 1,
    species: "Tūī (Prosthemadera novaeseelandiae)",
    shortName: "Tūī",
    confidence: "92.4%",
    location: "Orokonui Ecosanctuary, Dunedin",
    date: "19 Nov 2026",
    type: "image",
    src: "https://wikimedia.org",
    notes: "Feeding on harakeke flax nectar near the main visitor canopy walk at dawn.",
    isUserUpload: false
  },
  {
    id: 2,
    species: "Kākāpō (Strigops habroptilus)",
    shortName: "Kākāpō",
    confidence: "90.8%",
    location: "Orokonui Ecosanctuary (Sanctuary Enclosure)",
    date: "18 Nov 2026",
    type: "image",
    src: "https://wikimedia.org",
    notes: "Night-vision trail camera capture logged during conservation monitoring.",
    isUserUpload: false
  },
  {
    id: 3,
    species: "Kererū (Hemiphaga novaeseelandiae)",
    shortName: "Kererū",
    confidence: "91.6%",
    location: "Leith Valley Bush Track, Dunedin",
    date: "17 Nov 2026",
    type: "image",
    src: "https://wikimedia.org",
    notes: "Perched in upper kōwhai canopy near the University of Otago field sensor.",
    isUserUpload: false
  },
  {
    id: 4,
    species: "Pīwakawaka (Rhipidura fuliginosa)",
    shortName: "Pīwakawaka",
    confidence: "89.7%",
    location: "Ross Creek Reserve, Dunedin",
    date: "16 Nov 2026",
    type: "image",
    src: "https://wikimedia.org",
    notes: "Active insect foraging along shaded stream edge captured on trail camera.",
    isUserUpload: false
  },
  {
    id: 5,
    species: "Kiwi Tokoeka (Apteryx australis)",
    shortName: "Kiwi",
    confidence: "88.9%",
    location: "Otago Peninsula Conservation Zone",
    date: "15 Nov 2026",
    type: "video",
    src: "https://wikimedia.org",
    notes: "Short nocturnal camera-trap video showing forest-floor probing behaviour.",
    isUserUpload: false
  },
  {
    id: 6,
    species: "Sparrow (Passer domesticus)",
    shortName: "Sparrow",
    confidence: "91.3%",
    location: "Dunedin Botanic Garden",
    date: "19 Nov 2026",
    type: "image",
    src: "https://wikimedia.org",
    notes: "Introduced garden species logged by AI filter to separate native manu from common urban birds.",
    isUserUpload: false
  }
];

function loadSightings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...initialSightings];
    const userUploads = JSON.parse(saved);
    return [...userUploads, ...initialSightings];
  } catch (err) {
    console.warn("Could not read saved sightings:", err);
    return [...initialSightings];
  }
}

function saveUserSightings() {
  try {
    const userUploads = sightings.filter(item => item.isUserUpload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userUploads));
  } catch (err) {
    alert("Note: This file is too large for permanent browser storage, so it will stay visible until you refresh the page.");
  }
}

let sightings = loadSightings();
let activeFilter = "all";

const sightingsGrid = document.getElementById("sightingsGrid");
const filterBar = document.getElementById("filterBar");
const uploadModal = document.getElementById("uploadModal");
const openUploadBtn = document.getElementById("openUploadBtn");
const closeUploadBtn = document.getElementById("closeUploadBtn");
const cancelUploadBtn = document.getElementById("cancelUploadBtn");
const uploadForm = document.getElementById("uploadForm");
const dropZone = document.getElementById("dropZone");
const mediaInput = document.getElementById("mediaInput");
const dropPrompt = document.getElementById("dropPrompt");
const previewBox = document.getElementById("previewBox");
const scanProgress = document.getElementById("scanProgress");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const viewModal = document.getElementById("viewModal");
const closeViewBtn = document.getElementById("closeViewBtn");
const viewMediaArea = document.getElementById("viewMediaArea");
const viewTitle = document.getElementById("viewTitle");
const viewConfidence = document.getElementById("viewConfidence");
const viewMeta = document.getElementById("viewMeta");
const viewNotes = document.getElementById("viewNotes");

function renderSightings() {
  sightingsGrid.innerHTML = "";

  const filtered = activeFilter === "all"
    ? sightings
    : sightings.filter(item =>
        item.species.toLowerCase().includes(activeFilter.toLowerCase())
      );

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "sighting-card";

    const mediaTag = item.type === "video"
      ? `<video src="${item.src}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`
      : `<img src="${item.src}" alt="${item.species}" loading="lazy">`;

    const deleteBtnHTML = item.isUserUpload
      ? `<button type="button" class="delete-upload-btn" data-id="${item.id}" style="margin-top:8px; align-self:flex-start; background:none; border:1px solid #d5e5da; color:#4b6354; font-size:0.75rem; padding:3px 8px; border-radius:6px; cursor:pointer;">Remove upload</button>`
      : "";

    card.innerHTML = `
      <div class="thumb-wrap">
        ${mediaTag}
        <span class="media-pill">${item.type === "video" ? "Video Clip" : "Photo"}</span>
      </div>
      <div class="card-content">
        <div class="card-top">
          <h3>${item.shortName}</h3>
          <span class="match-pill">${item.confidence} AI</span>
        </div>
        <div class="card-location">${item.location}</div>
        <p class="card-notes">${item.notes}</p>
        ${deleteBtnHTML}
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-upload-btn")) {
        e.stopPropagation();
        deleteUserUpload(item.id);
        return;
      }
      openViewModal(item);
    });

    sightingsGrid.appendChild(card);
  });
}

function deleteUserUpload(id) {
  sightings = sightings.filter(item => item.id !== id);
  saveUserSightings();
  renderSightings();
}

filterBar.addEventListener("click", (e) => {
  if (!e.target.classList.contains("filter-btn")) return;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  activeFilter = e.target.dataset.filter;
  renderSightings();
});

function openUploadModal() {
  uploadModal.classList.remove("hidden");
}

function closeUploadModal() {
  uploadModal.classList.add("hidden");
  uploadForm.reset();
  previewBox.classList.add("hidden");
  previewBox.innerHTML = "";
  dropPrompt.classList.remove("hidden");
  scanProgress.classList.add("hidden");
  progressBar.style.width = "0%";
}

openUploadBtn.addEventListener("click", openUploadModal);
closeUploadBtn.addEventListener("click", closeUploadModal);
cancelUploadBtn.addEventListener("click", closeUploadModal);
uploadModal.addEventListener("click", (e) => {
  if (e.target === uploadModal) closeUploadModal();
});

dropZone.addEventListener("click", () => mediaInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length) {
    mediaInput.files = e.dataTransfer.files;
    showPreview(e.dataTransfer.files.item(0));
  }
});

mediaInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    showPreview(e.target.files.item(0));
  }
});

function showPreview(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");
  dropPrompt.classList.add("hidden");
  previewBox.classList.remove("hidden");
  previewBox.innerHTML = isVideo
    ? `<video src="${url}" controls muted></video>`
    : `<img src="${url}" alt="Selected bird preview">`;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==========================================
// UPLOAD FORM SUBMIT WITH REAL YOLO API
// ==========================================
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = mediaInput.files.item(0);
  if (!file) {
    alert("Please select a photo or video first.");
    return;
  }

  const chosenSpecies = document.getElementById("birdSpecies").value;
  const locationText = document.getElementById("locationInput").value;
  const notesText = document.getElementById("notesInput").value.trim() || "Submitted via Neural Nestwork NZ field portal.";
  const isVideo = file.type.startsWith("video/");

  scanProgress.classList.remove("hidden");
  progressBar.style.width = "30%";
  progressLabel.textContent = "Uploading image to YOLO AI server...";

  let persistentSrc;
  try {
    persistentSrc = await fileToDataURL(file);
  } catch {
    persistentSrc = URL.createObjectURL(file);
  }

  let finalSpecies = chosenSpecies;
  let confidenceStr = "Manual Entry";

  if (chosenSpecies === "Auto-Detect" && !isVideo) {
    try {
      progressBar.style.width = "65%";
      progressLabel.textContent = "Running YOLO detection & species classification...";

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/predict-upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      progressBar.style.width = "95%";

      if (data.birds_found > 0 && data.detections.length > 0) {
        // Pick highest confidence detection
        const bestDetection = data.detections.reduce((best, curr) =>
          curr.confidence > best.confidence ? curr : best
        );

        finalSpecies = bestDetection.species;
        confidenceStr = `${(bestDetection.confidence * 100).toFixed(1)}%`;
      } else {
        finalSpecies = "Unidentified / No Bird Detected";
        confidenceStr = "0.0%";
      }
    } catch (err) {
      console.error("AI Server Error:", err);
      alert("Could not reach the AI server. Make sure FastAPI and Cloudflare Tunnel are running.");
      scanProgress.classList.add("hidden");
      progressBar.style.width = "0%";
      return;
    }
  } else if (chosenSpecies === "Auto-Detect" && isVideo) {
    alert("Auto-Detect currently supports photos. Please select a species manually for videos.");
    scanProgress.classList.add("hidden");
    progressBar.style.width = "0%";
    return;
  }

  progressBar.style.width = "100%";
  progressLabel.textContent = "Sighting verified!";

  const shortName = finalSpecies.split(" ")[0];
  const todayStr = new Date().toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  sightings.unshift({
    id: Date.now(),
    species: finalSpecies,
    shortName: shortName,
    confidence: confidenceStr,
    location: locationText,
    date: todayStr,
    type: isVideo ? "video" : "image",
    src: persistentSrc,
    notes: notesText,
    isUserUpload: true
  });

  saveUserSightings();
  renderSightings();
  closeUploadModal();
  document.getElementById("sightings").scrollIntoView({ behavior: "smooth" });
});

const prevSightingBtn = document.getElementById("prevSightingBtn");
const nextSightingBtn = document.getElementById("nextSightingBtn");
const viewCounter = document.getElementById("viewCounter");
let currentSightingIndex = 0;

function getFilteredSightings() {
  return activeFilter === "all"
    ? sightings
    : sightings.filter(item =>
        item.species.toLowerCase().includes(activeFilter.toLowerCase())
      );
}

function openViewModal(item) {
  const list = getFilteredSightings();
  currentSightingIndex = list.findIndex(entry => entry.id === item.id);
  if (currentSightingIndex === -1) currentSightingIndex = 0;

  renderLightboxContent(list);
  viewModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function renderLightboxContent(list) {
  const item = list[currentSightingIndex];
  if (!item) return;

  const isIntroduced = item.species.includes("Sparrow") || item.species.includes("Blackbird");
  const statusLabel = isIntroduced ? "Introduced Garden Species" : "Native to Aotearoa NZ";
  const latinMatch = item.species.match(/\(([^)]+)\)/);
  const scientificName = latinMatch ? latinMatch[1] : item.species;

  viewTitle.textContent = item.shortName;
  viewConfidence.textContent = `${item.confidence} AI Match`;
  viewMeta.textContent = scientificName;
  viewCounter.textContent = `Sighting ${currentSightingIndex + 1} of ${list.length}`;

  viewNotes.innerHTML = `
    <ul class="view-spec-list">
      <li><span>Status</span><span>${statusLabel}</span></li>
      <li><span>Location</span><span>${item.location}</span></li>
      <li><span>Recorded</span><span>${item.date}</span></li>
      <li><span>Format</span><span>${item.type === "video" ? "Camera Video" : "Field Photo"}</span></li>
    </ul>
    <p style="margin-top: 8px; line-height: 1.5; font-size: 0.9rem;"><strong>Field Notes:</strong> ${item.notes}</p>
  `;

  viewMediaArea.innerHTML = item.type === "video"
    ? `<video src="${item.src}" controls autoplay></video>`
    : `<img src="${item.src}" alt="${item.species}">`;
}

function showPrevSighting(e) {
  if (e) e.stopPropagation();
  const list = getFilteredSightings();
  if (!list.length) return;
  currentSightingIndex = (currentSightingIndex - 1 + list.length) % list.length;
  renderLightboxContent(list);
}

function showNextSighting(e) {
  if (e) e.stopPropagation();
  const list = getFilteredSightings();
  if (!list.length) return;
  currentSightingIndex = (currentSightingIndex + 1) % list.length;
  renderLightboxContent(list);
}

function closeViewModal() {
  viewModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  viewMediaArea.innerHTML = "";
}

prevSightingBtn.addEventListener("click", showPrevSighting);
nextSightingBtn.addEventListener("click", showNextSighting);
closeViewBtn.addEventListener("click", closeViewModal);

viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) closeViewModal();
});

document.addEventListener("keydown", (e) => {
  if (viewModal.classList.contains("hidden")) return;
  if (e.key === "ArrowLeft") showPrevSighting();
  if (e.key === "ArrowRight") showNextSighting();
  if (e.key === "Escape") closeViewModal();
});

renderSightings();
