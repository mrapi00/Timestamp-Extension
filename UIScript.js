(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoTimestamps = [];

  // function which uses chrome Storage API, retrieve timestamps for current video that user has saved
  const fetchTimestamps = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  // adds in the timestamp to Storage
  const addNewTimestampEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newTimestamp = {
      time: currentTime,
      desc: "Timestamp at " + getTime(currentTime),
    };

    currentVideoTimestamps = await fetchTimestamps();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoTimestamps, newTimestamp].sort((a, b) => a.time - b.time))
    });
  };

  // on load of a youtube video, add in UI for timestamping
  const newVideoLoaded = async () => {
    const timestampBtnExists = document.getElementsByClassName("timestamp-btn")[0];

    currentVideoTimestamps = await fetchTimestamps();

    if (!timestampBtnExists) {
      const timestampBtn = document.createElement("img");

      timestampBtn.src = chrome.runtime.getURL("assets/timestamp.png");
      timestampBtn.className = "ytp-button " + "timestamp-btn";
      timestampBtn.title = "Click to timestamp current time";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      youtubeLeftControls.appendChild(timestampBtn);
      timestampBtn.addEventListener("click", addNewTimestampEventHandler);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") { // load new video with new videoID
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") { // set YouTube video's current time to the played time
      youtubePlayer.currentTime = value;
    } else if ( type === "DELETE") {// delete timestamp from list of saved timestamps
      currentVideoTimestamps = currentVideoTimestamps.filter((timestamps) => timestamps.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoTimestamps) });

      response(currentVideoTimestamps);
    }
  });

  newVideoLoaded();
})();

// utility function for converting time to formatted string
const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
