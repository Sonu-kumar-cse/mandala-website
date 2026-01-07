let BACKEND_URL = "";
let jobRunning = false;

// -------------------- INIT --------------------

window.onload = () => {
  const saved = localStorage.getItem("BACKEND_URL");
  if (saved) {
    BACKEND_URL = saved.replace(/\/$/, ""); // Normalize: remove trailing slash
    document.getElementById("backendUrlInput").value = BACKEND_URL;
  }
};

function saveBackendUrl() {
  const url = document.getElementById("backendUrlInput").value.trim();

  if (!url.startsWith("http")) {
    alert("Please enter a valid backend URL");
    return;
  }

  // Normalize URL: remove trailing slash
  BACKEND_URL = url.replace(/\/$/, "");
  localStorage.setItem("BACKEND_URL", BACKEND_URL);
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
    if (!BACKEND_URL) {
      throw new Error("Please enter and save the Backend URL first");
    }

    jobRunning = true;
    toggleUI(true);

    status.innerText = "Please wait while we are calculating...";

    console.log("Sending request to:", `${BACKEND_URL}/start`);

    const res = await fetch(`${BACKEND_URL}/start`, {
      method: "POST",
      body: formData
    });

    console.log("Response status:", res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Backend error:", errorText);
      throw new Error(`Backend error (${res.status}): ${errorText || res.statusText}`);
    }

    const result = await res.json();
    console.log("Start response:", result);

    document.getElementById("getOutputBtn").disabled = false;

  } catch (err) {
    jobRunning = false;
    toggleUI(false);
    status.innerText = "Error ❌";
    console.error("Start processing error:", err);
    
    // Show more detailed error message
    const errorMsg = err.message || "Network error. Check console for details.";
    alert(errorMsg);
  }
}

// -------------------- GET OUTPUT --------------------

async function getOutput() {
  const status = document.getElementById("status");
  const download = document.getElementById("downloadLink");

  try {
    if (!BACKEND_URL) {
      throw new Error("Backend URL not set");
    }

    console.log("Checking status:", `${BACKEND_URL}/status`);
    const res = await fetch(`${BACKEND_URL}/status`);
    
    if (!res.ok) {
      throw new Error(`Status check failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Status response:", data);

    if (data.status === "running") {
      status.innerText = "Please wait more...";
      return;
    }

    if (data.status === "done") {
      console.log("Fetching result:", `${BACKEND_URL}/result`);
      const out = await fetch(`${BACKEND_URL}/result`);
      
      if (!out.ok) {
        throw new Error(`Result fetch failed: ${out.status} ${out.statusText}`);
      }

      const blob = await out.blob();
      console.log("Result blob size:", blob.size);

      const url = URL.createObjectURL(blob);
      download.href = url;
      download.download = "output.svg";
      download.innerText = "Download Output";
      download.classList.remove("hidden");

      status.innerText = "Calculation completed ✔";

      jobRunning = false;
      toggleUI(false);
    } else if (data.status === "idle") {
      status.innerText = "No job running. Please start processing first.";
    }

  } catch (err) {
    status.innerText = "Error ❌";
    console.error("Get output error:", err);
    alert(err.message || "Failed to get output. Check console for details.");
  }
}

// -------------------- UI CONTROL --------------------

function toggleUI(disabled) {
  document.getElementById("startBtn").disabled = disabled;
  document.getElementById("imageInput").disabled = disabled;
  document.getElementById("param1").disabled = disabled;
  document.getElementById("param2").disabled = disabled;
}
