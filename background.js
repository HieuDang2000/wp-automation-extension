// WordPress Action Recorder - Background Service Worker
chrome.runtime.onInstalled.addListener(function() {
    console.log('WordPress Action Recorder installed');
    
    // Tạo context menu
    chrome.contextMenus.create({
        id: "wp-recorder-toggle",
        title: "Toggle Recording",
        contexts: ["page"]
    });
    
    chrome.contextMenus.create({
        id: "wp-recorder-export",
        title: "Export Current Session",
        contexts: ["page"]
    });
});

// Xử lý context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch(info.menuItemId) {
        case "wp-recorder-toggle":
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggle_recording'
            });
            break;
            
        case "wp-recorder-export":
            chrome.tabs.sendMessage(tab.id, {
                action: 'export_session'
            });
            break;
    }
});

// Xử lý messages từ content script và popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'get_recording_state') {
        chrome.storage.local.get(['recording_state'], (result) => {
            sendResponse(result.recording_state || {
                isRecording: false,
                sessionId: null,
                stepCounter: 0
            });
        });
        return true; // Async response
    }
    
    if (request.action === 'save_recording_state') {
        chrome.storage.local.set({
            'recording_state': request.state
        });
        sendResponse({success: true});
    }
    
    if (request.action === 'notification') {
        // Có thể thêm notifications API ở đây
        console.log('Notification:', request.message);
    }
});

// Cleanup khi tab đóng
chrome.tabs.onRemoved.addListener((tabId) => {
    // Có thể cleanup session data nếu cần
    console.log('Tab closed:', tabId);
});

// Inject content script on all pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Inject content script nếu chưa có
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(() => {
            // Script đã được inject rồi hoặc có lỗi
        });
        
        chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['recorder.css']
        }).catch(() => {
            // CSS đã được inject rồi hoặc có lỗi
        });
    }
});