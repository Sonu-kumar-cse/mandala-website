// 🔴 CHANGE THIS ONCE AFTER DEPLOYING ON RENDER
const BACKEND_URL = "https://YOUR-APP-NAME.onrender.com";

let jobId = null;
let jobRunning = false;

// -------------------- START PROCESS --------------------

async function startProcessing() {
  if (jobRunning) {
    alert("A job is already running. Please wait.");
    return;
  }

  const image = document.getElementById("imageInput").files[0];
  const p1 = document.getElementById("param1").value;
  const p2 = document.getElementById("param2").value;
  const status = document.getElementById("status");

  if (!image || p1 === "" || p2 === "") {
    alert("Please provide image and both integers");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("p1", p1);
  formData.append("p2", p2);

  try {
    jobRunning = true;
    toggleUI(true);
    status.innerText = "Processing started… please wait";

    const res = await fetch(`${BACKEND_URL}/start`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    jobId = data.job_id;

    document.getElementById("getOutputBtn").disabled = false;
    status.innerText = "Processing… click Get Output after some time";

  } catch (err) {
    jobRunning = false;
    toggleUI(false);
    alert("Failed to start processing");
  }
}

// -------------------- GET OUTPUT --------------------

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

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    download.href = url;
    download.download = "output.svg";
    download.innerText = "Download SVG Output";
    download.classList.remove("hidden");

    status.innerText = "Completed ✔";
    jobRunning = false;
    toggleUI(false);

  } catch {
    alert("Failed to fetch output");
  }
}

// -------------------- UI CONTROL --------------------

function toggleUI(disabled) {
  document.getElementById("startBtn").disabled = disabled;
  document.getElementById("imageInput").disabled = disabled;
  document.getElementById("param1").disabled = disabled;
  document.getElementById("param2").disabled = disabled;
}
