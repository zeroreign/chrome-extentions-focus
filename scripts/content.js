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
  addHost(host) {
    const distractionSiteHosts = Distractions.getHosts();
    distractionSiteHosts.push(host);
    chrome.storage.sync.set({ distractionSitesHosts: distractionSiteHosts });
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
  enableFocusMode(reason) {
    return new Promise((resolve, reject) => {
      FocusMode.toggleState(true);
      FocusMode.setReason(reason);
    });
  },
  disableFocusMode() {
    return new Promoise((resolve, reject) => {
      FocusMode.toggleState(false);
      FocusMode.setReason("");
    });
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

DistractionSites.setDefaultHosts();
chrome.storage.onChanged.addListener(Actions.checkUserPriority);

const isFocusModeEnabled = chrome.storage.sync.get(
  "focusMode",
  Actions.checkUserPriority
);

if (!isFocusModeEnabled) {
  Promise.all([Actions.enableFocusMode("Say this outlout: I get to focus on [reason]")]);
}
