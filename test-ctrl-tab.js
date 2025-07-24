(function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        const currentTab = tabs[0];
        chrome.tabs.query({currentWindow: true}, function(tabsAll) {
            const currentIndex = currentTab.index;
            const nextIndex = (currentIndex + 1) % tabsAll.length;
            chrome.tabs.update(tabsAll[nextIndex].id, {active: true});
        });
    });
})();