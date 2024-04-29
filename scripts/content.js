var DistractionSites = {
  setDefaultHosts() {
    chrome.storage.sync.set({
      distractionHosts: [
        "www.facebook.com",
        "www.twitter.com",
        "www.instagram.com",
        "www.linkedin.com",
        "www.snapchat.com",
        "www.pinterest.com",
        "www.youtube.com",
        "www.tiktok.com",
        "www.reddit.com",
        "www.tumblr.com",
        "www.whatsapp.com",
      ],
    });
  },
  getHosts: async () => {
    const { distractionHosts } = await chrome.storage.sync.get(
      "distractionHosts"
    );
    return distractionHosts;
  },
  addHosts: async (hosts) => {
    const distractionSiteHosts = await DistractionSites.getHosts();
    distractionSiteHosts.push(hosts);
    return chrome.storage.sync.set({
      distractionHosts: distractionSiteHosts.flat(),
    });
  },
  getUserConfiguredHosts: async () => {
    const fileLocation = await chrome.runtime.getURL(
      "../data/user.config.json"
    );
    const response = await fetch(fileLocation);
    const { distractionHosts } = await response.json();
    return distractionHosts;
  },
};

var FocusMode = {
  toggleState(state) {
    return chrome.storage.sync.set({ focusMode: state });
  },
  setReason(reason) {
    return chrome.storage.sync.set({ focusReason: reason });
  },
  getState: async () => {
    const { focusMode } = await chrome.storage.sync.get("focusMode");
    return focusMode;
  },
};

var Actions = {
  enableFocusMode: async (reason) => {
    await FocusMode.toggleState(true);
    await FocusMode.setReason(reason);
    Actions.checkUserPriority();
  },
  disableFocusMode: async () => {
    await FocusMode.toggleState(false);
    await FocusMode.setReason("");
    Actions.checkUserPriority();
  },
  toggleFocusMode() {
    const isFocusModeEnabled = FocusMode.getState();
    if (isFocusModeEnabled) {
      Actions.disableFocusMode();
    } else {
      const reason = prompt("What is your commitment to focus?");
      Actions.enableFocusMode(reason);
    }
  },
  redirectToFocusPage: async () => {
    const redirectUrl = await chrome.runtime.getURL(
      "../pages/DefaultRedirect.html"
    );
    location.replace(redirectUrl);
  },
  checkUserPriority: async (changes, namespace) => {
    console.log("checkUserPriority changes", changes, namespace);
    const isFocusModeEnabled = await FocusMode.getState();
    if (isFocusModeEnabled) {
      const distractionHosts = await DistractionSites.getHosts();
      const currentHost = window.location.host;
      if (distractionHosts.includes(currentHost)) {
        const { focusReason } = await chrome.storage.sync.get("focusReason");
        alert(focusReason);
        window.history.back();
      }
    }
  },
};

async function setup() {
  await DistractionSites.setDefaultHosts();
  const configHosts = await DistractionSites.getUserConfiguredHosts();
  await DistractionSites.addHosts(configHosts);

  Actions.enableFocusMode("Say this outlout: I get to focus on [reason]");
}

setup();
