export async function activeTabURL() {
    // use Chrome Tabs API to retrieve current URL
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

