let BACKEND_URL = "";

// Load saved URL on page load
window.onload = () => {
  const savedUrl = localStorage.getItem("BACKEND_URL");
  if (savedUrl) {
    BACKEND_URL = savedUrl;
    document.getElementById("backendUrlInput").value = savedUrl;
  }
};

function saveBackendUrl() {
  const url = document.getElementById("backendUrlInput").value.trim();

  if (!url.startsWith("http")) {
    alert("Please enter a valid URL starting with http or https");
    return;
  }

  BACKEND_URL = url.replace(/\/$/, ""); // remove trailing slash
  localStorage.setItem("BACKEND_URL", BACKEND_URL);

  alert("Backend URL saved ✔");
}

async function run() {
  if (!BACKEND_URL) {
    alert("Please enter and save the Backend URL first");
    return;
  }

  const image = document.getElementById("imageInput").files[0];
  const p1 = document.getElementById("param1").value;
  const p2 = document.getElementById("param2").value;
  const status = document.getElementById("status");
  const download = document.getElementById("downloadLink");
  const button = document.getElementById("runBtn");

  if (!image) {
    alert("Please upload an image");
    return;
  }

  button.disabled = true;
  status.innerText = "Processing… please wait";
  download.classList.add("hidden");

  const formData = new FormData();
  formData.append("image", image);
  formData.append("x", p1);
  formData.append("y", p2);

  try {
    const response = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      body: formData,
      headers: {
        "X-Auth-Token": "MEETING_SECRET" // optional
      }
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    download.href = url;
    download.download = "output.svg";
    download.innerText = "Download Output";
    download.classList.remove("hidden");

    status.innerText = "Done ✔";
  } catch (err) {
    status.innerText = "Error ❌";
    alert(err.message);
  } finally {
    button.disabled = false;
  }
}
