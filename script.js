let BACKEND_URL = "";
let jobRunning = false;

// -------------------- INIT --------------------

window.onload = () => {
  const saved = localStorage.getItem("BACKEND_URL");
  if (saved) {
    BACKEND_URL = saved;
    document.getElementById("backendUrlInput").value = saved;
  }
};

function saveBackendUrl() {
  const url = document.getElementById("backendUrlInput").value.trim();

  if (!url.startsWith("http")) {
    alert("Please enter a valid backend URL");
    return;
  }

  BACKEND_URL = url;
  localStorage.setItem("BACKEND_URL", url);
  alert("Backend URL saved");
}

// -------------------- START PROCESS --------------------

async function startProcessing() {
  if (jobRunning) {
    alert("A calculation is already running. Please wait.");
    return;
  }

  const image = document.getElementById("imageInput").files[0];
  const p1 = document.getElementById("param1").value;
  const p2 = document.getElementById("param2").value;
  const status = document.getElementById("status");

  if (!image) {
    alert("Please upload an image");
    return;
  }

  if (p1 === "" || p2 === "") {
    alert("Please enter both integer values");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("p1", p1);
  formData.append("p2", p2);

  try {
    jobRunning = true;
    toggleUI(true);

    status.innerText = "Please wait while we are calculating...";

    const res = await fetch(`${BACKEND_URL}/start`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Backend rejected the request");
    }

    document.getElementById("getOutputBtn").disabled = false;

  } catch (err) {
    jobRunning = false;
    toggleUI(false);
    status.innerText = "Error ❌";
    alert(err.message);
  }
}

// -------------------- GET OUTPUT --------------------

async function getOutput() {
  const status = document.getElementById("status");
  const download = document.getElementById("downloadLink");

  try {
    const res = await fetch(`${BACKEND_URL}/status`);
    const data = await res.json();

    if (data.status === "running") {
      status.innerText = "Please wait more...";
      return;
    }

    if (data.status === "done") {
      const out = await fetch(`${BACKEND_URL}/result`);
      const blob = await out.blob();

      const url = URL.createObjectURL(blob);
      download.href = url;
      download.download = "output.svg";
      download.innerText = "Download Output";
      download.classList.remove("hidden");

      status.innerText = "Calculation completed ✔";

      jobRunning = false;
      toggleUI(false);
    }

  } catch (err) {
    status.innerText = "Error ❌";
    alert(err.message);
  }
}

// -------------------- UI CONTROL --------------------

function toggleUI(disabled) {
  document.getElementById("startBtn").disabled = disabled;
  document.getElementById("imageInput").disabled = disabled;
  document.getElementById("param1").disabled = disabled;
  document.getElementById("param2").disabled = disabled;
}
