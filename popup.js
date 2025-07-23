// WordPress Action Recorder - Popup Script
document.addEventListener('DOMContentLoaded', function() {
    loadStatus();
    setupEventListeners();
});

function viewAllSessions() {
    // Mở trang mới để xem tất cả sessions
    chrome.tabs.create({
        url: chrome.runtime.getURL('sessions.html')
    });
}

function openSettings() {
    // Mở trang settings
    chrome.tabs.create({
        url: chrome.runtime.getURL('settings.html')
    });
}

function showHelp() {
    const helpWindow = window.open('', 'Help', 'width=600,height=500,scrollbars=yes');
    helpWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WordPress Action Recorder - Hướng dẫn</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                h1, h2 { color: #0073aa; }
                .step { background: #f0f6fc; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #0073aa; }
                .warning { background: #fff3cd; border-left-color: #856404; color: #856404; }
                .tip { background: #d1ecf1; border-left-color: #0c5460; color: #0c5460; }
                code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>🎬 WordPress Action Recorder - Hướng dẫn sử dụng</h1>
            
            <h2>📋 Tổng quan</h2>
            <p>Extension này giúp bạn ghi lại tất cả các hành động trên WordPress Admin và tạo ra script automation để tự động hóa các tác vụ lặp đi lặp lại.</p>
            
            <h2>🚀 Cách sử dụng</h2>
            
            <div class="step">
                <h3>Bước 1: Chuẩn bị</h3>
                <p>• Mở WordPress Admin trong trình duyệt</p>
                <p>• Đảm bảo extension đã được kích hoạt</p>
                <p>• Panel recorder sẽ tự động xuất hiện ở góc phải màn hình</p>
            </div>
            
            <div class="step">
                <h3>Bước 2: Bắt đầu ghi</h3>
                <p>• Click nút "🔴 Bắt đầu ghi" trên panel hoặc popup</p>
                <p>• Thực hiện các thao tác bạn muốn tự động hóa</p>
                <p>• Extension sẽ ghi lại mọi hành động: click, nhập liệu, submit form, chuyển trang...</p>
            </div>
            
            <div class="step">
                <h3>Bước 3: Kết thúc và Export</h3>
                <p>• Click "⏹️ Dừng ghi" khi hoàn tất</p>
                <p>• Chọn "📤 Export JSON" để lưu dữ liệu backup</p>
                <p>• Chọn "📜 Export Script" để tạo automation script</p>
            </div>
            
            <div class="step">
                <h3>Bước 4: Sử dụng Automation Script</h3>
                <p>• Mở WordPress Admin</p>
                <p>• Mở Developer Console (F12)</p>
                <p>• Copy và paste script đã export</p>
                <p>• Script sẽ tự động chạy với control panel</p>
            </div>
            
            <h2>⚙️ Các hành động được ghi lại</h2>
            <ul>
                <li><strong>Click:</strong> Button, link, checkbox, radio...</li>
                <li><strong>Input:</strong> Text field, textarea, select...</li>
                <li><strong>Form Submit:</strong> Tất cả form submissions</li>
                <li><strong>Page Navigation:</strong> Chuyển trang trong admin</li>
                <li><strong>AJAX Requests:</strong> Các request bất đồng bộ</li>
            </ul>
            
            <div class="warning">
                <h3>⚠️ Lưu ý quan trọng</h3>
                <p>• Chỉ hoạt động trên trang WordPress Admin (/wp-admin/)</p>
                <p>• Không ghi lại password và thông tin nhạy cảm</p>
                <p>• Script automation cần được test kỹ trước khi sử dụng</p>
                <p>• Luôn backup dữ liệu trước khi chạy automation</p>
            </div>
            
            <div class="tip">
                <h3>💡 Tips sử dụng hiệu quả</h3>
                <p>• Thực hiện thao tác chậm và rõ ràng khi ghi</p>
                <p>• Tránh click quá nhanh hoặc nhiều thao tác cùng lúc</p>
                <p>• Export JSON định kỳ để backup</p>
                <p>• Sử dụng "👁️ Xem chi tiết" để kiểm tra dữ liệu đã ghi</p>
                <p>• Test automation trên site staging trước</p>
            </div>
            
            <h2>🔧 Troubleshooting</h2>
            <h3>Extension không hoạt động?</h3>
            <p>• Reload trang WordPress Admin</p>
            <p>• Kiểm tra console browser có lỗi không</p>
            <p>• Đảm bảo đang ở trang /wp-admin/</p>
            
            <h3>Automation script không chạy?</h3>
            <p>• Kiểm tra console có lỗi JavaScript không</p>
            <p>• Đảm bảo các element vẫn tồn tại trên trang</p>
            <p>• Thử tăng thời gian delay giữa các action</p>
            
            <h2>📞 Hỗ trợ</h2>
            <p>Nếu gặp vấn đề, vui lòng:</p>
            <p>• Kiểm tra console browser để xem lỗi</p>
            <p>• Export JSON để phân tích dữ liệu</p>
            <p>• Thử ghi lại với các thao tác đơn giản hơn</p>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <strong>WordPress Action Recorder v1.0</strong><br>
                Tạo automation script từ hành động thực tế
            </div>
        </body>
        </html>
    `);
}

function getPageNameFromUrl(url) {
    if (url.includes('post-new.php')) return 'Thêm bài viết mới';
    if (url.includes('post.php')) return 'Chỉnh sửa bài viết';
    if (url.includes('edit.php')) return 'Danh sách bài viết';
    if (url.includes('upload.php')) return 'Thư viện Media';
    if (url.includes('users.php')) return 'Quản lý Users';
    if (url.includes('plugins.php')) return 'Plugins';
    if (url.includes('themes.php')) return 'Themes';
    if (url.includes('options-general.php')) return 'Cài đặt chung';
    if (url.includes('index.php') || url.includes('dashboard')) return 'Dashboard';
    return 'Trang khác';
}

function showNotification(message, type) {
    // Simple notification trong popup
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

function setupEventListeners() {
    document.getElementById('toggle-recording').addEventListener('click', toggleRecording);
    document.getElementById('clear-session').addEventListener('click', clearCurrentSession);
    document.getElementById('export-json').addEventListener('click', exportCurrentJSON);
    document.getElementById('export-script').addEventListener('click', exportCurrentScript);
    document.getElementById('view-sessions').addEventListener('click', viewAllSessions);
    document.getElementById('open-settings').addEventListener('click', openSettings);
    document.getElementById('help').addEventListener('click', showHelp);
}

function loadStatus() {
    // Lấy trạng thái từ storage
    chrome.storage.local.get(['recording_state'], function(result) {
        const state = result.recording_state;
        
        if (state) {
            updateUI(state);
            loadSessionData(state.sessionId);
        } else {
            updateUI({
                isRecording: false,
                sessionId: 'Chưa có',
                stepCounter: 0
            });
        }
    });
    
    // Lấy thông tin tab hiện tại
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        const url = tab.url;
        
        if (url.includes('/wp-admin/')) {
            document.getElementById('current-page').textContent = getPageNameFromUrl(url);
        } else {
            document.getElementById('current-page').textContent = 'Không phải trang WP Admin';
        }
    });
}

function updateUI(state) {
    const statusEl = document.getElementById('recording-status');
    const toggleBtn = document.getElementById('toggle-recording');
    
    if (state.isRecording) {
        statusEl.textContent = 'Đang ghi';
        statusEl.className = 'status-value status-recording';
        toggleBtn.textContent = 'Dừng ghi';
        toggleBtn.className = 'btn btn-danger';
    } else {
        statusEl.textContent = 'Đã dừng';
        statusEl.className = 'status-value status-stopped';
        toggleBtn.textContent = 'Bắt đầu ghi';
        toggleBtn.className = 'btn btn-primary';
    }
    
    document.getElementById('session-id').textContent = state.sessionId;
    document.getElementById('total-steps').textContent = state.stepCounter || 0;
}

function loadSessionData(sessionId) {
    if (!sessionId || sessionId === 'Chưa có') return;
    
    chrome.storage.local.get([`actions_${sessionId}`], function(result) {
        const actions = result[`actions_${sessionId}`];
        if (actions) {
            document.getElementById('total-steps').textContent = actions.length;
        }
    });
}

function toggleRecording() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        
        if (!tab.url.includes('/wp-admin/')) {
            alert('Vui lòng mở trang WordPress Admin trước khi ghi!');
            return;
        }
        
        // Gửi message đến content script
        chrome.tabs.sendMessage(tab.id, {
            action: 'toggle_recording'
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.log('Content script chưa được load');
                // Reload tab và thử lại
                chrome.tabs.reload(tab.id, function() {
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'toggle_recording'
                        });
                    }, 1000);
                });
            } else {
                // Reload trạng thái
                setTimeout(loadStatus, 500);
            }
        });
    });
}

function clearCurrentSession() {
    if (!confirm('Bạn có chắc muốn xóa session hiện tại?')) {
        return;
    }
    
    chrome.storage.local.get(['recording_state'], function(result) {
        const state = result.recording_state;
        
        if (state && state.sessionId) {
            // Xóa dữ liệu session
            chrome.storage.local.remove([`actions_${state.sessionId}`]);
            
            // Reset trạng thái
            chrome.storage.local.set({
                'recording_state': {
                    isRecording: false,
                    sessionId: Date.now(),
                    stepCounter: 0
                }
            });
            
            // Gửi message đến content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'clear_session'
                });
            });
            
            setTimeout(loadStatus, 300);
            showNotification('Đã xóa session hiện tại', 'success');
        }
    });
}

function exportCurrentJSON() {
    chrome.storage.local.get(['recording_state'], function(result) {
        const state = result.recording_state;
        
        if (!state || !state.sessionId) {
            alert('Không có session nào để export!');
            return;
        }
        
        chrome.storage.local.get([`actions_${state.sessionId}`], function(result) {
            const actions = result[`actions_${state.sessionId}`];
            
            if (!actions || actions.length === 0) {
                alert('Session không có dữ liệu để export!');
                return;
            }
            
            const exportData = {
                sessionId: state.sessionId,
                exportDate: new Date().toISOString(),
                totalSteps: actions.length,
                actions: actions
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: `wp-actions-${state.sessionId}.json`
            });
            
            showNotification('Đã export JSON file', 'success');
        });
    });
}

function exportCurrentScript() {
    chrome.storage.local.get(['recording_state'], function(result) {
        const state = result.recording_state;
        
        if (!state || !state.sessionId) {
            alert('Không có session nào để export!');
            return;
        }
        
        chrome.storage.local.get([`actions_${state.sessionId}`], function(result) {
            const actions = result[`actions_${state.sessionId}`];
            
            if (!actions || actions.length === 0) {
                alert('Session không có dữ liệu để export!');
                return;
            }
            
            const script = generateAdvancedAutomationScript(actions, state.sessionId);
            
            const blob = new Blob([script], {
                type: 'text/javascript'
            });
            
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: `wp-automation-${state.sessionId}.js`
            });
            
            showNotification('Đã export automation script', 'success');
        });
    });
}

function generateAdvancedAutomationScript(actions, sessionId) {
    return `// WordPress Advanced Automation Script
// Generated: ${new Date().toISOString()}
// Session ID: ${sessionId}
// Total Actions: ${actions.length}
// 
// Cách sử dụng:
// 1. Mở WordPress Admin trong trình duyệt
// 2. Mở Developer Console (F12)
// 3. Copy và paste script này vào console
// 4. Script sẽ tự động chạy các hành động đã ghi

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        DEBUG: true,
        DELAY_BETWEEN_ACTIONS: 800, // ms
        TIMEOUT_FOR_ELEMENTS: 5000, // ms
        RETRY_ATTEMPTS: 3
    };
    
    // Action data
    const ACTIONS = ${JSON.stringify(actions, null, 4)};
    
    let currentActionIndex = 0;
    let isRunning = false;
    let isPaused = false;
    
    // Utility functions
    function log(message, type = 'info') {
        if (!CONFIG.DEBUG) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = \`[WP-Auto \${timestamp}]\`;
        
        switch(type) {
            case 'error':
                console.error(prefix, message);
                break;
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'success':
                console.log(\`%c\${prefix} \${message}\`, 'color: green; font-weight: bold');
                break;
            default:
                console.log(prefix, message);
        }
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function waitForElement(selector, timeout = CONFIG.TIMEOUT_FOR_ELEMENTS) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(\`Element not found: \${selector}\`));
            }, timeout);
        });
    }
    
    function findElement(elementInfo) {
        // Try multiple strategies to find element
        let element = null;
        
        // 1. Try by ID
        if (elementInfo.id) {
            element = document.getElementById(elementInfo.id);
            if (element) return element;
        }
        
        // 2. Try by selector
        if (elementInfo.selector) {
            element = document.querySelector(elementInfo.selector);
            if (element) return element;
        }
        
        // 3. Try by name
        if (elementInfo.name) {
            element = document.querySelector(\`[name="\${elementInfo.name}"]\`);
            if (element) return element;
        }
        
        // 4. Try by text content (for buttons, links)
        if (elementInfo.text && elementInfo.tagName) {
            const elements = document.querySelectorAll(elementInfo.tagName);
            for (let el of elements) {
                if (el.textContent.trim().includes(elementInfo.text.trim())) {
                    return el;
                }
            }
        }
        
        // 5. Try by class name (less reliable)
        if (elementInfo.className) {
            const className = elementInfo.className.split(' ')[0];
            element = document.querySelector(\`.\${className}\`);
            if (element) return element;
        }
        
        return null;
    }
    
    // Action executors
    async function executeClick(action) {
        log(\`Executing click on: \${action.element.selector || action.element.text}\`);
        
        const element = findElement(action.element);
        if (!element) {
            throw new Error(\`Click target not found: \${JSON.stringify(action.element)}\`);
        }
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(300);
        
        // Highlight element (optional)
        if (CONFIG.DEBUG) {
            element.style.outline = '3px solid red';
            setTimeout(() => element.style.outline = '', 1000);
        }
        
        // Trigger click
        element.click();
        
        // Wait for potential page changes
        await sleep(CONFIG.DELAY_BETWEEN_ACTIONS);
        
        log('Click executed successfully', 'success');
    }
    
    async function executeInput(action) {
        log(\`Executing input on: \${action.element.selector || action.element.name}\`);
        
        const element = findElement(action.element);
        if (!element) {
            throw new Error(\`Input element not found: \${JSON.stringify(action.element)}\`);
        }
        
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(200);
        
        // Focus and clear
        element.focus();
        element.value = '';
        
        // Type with realistic speed
        const text = action.value || '';
        for (let i = 0; i < text.length; i++) {
            element.value += text[i];
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(50); // Typing speed
        }
        
        // Trigger change event
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        log(\`Input completed: "\${text.substring(0, 30)}..."\`, 'success');
    }
    
    async function executeFormSubmit(action) {
        log(\`Executing form submit: \${action.form.selector}\`);
        
        const form = findElement(action.form);
        if (!form) {
            throw new Error(\`Form not found: \${JSON.stringify(action.form)}\`);
        }
        
        // Try to find submit button first
        const submitBtn = form.querySelector('input[type="submit"], button[type="submit"], .button-primary');
        
        if (submitBtn) {
            submitBtn.click();
            log('Form submitted via submit button', 'success');
        } else {
            form.submit();
            log('Form submitted directly', 'success');
        }
        
        // Wait longer for form submission
        await sleep(CONFIG.DELAY_BETWEEN_ACTIONS * 2);
    }
    
    async function executePageNavigation(action) {
        log(\`Navigating to: \${action.newUrl}\`);
        
        if (window.location.href === action.newUrl) {
            log('Already on target page', 'warn');
            return;
        }
        
        window.location.href = action.newUrl;
        
        // Wait for page load (this will interrupt execution, which is expected)
        await sleep(2000);
    }
    
    async function executeAjaxRequest(action) {
        log(\`AJAX request detected: \${action.method} \${action.url}\`);
        // For AJAX requests, we just wait and log
        // The actual request was already made when recording
        await sleep(CONFIG.DELAY_BETWEEN_ACTIONS);
    }
    
    // Main execution function
    async function executeAction(action) {
        if (isPaused) {
            log('Execution paused');
            return;
        }
        
        log(\`Step \${action.step}: \${action.type}\`);
        
        try {
            switch (action.type) {
                case 'click':
                    await executeClick(action);
                    break;
                case 'input_change':
                    await executeInput(action);
                    break;
                case 'form_submit':
                    await executeFormSubmit(action);
                    break;
                case 'page_navigation':
                    await executePageNavigation(action);
                    break;
                case 'ajax_request':
                    await executeAjaxRequest(action);
                    break;
                case 'session_start':
                case 'session_end':
                    log(\`Session marker: \${action.type}\`);
                    break;
                default:
                    log(\`Unknown action type: \${action.type}\`, 'warn');
            }
        } catch (error) {
            log(\`Error executing action: \${error.message}\`, 'error');
            throw error;
        }
    }
    
    // Control functions
    function createControlPanel() {
        // Remove existing panel
        const existing = document.getElementById('wp-automation-control');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.id = 'wp-automation-control';
        panel.innerHTML = \`
            <div style="position: fixed; top: 50px; left: 20px; background: white; border: 2px solid #0073aa; border-radius: 8px; padding: 15px; z-index: 9999; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 style="margin: 0 0 10px 0; color: #0073aa;">🤖 WordPress Automation</h3>
                <div style="margin-bottom: 10px;">
                    <strong>Progress:</strong> <span id="automation-progress">0 / \${ACTIONS.filter(a => !['session_start', 'session_end'].includes(a.type)).length}</span>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Status:</strong> <span id="automation-status">Ready</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="start-automation" style="background: #0073aa; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Start</button>
                    <button id="pause-automation" style="background: #f39c12; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;" disabled>Pause</button>
                    <button id="stop-automation" style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;" disabled>Stop</button>
                    <button id="close-panel" style="background: #7f8c8d; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            </div>
        \`;
        
        document.body.appendChild(panel);
        
        // Setup control events
        document.getElementById('start-automation').onclick = startAutomation;
        document.getElementById('pause-automation').onclick = pauseAutomation;
        document.getElementById('stop-automation').onclick = stopAutomation;
        document.getElementById('close-panel').onclick = () => panel.remove();
    }
    
    function updateProgress() {
        const progressEl = document.getElementById('automation-progress');
        const statusEl = document.getElementById('automation-status');
        
        if (progressEl) {
            const completed = currentActionIndex;
            const total = ACTIONS.filter(a => !['session_start', 'session_end'].includes(a.type)).length;
            progressEl.textContent = \`\${completed} / \${total}\`;
            
            if (statusEl) {
                if (isRunning && !isPaused) {
                    statusEl.textContent = 'Running...';
                    statusEl.style.color = '#27ae60';
                } else if (isPaused) {
                    statusEl.textContent = 'Paused';
                    statusEl.style.color = '#f39c12';
                } else if (completed >= total) {
                    statusEl.textContent = 'Completed';
                    statusEl.style.color = '#27ae60';
                } else {
                    statusEl.textContent = 'Stopped';
                    statusEl.style.color = '#e74c3c';
                }
            }
        }
    }
    
    async function startAutomation() {
        if (isRunning) return;
        
        isRunning = true;
        isPaused = false;
        
        document.getElementById('start-automation').disabled = true;
        document.getElementById('pause-automation').disabled = false;
        document.getElementById('stop-automation').disabled = false;
        
        log('Starting WordPress automation...', 'success');
        updateProgress();
        
        try {
            for (let i = currentActionIndex; i < ACTIONS.length; i++) {
                if (!isRunning || isPaused) break;
                
                const action = ACTIONS[i];
                currentActionIndex = i;
                
                // Skip session markers
                if (['session_start', 'session_end'].includes(action.type)) {
                    continue;
                }
                
                updateProgress();
                
                await executeAction(action);
                
                // Check if page changed (URL navigation)
                if (action.type === 'page_navigation') {
                    log('Page navigation detected. Automation will continue on new page.', 'warn');
                    // Store current progress for continuation
                    localStorage.setItem('wp_automation_progress', currentActionIndex + 1);
                    break;
                }
            }
            
            if (currentActionIndex >= ACTIONS.length - 1) {
                log('Automation completed successfully!', 'success');
                stopAutomation();
            }
            
        } catch (error) {
            log(\`Automation failed: \${error.message}\`, 'error');
            stopAutomation();
        }
    }
    
    function pauseAutomation() {
        isPaused = !isPaused;
        const btn = document.getElementById('pause-automation');
        
        if (isPaused) {
            btn.textContent = 'Resume';
            btn.style.background = '#27ae60';
            log('Automation paused', 'warn');
        } else {
            btn.textContent = 'Pause';
            btn.style.background = '#f39c12';
            log('Automation resumed', 'success');
            if (isRunning) startAutomation();
        }
        
        updateProgress();
    }
    
    function stopAutomation() {
        isRunning = false;
        isPaused = false;
        
        document.getElementById('start-automation').disabled = false;
        document.getElementById('pause-automation').disabled = true;
        document.getElementById('stop-automation').disabled = true;
        
        log('Automation stopped', 'warn');
        updateProgress();
        
        // Clear progress
        localStorage.removeItem('wp_automation_progress');
    }
    
    // Initialize automation
    function init() {
        log('WordPress Automation Script Loaded');
        log(\`Total actions to execute: \${ACTIONS.length}\`);
        
        // Check for saved progress (after page navigation)
        const savedProgress = localStorage.getItem('wp_automation_progress');
        if (savedProgress) {
            currentActionIndex = parseInt(savedProgress);
            log(\`Resuming from step \${currentActionIndex}\`);
        }
        
        createControlPanel();
        updateProgress();
        
        // Auto-start if continuing from page navigation
        if (savedProgress) {
            setTimeout(() => {
                log('Auto-resuming automation after page navigation...');
                startAutomation();
            }, 2000);
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Global control functions (accessible from console)
    window.wpAutomation = {
        start: startAutomation,
        pause: pauseAutomation,
        stop: stopAutomation,
        status: () => ({
            isRunning,
            isPaused,
            currentStep: currentActionIndex,
            totalSteps: ACTIONS.length
        }),
        config: CONFIG,
        actions: ACTIONS
    };
    
    log('Script ready! Use wpAutomation.start() to begin or use the control panel.');
    
})();

// Hướng dẫn sử dụng:
// 1. Script sẽ tự động tạo control panel ở góc trên bên trái
// 2. Click "Start" để bắt đầu automation
// 3. Có thể pause/resume bất cứ lúc nào
// 4. Script sẽ tự động tiếp tục sau khi chuyển trang
// 5. Sử dụng wpAutomation object trong console để điều khiển thủ công

console.log('%cWordPress Automation Script Ready!', 'color: blue; font-size: 16px; font-weight: bold');`
}    