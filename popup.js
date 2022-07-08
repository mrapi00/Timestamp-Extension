// Will serve as the popup when user clicks on the Extension icon
import { activeTabURL } from "./utils.js";

// function for adding a new timestamp
const addNewTimestamp = (timestamps, timestamp) => {
  const timestampTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newTimestampElement = document.createElement("div");

  timestampTitleElement.textContent = timestamp.desc;
  timestampTitleElement.className = "timestamp-title";
  controlsElement.className = "timestamp-controls";

  setTimestampAttributes("play", onPlay, controlsElement);
  setTimestampAttributes("delete", onDelete, controlsElement);

  newTimestampElement.id = "timestamp-" + timestamp.time;
  newTimestampElement.className = "timestamp";
  newTimestampElement.setAttribute("timestamp", timestamp.time);

  newTimestampElement.appendChild(timestampTitleElement);
  newTimestampElement.appendChild(controlsElement);
  timestamps.appendChild(newTimestampElement);
};

// utility function
const setTimestampAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");
  // add png images for control functions
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// function for displaying timestamp into HTML
const viewTimestamps = (currentTimestamps=[]) => {
  const timestampsElement = document.getElementById("timestamps");
  timestampsElement.innerHTML = "";

  if (currentTimestamps.length > 0) {
    // add all timestamps to a list
    for (let i = 0; i < currentTimestamps.length; i++) {
      const timestamp = currentTimestamps[i];
      addNewTimestamp(timestampsElement, timestamp);
    }
  } else {
    // create a default message if no timestamps
    timestampsElement.innerHTML = '<i class="row">No timestamps saved yet.</i>';
  }

};

// call onPlay when user clicks on the "play" icon, to the specified timestamp
const onPlay = async e => {
  const timestampTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await activeTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: timestampTime,
  });
};

// delete the timestamp that user chooses using "delete" icon
const onDelete = async e => {
  const activeTab = await activeTabURL();
  const timestampTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const timestampElementToDelete = document.getElementById(
    "timestamp-" + timestampTime
  );

  timestampElementToDelete.parentNode.removeChild(timestampElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: timestampTime,
  }, viewTimestamps);
};

// ensure that the webpage is a YouTube page, otherwise extension not available for use
document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await activeTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoTimestamps = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewTimestamps(currentVideoTimestamps);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">Not able to save Video Timestamps for this page.</div>';
  }
});

