const SAMPLE_CLIPS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4"
];

const state = {
  credits: Number(localStorage.getItem("nf_credits") ?? 3),
  plan: localStorage.getItem("nf_plan") || "FREE PLAN",
  videos: JSON.parse(localStorage.getItem("nf_videos") || "[]"),
  replicateKey: localStorage.getItem("nf_replicate_key") || ""
};

const el = {
  userPlanBadge: document.getElementById("userPlanBadge"),
  creditCounter: document.getElementById("creditCounter"),
  promptInput: document.getElementById("promptInput"),
  aspectSelect: document.getElementById("aspectSelect"),
  durationSelect: document.getElementById("durationSelect"),
  generateBtn: document.getElementById("generateBtn"),
  statusText: document.getElementById("statusText"),
  modeTag: document.getElementById("modeTag"),
  playerBox: document.getElementById("playerBox"),
  previewActions: document.getElementById("previewActions"),
  downloadLink: document.getElementById("downloadLink"),
  videoGrid: document.getElementById("videoGrid"),
  replicateKeyInput: document.getElementById("replicateKeyInput"),
  apiKeyStatus: document.getElementById("apiKeyStatus")
};

function saveState() {
  localStorage.setItem("nf_credits", String(state.credits));
  localStorage.setItem("nf_plan", state.plan);
  localStorage.setItem("nf_videos", JSON.stringify(state.videos));
  localStorage.setItem("nf_replicate_key", state.replicateKey);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateUI() {
  el.userPlanBadge.textContent = state.plan;
  el.creditCounter.textContent = `${state.credits} Credits`;
  el.modeTag.textContent = state.replicateKey ? "Replicate Key Saved" : "Demo Mode";

  if (!state.videos.length) {
    el.videoGrid.innerHTML = `<p style="color:#9ca3af;">No videos yet. Generate your first video above!</p>`;
  } else {
    el.videoGrid.innerHTML = state.videos
      .map(
        (v) => `
        <article class="video-item">
          <video src="${v.url}" controls preload="metadata"></video>
          <div class="video-meta">
            <p>${escapeHtml(v.prompt)}</p>
            <span>${v.aspect} &bull; ${v.duration}s</span>
          </div>
        </article>
      `
      )
      .join("");
  }
}

function setPreview(url) {
  el.playerBox.innerHTML = `<video src="${url}" controls autoplay loop playsinline></video>`;
  el.downloadLink.href = url;
  el.previewActions.classList.remove("hidden");
}

window.selectPlan = function (planName, addedCredits) {
  state.plan = planName.toUpperCase();
  state.credits += addedCredits;
  saveState();
  updateUI();
  el.statusText.textContent = `${planName} selected! +${addedCredits} credits added.`;
};

el.generateBtn.addEventListener("click", async () => {
  const prompt = el.promptInput.value.trim();
  if (!prompt) {
    el.statusText.textContent = "Please enter a video prompt first.";
    return;
  }
  if (state.credits <= 0) {
    el.statusText.textContent = "Out of credits! Choose a plan in Pricing Plans below.";
    return;
  }

  el.generateBtn.disabled = true;
  el.statusText.textContent = "Generating video...";

  await new Promise((r) => setTimeout(r, 900));

  const idx = Math.abs(prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % SAMPLE_CLIPS.length;
  const videoUrl = SAMPLE_CLIPS[idx];

  state.credits -= 1;
  state.videos.unshift({
    prompt,
    aspect: el.aspectSelect.value,
    duration: el.durationSelect.value,
    url: videoUrl
  });
  state.videos = state.videos.slice(0, 12);

  saveState();
  updateUI();
  setPreview(videoUrl);
  el.statusText.textContent = "Video ready! Saved to My Generated Videos.";
  el.generateBtn.disabled = false;
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    el.promptInput.value = chip.dataset.prompt;
  });
});

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  state.videos = [];
  saveState();
  updateUI();
});

document.getElementById("saveApiKeyBtn").addEventListener("click", () => {
  state.replicateKey = el.replicateKeyInput.value.trim();
  saveState();
  updateUI();
  el.apiKeyStatus.textContent = state.replicateKey
    ? "API key saved in browser. (Note: direct browser calls to Replicate require a backend server due to CORS.)"
    : "API key cleared. Running in Demo Mode.";
});

if (state.replicateKey) {
  el.replicateKeyInput.value = state.replicateKey;
}

updateUI();
    
