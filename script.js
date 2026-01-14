// 🔴 CHANGE THIS AFTER RENDER DEPLOY
const BACKEND_URL = "https://YOUR-APP.onrender.com";

let jobId = null;
let jobRunning = false;

// ---------------- START ----------------

async function startProcessing() {
  if (jobRunning) {
    alert("Job already running");
    return;
  }

  const image = document.getElementById("imageInput").files[0];
  const p1 = document.getElementById("param1").value;
  const p2 = document.getElementById("param2").value;
  const status = document.getElementById("status");

  if (!image || p1 === "" || p2 === "") {
    alert("Please upload image and enter both integers");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("p1", p1);
  formData.append("p2", p2);

  try {
    jobRunning = true;
    toggleUI(true);
    status.innerText = "Processing started…";

    const res = await fetch(`${BACKEND_URL}/start`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Backend error");
    }

    const data = await res.json();

    if (!data.job_id) {
      throw new Error("Invalid response from backend");
    }

    jobId = data.job_id;
    document.getElementById("getOutputBtn").disabled = false;
    status.innerText = "Processing… click Get Output after some time";

  } catch (err) {
    jobRunning = false;
    toggleUI(false);
    status.innerText = "Failed to start ❌";
    alert(err.message);
  }
}

// ---------------- GET OUTPUT ----------------

async function getOutput() {
  const status = document.getElementById("status");
  const download = document.getElementById("downloadLink");

  try {
    const res = await fetch(`${BACKEND_URL}/result/${jobId}`);

    if (res.status === 202) {
      const data = await res.json();
      status.innerText = data.message;
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to get result");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    download.href = url;
    download.download = "output.svg";
    download.innerText = "Download SVG Output";
    download.classList.remove("hidden");

    status.innerText = "Completed ✔";
    jobRunning = false;
    toggleUI(false);

  } catch (err) {
    status.innerText = "Error ❌";
    alert(err.message);
  }
}

// ---------------- UI CONTROL ----------------

function toggleUI(disabled) {
  document.getElementById("startBtn").disabled = disabled;
  document.getElementById("imageInput").disabled = disabled;
  document.getElementById("param1").disabled = disabled;
  document.getElementById("param2").disabled = disabled;
}
