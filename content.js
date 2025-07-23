// WordPress Action Recorder - Content Script
(function() {
    'use strict';
    
    let isRecording = false;
    let actionSequence = [];
    let sessionId = Date.now();
    let stepCounter = 0;
    
    // Khởi tạo khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRecorder);
    } else {
        initRecorder();
    }
    
    function initRecorder() {
        // Kiểm tra xem có phải trang WordPress Admin không
        if (!isWordPressAdmin()) return;
        
        createRecorderUI();
        setupEventListeners();
        loadRecordingState();
    }
    
    function isWordPressAdmin() {
        return true;
    }
    
    // Tạo giao diện recorder
    function createRecorderUI() {
        const recorderPanel = document.createElement('div');
        recorderPanel.id = 'wp-action-recorder';
        recorderPanel.innerHTML = `
            <div class="recorder-header">
                <h3>🎬 Action Recorder</h3>
                <button id="minimize-recorder">−</button>
            </div>
            <div class="recorder-content">
                <div class="recorder-controls">
                    <button id="start-recording" class="btn-record">🔴 Bắt đầu ghi</button>
                    <button id="stop-recording" class="btn-stop" style="display:none">⏹️ Dừng ghi</button>
                    <button id="pause-recording" class="btn-pause" style="display:none">⏸️ Tạm dừng</button>
                </div>
                
                <div class="recording-info">
                    <div class="info-item">
                        <span>Trạng thái:</span>
                        <span id="recording-status">Đã dừng</span>
                    </div>
                    <div class="info-item">
                        <span>Số bước:</span>
                        <span id="step-count">0</span>
                    </div>
                    <div class="info-item">
                        <span>Trang hiện tại:</span>
                        <span id="current-page">${getCurrentPageName()}</span>
                    </div>
                </div>
                
                <div class="action-list">
                    <h4>Hành động đã ghi:</h4>
                    <div id="action-log"></div>
                </div>
                
                <div class="recorder-actions">
                    <button id="clear-actions" class="btn-clear">🗑️ Xóa tất cả</button>
                    <button id="export-actions" class="btn-export">📤 Export JSON</button>
                    <button id="export-script" class="btn-export">📜 Export Script</button>
                    <button id="view-details" class="btn-view">👁️ Xem chi tiết</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(recorderPanel);
        
        // Xử lý minimize/maximize
        document.getElementById('minimize-recorder').addEventListener('click', function() {
            const content = document.querySelector('.recorder-content');
            const btn = this;
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                btn.textContent = '−';
            } else {
                content.style.display = 'none';
                btn.textContent = '+';
            }
        });
        
        // Xử lý các nút điều khiển
        setupRecorderControls();
    }
    
    function setupRecorderControls() {
        document.getElementById('start-recording').addEventListener('click', startRecording);
        document.getElementById('stop-recording').addEventListener('click', stopRecording);
        document.getElementById('pause-recording').addEventListener('click', pauseRecording);
        document.getElementById('clear-actions').addEventListener('click', clearActions);
        document.getElementById('export-actions').addEventListener('click', exportAsJSON);
        document.getElementById('export-script').addEventListener('click', exportAsScript);
        document.getElementById('view-details').addEventListener('click', viewDetails);
    }
    
    function startRecording() {
        isRecording = true;
        stepCounter = 0;
        actionSequence = [];
        sessionId = Date.now();
        
        updateRecordingStatus('Đang ghi...', 'recording');
        saveRecordingState();
        
        // Thêm action đầu tiên
        recordAction({
            type: 'session_start',
            timestamp: Date.now(),
            url: window.location.href,
            page: getCurrentPageName(),
            title: document.title
        });
        
        showNotification('Bắt đầu ghi lại hành động...', 'success');
    }
    
    function stopRecording() {
        isRecording = false;
        
        // Ghi action kết thúc
        recordAction({
            type: 'session_end',
            timestamp: Date.now()
        });
        
        updateRecordingStatus('Đã dừng', 'stopped');
        saveRecordingState();
        
        showNotification(`Đã dừng ghi. Tổng cộng ${stepCounter} bước.`, 'info');
    }
    
    function pauseRecording() {
        isRecording = false;
        updateRecordingStatus('Tạm dừng', 'paused');
        saveRecordingState();
        
        showNotification('Đã tạm dừng ghi', 'warning');
    }
    
    // Ghi lại hành động
    function recordAction(action) {
        if (!isRecording && action.type !== 'session_start' && action.type !== 'session_end') {
            return;
        }
        
        const currentTime = Date.now();
        const actionData = {
            step: ++stepCounter,
            sessionId: sessionId,
            timestamp: currentTime,
            url: window.location.href,
            page: getCurrentPageName(),
            ...action
        };
        
        // Calculate time since last action
        if (actionSequence.length > 0) {
            const lastAction = actionSequence[actionSequence.length - 1];
            actionData.timeSincePrevious = currentTime - lastAction.timestamp;
        } else {
            actionData.timeSincePrevious = 0;
        }
        
        actionSequence.push(actionData);
        updateActionLog(actionData);
        updateStepCount();
        
        // Lưu vào storage
        saveActions();
        
        // Lưu trạng thái recording sau mỗi 5 hành động hoặc với các hành động quan trọng
        if (stepCounter % 5 === 0 || 
            action.type === 'page_navigation' || 
            action.type === 'form_submit' ||
            action.type === 'select_change') {
            saveRecordingState();
        }
    }
    
    // Thiết lập event listeners để bắt các hành động
    function setupEventListeners() {
        // Bắt click events
        document.addEventListener('click', function(e) {
            if (!isRecording) return;
            
            const element = e.target;
            const actionData = {
                type: 'click',
                element: getElementInfo(element),
                coordinates: { x: e.clientX, y: e.clientY }
            };
            
            // Xử lý đặc biệt cho Bootstrap Select
            const bootstrapSelect = element.closest('.bootstrap-select');
            if (bootstrapSelect) {
                // Kiểm tra xem đây là click vào dropdown button hay option
                if (element.closest('.dropdown-toggle')) {
                    actionData.bootstrapSelectAction = 'toggle';
                    actionData.selectId = bootstrapSelect.querySelector('select')?.id;
                } else if (element.closest('li') || element.closest('.dropdown-menu')) {
                    const li = element.closest('li') || element.closest('a')?.parentElement;
                    if (li) {
                        actionData.bootstrapSelectAction = 'select';
                        actionData.selectId = bootstrapSelect.querySelector('select')?.id;
                        actionData.optionIndex = li.getAttribute('data-original-index');
                        actionData.optionValue = li.querySelector('a')?.getAttribute('data-tokens') || 
                                                li.querySelector('.text')?.textContent.trim();
                        actionData.optionText = li.querySelector('.text')?.textContent.trim();
                    }
                }
            }
            
            recordAction(actionData);
        }, true);
        
        // Bắt form submissions
        document.addEventListener('submit', function(e) {
            if (!isRecording) return;
            
            const form = e.target;
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            recordAction({
                type: 'form_submit',
                form: getElementInfo(form),
                data: data
            });
        }, true);
        
        // Bắt input changes (cho text fields quan trọng)
        document.addEventListener('input', function(e) {
            if (!isRecording) return;
            
            const element = e.target;
            if (isImportantInput(element)) {
                recordAction({
                    type: 'input_change',
                    element: getElementInfo(element),
                    value: element.value,
                    valueLength: element.value.length
                });
            }
        });
        
        // Bắt page navigation
        let currentUrl = window.location.href;
        let lastStepCounter = stepCounter; // Lưu giá trị stepCounter hiện tại
        
        // Tạo MutationObserver với cấu hình tốt hơn để theo dõi DOM thay đổi
        const observer = new MutationObserver(function(mutations) {
            // Kiểm tra URL thay đổi
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                
                if (isRecording) {
                    recordAction({
                        type: 'page_navigation',
                        newUrl: currentUrl,
                        newPage: getCurrentPageName()
                    });
                }
                
                // Cập nhật UI
                const currentPageEl = document.getElementById('current-page');
                if (currentPageEl) {
                    currentPageEl.textContent = getCurrentPageName();
                }
            }
            
            // Khôi phục stepCounter nếu bị reset do DOM thay đổi
            if (isRecording && stepCounter < lastStepCounter) {
                console.log('Phát hiện stepCounter bị reset:', stepCounter, 'khôi phục về', lastStepCounter);
                stepCounter = lastStepCounter;
                updateStepCount();
            } else if (isRecording) {
                // Cập nhật giá trị lastStepCounter
                lastStepCounter = stepCounter;
            }
        });
        
        // Cấu hình MutationObserver tốt hơn
        observer.observe(document, { 
            subtree: true, 
            childList: true,
            attributes: false, // Không theo dõi thay đổi thuộc tính để tránh quá nhiều sự kiện
            characterData: false // Không theo dõi thay đổi nội dung text
        });
        
        // Thêm sự kiện cho select dropdowns để theo dõi riêng
        document.addEventListener('change', function(e) {
            if (!isRecording) return;
            
            const element = e.target;
            if (element.tagName === 'SELECT') {
                recordAction({
                    type: 'select_change',
                    element: getElementInfo(element),
                    selectedIndex: element.selectedIndex,
                    selectedValue: element.options[element.selectedIndex]?.value,
                    selectedText: element.options[element.selectedIndex]?.text
                });
            }
        });
        
        // Bắt AJAX requests (WordPress specific)
        interceptAjaxRequests();
    }
    
    // Lấy thông tin chi tiết của element
    function getElementInfo(element) {
        const info = {
            tagName: element.tagName,
            id: element.id || null,
            className: element.className || null,
            text: element.textContent?.trim().substring(0, 50) || null,
            value: element.value || null,
            name: element.name || null,
            type: element.type || null,
            href: element.href || null
        };
        
        // Thêm selector để có thể tìm lại element
        info.selector = generateSelector(element);
        
        // Thêm path của class names từ element đến body
        info.classPath = generateClassPath(element);
        
        // Lưu tất cả data attributes
        const dataAttributes = {};
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-')) {
                dataAttributes[attr.name] = attr.value;
            }
        }
        
        if (Object.keys(dataAttributes).length > 0) {
            info.dataAttributes = dataAttributes;
        }
        
        // Thêm thông tin đặc biệt cho list items và dropdown options
        if (element.tagName === 'LI' || element.tagName === 'OPTION' || 
            element.closest('li') || element.parentElement?.tagName === 'LI') {
            
            // Lưu index trong danh sách cha
            const parentList = element.tagName === 'LI' ? element.parentElement : 
                              element.closest('li') ? element.closest('li').parentElement : 
                              element.parentElement?.tagName === 'LI' ? element.parentElement.parentElement : 
                              element.parentElement;
            
            if (parentList) {
                const items = Array.from(parentList.children);
                info.listIndex = items.indexOf(element.tagName === 'LI' ? element : 
                                              element.closest('li') || element.parentElement);
                info.originalIndex = info.listIndex;
                
                // Lưu thêm text content của parent nếu có
                if (parentList.id) {
                    info.parentListId = parentList.id;
                }
            }
        }
        
        // Thêm thông tin cho các dropdown select
        if (element.tagName === 'SELECT') {
            info.selectedIndex = element.selectedIndex;
            if (element.options[element.selectedIndex]) {
                info.selectedValue = element.options[element.selectedIndex].value;
                info.selectedText = element.options[element.selectedIndex].text;
            }
        }
        
        // Thêm thông tin về vị trí tọa độ
        const rect = element.getBoundingClientRect();
        info.position = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
        };
        
        return info;
    }
    
    // Tạo CSS selector cho element
    function generateSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        let selector = element.tagName.toLowerCase();
        
        // Thêm data-* attributes nếu có (tối đa 2 để tránh selector quá phức tạp)
        const dataAttrs = [];
        let dataAttrCount = 0;
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-') && dataAttrCount < 2) {
                // Escape quotes in attribute values
                const safeValue = attr.value.replace(/"/g, '\\"');
                dataAttrs.push(`[${attr.name}="${safeValue}"]`);
                dataAttrCount++;
            }
        }
        
        if (dataAttrs.length > 0) {
            selector += dataAttrs.join('');
        }
        
        if (element.className) {
            // Lấy tối đa 2 class để tránh selector quá dài
            const classes = element.className.split(' ')
                .filter(c => c.trim())
                .slice(0, 2);
            
            if (classes.length > 0) {
                selector += '.' + classes.join('.');
            }
        }
        
        if (element.name) {
            selector += `[name="${element.name}"]`;
        }
        
        // Lưu thông tin text vào data attribute thay vì dùng :contains
        if ((element.tagName === 'BUTTON' || element.tagName === 'A') && element.textContent.trim()) {
            const buttonText = element.textContent.trim().substring(0, 20);
            element.setAttribute('data-text-content', buttonText);
            // Không thêm :contains vào selector nữa
        }
        
        // Lưu thông tin vị trí nhưng không đưa vào selector
        const parent = element.parentElement;
        if (parent) {
            // Lưu thêm thông tin về vị trí
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(element) + 1;
            element.setAttribute('data-recorder-index', index - 1);
            
            // Thêm data-index attribute cho list items
            if (element.tagName === 'LI' || parent.tagName === 'UL' || parent.tagName === 'OL') {
                element.setAttribute('data-original-index', index - 1);
            }
            
            // Thêm thông tin về parent để dễ dàng tìm lại
            if (parent.id) {
                element.setAttribute('data-parent-id', parent.id);
            } else if (parent.className) {
                element.setAttribute('data-parent-class', parent.className);
            }
        }
        
        return selector;
    }
    
    // Tạo class path từ element đến body
    function generateClassPath(element) {
        const path = [];
        let currentElement = element;
        
        while (currentElement && currentElement !== document.body) {
            path.push({
                tagName: currentElement.tagName,
                id: currentElement.id || null,
                classNames: currentElement.className ? 
                            currentElement.className.split(' ').filter(c => c.trim()) : 
                            null
            });
            
            currentElement = currentElement.parentElement;
        }
        
        return path;
    }

    // Kiểm tra input có quan trọng không
    function isImportantInput(element) {
        const importantNames = ['post_title', 'title', 'content', 'excerpt', 'user_login', 'user_email'];
        const importantIds = ['title', 'content', 'excerpt'];
        
        return importantNames.includes(element.name) || 
               importantIds.includes(element.id) ||
               element.classList.contains('wp-editor-area');
    }
    
    // Lấy tên trang hiện tại
    function getCurrentPageName() {
        const url = window.location.href;
        
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
    
    // Bắt AJAX requests
    function interceptAjaxRequests() {
        const originalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            xhr.open = function(method, url, ...args) {
                this._method = method;
                this._url = url;
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            xhr.send = function(data) {
                if (isRecording && this._url && this._url.includes('admin-ajax.php')) {
                    recordAction({
                        type: 'ajax_request',
                        method: this._method,
                        url: this._url,
                        data: data ? data.toString().substring(0, 200) : null
                    });
                }
                
                return originalSend.apply(this, [data]);
            };
            
            return xhr;
        };
    }
    
    // Cập nhật trạng thái ghi
    function updateRecordingStatus(status, className) {
        const statusEl = document.getElementById('recording-status');
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const pauseBtn = document.getElementById('pause-recording');
        
        statusEl.textContent = status;
        statusEl.className = `status-${className}`;
        
        if (className === 'recording') {
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'inline-block';
        } else {
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            pauseBtn.style.display = 'none';
        }
    }
    
    // Cập nhật log hành động
    function updateActionLog(action) {
        const logContainer = document.getElementById('action-log');
        const actionEl = document.createElement('div');
        actionEl.className = 'action-item';
        
        const time = new Date(action.timestamp).toLocaleTimeString();
        actionEl.innerHTML = `
            <span class="action-step">${action.step}</span>
            <span class="action-type">${getActionTypeLabel(action.type)}</span>
            <span class="action-details">${getActionDescription(action)}</span>
            <span class="action-time">${time}</span>
        `;
        
        logContainer.appendChild(actionEl);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    function getActionTypeLabel(type) {
        const labels = {
            'session_start': '🚀 Bắt đầu',
            'session_end': '🏁 Kết thúc',
            'click': '👆 Click',
            'input_change': '✏️ Nhập liệu',
            'form_submit': '📤 Submit form',
            'page_navigation': '🔄 Chuyển trang',
            'ajax_request': '🌐 AJAX'
        };
        
        return labels[type] || type;
    }
    
    function getActionDescription(action) {
        switch (action.type) {
            case 'click':
                return action.element.text || action.element.selector || 'Element';
            case 'input_change':
                return `${action.element.name || action.element.id} (${action.valueLength} ký tự)`;
            case 'form_submit':
                return `Form: ${action.form.id || action.form.selector}`;
            case 'page_navigation':
                return action.newPage;
            case 'ajax_request':
                return `${action.method} - ${action.url.split('?')[0]}`;
            default:
                return '';
        }
    }
    
    function updateStepCount() {
        document.getElementById('step-count').textContent = stepCounter;
    }
    
    // Xóa tất cả actions
    function clearActions() {
        if (confirm('Bạn có chắc muốn xóa tất cả hành động đã ghi?')) {
            actionSequence = [];
            stepCounter = 0;
            
            document.getElementById('action-log').innerHTML = '';
            updateStepCount();
            
            chrome.storage.local.remove([`actions_${sessionId}`]);
            showNotification('Đã xóa tất cả hành động', 'info');
        }
    }
    
    // Export as JSON
    function exportAsJSON() {
        const data = {
            sessionId: sessionId,
            recordingDate: new Date().toISOString(),
            totalSteps: stepCounter,
            actions: actionSequence
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `wp-actions-${sessionId}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification('Đã export JSON file', 'success');
    }
    
    // Export as automation script
    function exportAsScript() {
        const script = generateAutomationScript();
        const blob = new Blob([script], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `wp-automation-${sessionId}.js`;
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification('Đã export automation script', 'success');
    }
    
    // Tạo automation script từ actions đã ghi
    function generateAutomationScript() {
        // Filter out recorder control actions
        const filteredActions = actionSequence.filter(action => {
            // Skip session markers and recorder UI interactions
            return !(
                action.type === 'session_start' || 
                action.type === 'session_end' ||
                (action.type === 'click' && 
                 (action.element.id === 'start-recording' || 
                  action.element.id === 'stop-recording' || 
                  action.element.id === 'pause-recording' ||
                  action.element.selector === '#start-recording' || 
                  action.element.selector === '#stop-recording' || 
                  action.element.selector === '#pause-recording' ||
                  (action.element.text && 
                   (action.element.text.includes('Bắt đầu ghi') || 
                    action.element.text.includes('Dừng ghi') || 
                    action.element.text.includes('Tạm dừng')))
                 )
                )
            );
        });
        
        // Recalculate step numbers
        let stepCount = 0;
        const renumberedActions = filteredActions.map(action => {
            const newAction = {...action};
            if (newAction.type !== 'session_start' && newAction.type !== 'session_end') {
                newAction.step = ++stepCount;
            }
            return newAction;
        });
        
        // Create the script without using template literals for the entire content
        const scriptHeader = '// WordPress Automation Script - Generated on ' + new Date().toISOString() + '\n' +
                            '// Session ID: ' + sessionId + '\n' +
                            '// Total Steps: ' + stepCount + '\n\n' +
                            '(function() {\n' +
                            '    \'use strict\';\n\n' +
                            '    let currentStep = 0;\n' +
                            '    const actions = ' + JSON.stringify(renumberedActions, null, 4) + ';\n\n';
        
        const scriptFunctions = `    function executeAction(action) {
            console.log(\`Executing step \${action.step}: \${action.type}\`);
            
            switch (action.type) {
                case 'click':
                    return executeClick(action);
                case 'input_change':
                    return executeInput(action);
                case 'form_submit':
                    return executeSubmit(action);
                case 'page_navigation':
                    return executeNavigation(action);
                default:
                    console.log('Skipping action:', action.type);
                    return Promise.resolve();
            }
        }
        
        function executeClick(action) {
            return new Promise((resolve) => {
                const element = findElement(action.element);
                if (element) {
                    // Log class path if available
                    if (action.element.classPath) {
                        console.log('Class path from body:');
                        action.element.classPath.reverse().forEach((item, index) => {
                            let info = item.tagName;
                            if (item.id) info += '#' + item.id;
                            if (item.classNames) info += ' (' + item.classNames.join(' ') + ')';
                            console.log(index + ': ' + info);
                        });
                    }
                    
                    // Xử lý đặc biệt cho Bootstrap Select
                    if (action.bootstrapSelectAction === 'toggle') {
                        console.log('Bootstrap Select toggle:', action.selectId);
                        const selectElement = document.getElementById(action.selectId);
                        if (selectElement) {
                            // Tìm bootstrap-select container
                            const bootstrapSelect = selectElement.closest('.bootstrap-select');
                            let bsSelect = bootstrapSelect;
                            
                            if (!bsSelect) {
                                const selectWithId = document.querySelector('.bootstrap-select select#' + action.selectId);
                                if (selectWithId) {
                                    bsSelect = selectWithId.closest('.bootstrap-select');
                                }
                            }
                            
                            if (bsSelect) {
                                const toggleButton = bsSelect.querySelector('.dropdown-toggle');
                                if (toggleButton) {
                                    toggleButton.click();
                                    console.log('Clicked dropdown toggle for select:', action.selectId);
                                }
                            } else {
                                // Fallback to direct select click
                                selectElement.click();
                            }
                        } else {
                            // Fallback to normal click
                            element.click();
                        }
                    } else if (action.bootstrapSelectAction === 'select') {
                        console.log('Bootstrap Select option:', action.optionIndex, action.optionText);
                        
                        // Tìm select element
                        const selectElement = document.getElementById(action.selectId);
                        if (selectElement) {
                            // Tìm bootstrap-select container
                            const bootstrapSelect = selectElement.closest('.bootstrap-select');
                            let bsSelect = bootstrapSelect;
                            
                            if (!bsSelect) {
                                const selectWithId = document.querySelector('.bootstrap-select select#' + action.selectId);
                                if (selectWithId) {
                                    bsSelect = selectWithId.closest('.bootstrap-select');
                                }
                            }
                            
                            if (bsSelect) {
                                // Đảm bảo dropdown đã mở
                                if (!bsSelect.classList.contains('open')) {
                                    const toggleButton = bsSelect.querySelector('.dropdown-toggle');
                                    if (toggleButton) {
                                        toggleButton.click();
                                        console.log('Opening dropdown for select:', action.selectId);
                                    }
                                }
                                
                                // Tìm và click vào option
                                setTimeout(() => {
                                    const option = bsSelect.querySelector('li[data-original-index="' + action.optionIndex + '"] a');
                                    if (option) {
                                        option.click();
                                        console.log('Selected option:', action.optionText);
                                    } else {
                                        // Tìm bằng text nếu không tìm được bằng index
                                        const options = bsSelect.querySelectorAll('.dropdown-menu li a');
                                        for (let opt of options) {
                                            if (opt.textContent.trim().includes(action.optionText)) {
                                                opt.click();
                                                console.log('Selected option by text:', action.optionText);
                                                break;
                                            }
                                        }
                                    }
                                }, 100);
                            } else {
                                // Fallback to normal select
                                if (action.optionIndex && selectElement.options[action.optionIndex]) {
                                    selectElement.selectedIndex = action.optionIndex;
                                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                        } else {
                            // Fallback to normal click
                            element.click();
                        }
                    } else {
                        // Normal click for non-bootstrap-select elements
                        element.click();
                    }
                    
                    console.log('Clicked:', action.element.selector);
                    // Use the recorded time between actions or default to 500ms
                    const delay = action.timeSincePrevious ? Math.min(action.timeSincePrevious, 2000) : 500;
                    setTimeout(resolve, delay);
                } else {
                    console.warn('Element not found:', action.element.selector);
                    resolve();
                }
            });
        }`;

        // Combine all parts of the script
        const script = scriptHeader + scriptFunctions + `
        
        function executeInput(action) {
            return new Promise((resolve) => {
                const element = findElement(action.element);
                if (element) {
                    element.value = action.value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Input set:', action.element.selector);
                } else {
                    console.warn('Input element not found:', action.element.selector);
                }
                // Use the recorded time between actions or default to 200ms
                const delay = action.timeSincePrevious ? Math.min(action.timeSincePrevious, 1000) : 200;
                setTimeout(resolve, delay);
            });
        }
        
        function executeSubmit(action) {
            return new Promise((resolve) => {
                const form = findElement(action.form);
                if (form) {
                    form.submit();
                    console.log('Form submitted:', action.form.selector);
                    // Form submissions typically take longer
                    const delay = action.timeSincePrevious ? Math.min(action.timeSincePrevious, 3000) : 1000;
                    setTimeout(resolve, delay);
                } else {
                    console.warn('Form not found:', action.form.selector);
                    resolve();
                }
            });
        }
        
        function executeNavigation(action) {
            return new Promise((resolve) => {
                if (window.location.href !== action.newUrl) {
                    window.location.href = action.newUrl;
                    // Navigation will reload page, so this won't continue
                }
                resolve();
            });
        }
        
        function findElement(elementInfo) {
            // Try by ID first
            if (elementInfo.id) {
                const el = document.getElementById(elementInfo.id);
                if (el) return el;
            }
            
            // Try by selector
            if (elementInfo.selector) {
                // Xử lý đặc biệt cho :contains selector vì querySelector không hỗ trợ
                if (elementInfo.selector.includes(':contains(')) {
                    const baseSelector = elementInfo.selector.split(':contains(')[0];
                    const textMatch = elementInfo.selector.match(/:contains\("([^"]+)"\)/);
                    const textToMatch = textMatch ? textMatch[1] : null;
                    
                    if (baseSelector && textToMatch) {
                        try {
                            const candidates = document.querySelectorAll(baseSelector);
                            for (let el of candidates) {
                                if (el.textContent.includes(textToMatch)) {
                                    return el;
                                }
                            }
                        } catch (err) {
                            console.warn('Invalid base selector:', baseSelector);
                        }
                    }
                    return null; // Return null if we couldn't find by text
                }
                
                try {
                    const el = document.querySelector(elementInfo.selector);
                    if (el) return el;
                } catch (err) {
                    console.warn('Invalid selector:', elementInfo.selector);
                    // Try to clean up the selector by removing invalid parts
                    const cleanSelector = elementInfo.selector
                        .replace(/:contains\([^)]+\)/g, '') // Remove :contains()
                        .replace(/:nth-child\(\d+\)/g, ''); // Remove :nth-child()
                    
                    try {
                        if (cleanSelector && cleanSelector !== elementInfo.selector) {
                            const el = document.querySelector(cleanSelector);
                            if (el) return el;
                        }
                    } catch (err2) {
                        console.warn('Still invalid after cleanup:', cleanSelector);
                    }
                }
            }
            
            // Try by data-recorder-index
            if (elementInfo.element && elementInfo.element.dataAttributes && 
                elementInfo.element.dataAttributes['data-recorder-index'] !== undefined) {
                const parentSelector = getParentSelector(elementInfo);
                if (parentSelector) {
                    const parent = document.querySelector(parentSelector);
                    if (parent) {
                        const index = parseInt(elementInfo.element.dataAttributes['data-recorder-index']);
                        if (parent.children[index]) {
                            return parent.children[index];
                        }
                    }
                }
            }
            
            // Try by name
            if (elementInfo.name) {
                const el = document.querySelector('[name="' + elementInfo.name + '"]');
                if (el) return el;
            }
            
            // Try by text content for buttons and links
            if ((elementInfo.tagName === 'BUTTON' || elementInfo.tagName === 'A') && elementInfo.text) {
                // First try by data-text-content attribute
                const withAttr = document.querySelector(elementInfo.tagName.toLowerCase() + '[data-text-content="' + elementInfo.text.trim() + '"]');
                if (withAttr) return withAttr;
                
                // Then try by text content
                const elements = document.querySelectorAll(elementInfo.tagName.toLowerCase());
                for (let el of elements) {
                    if (el.textContent.trim() === elementInfo.text.trim()) {
                        return el;
                    }
                }
                
                // If exact match fails, try partial match
                for (let el of elements) {
                    if (el.textContent.trim().includes(elementInfo.text.trim())) {
                        return el;
                    }
                }
            }
            
            // Try to find list item by index
            if (elementInfo.tagName === 'LI' || elementInfo.originalIndex !== undefined) {
                // Try to find parent list first
                let parentList;
                if (elementInfo.parentListId) {
                    parentList = document.getElementById(elementInfo.parentListId);
                } else if (elementInfo.element && elementInfo.element.dataAttributes && 
                          elementInfo.element.dataAttributes['data-parent-id']) {
                    parentList = document.getElementById(elementInfo.element.dataAttributes['data-parent-id']);
                } else if (elementInfo.selector) {
                    // Extract parent selector
                    const parentSelector = elementInfo.selector.split(':')[0];
                    const parentElements = document.querySelectorAll(parentSelector);
                    if (parentElements.length === 1) {
                        parentList = parentElements[0].parentElement;
                    }
                }
                
                // If we found the parent list, get the item by index
                if (parentList && elementInfo.originalIndex !== undefined) {
                    if (parentList.children[elementInfo.originalIndex]) {
                        return parentList.children[elementInfo.originalIndex];
                    }
                }
                
                // Try finding by data-original-index
                if (elementInfo.originalIndex !== undefined) {
                    const el = document.querySelector('[data-original-index="' + elementInfo.originalIndex + '"]');
                    if (el) return el;
                }
            }
            
            // For select elements, try to find option by text or value
            if (elementInfo.tagName === 'SELECT' && elementInfo.selectedIndex !== undefined) {
                const select = document.querySelector(elementInfo.selector);
                if (select && select.options[elementInfo.selectedIndex]) {
                    // Select the correct option
                    select.selectedIndex = elementInfo.selectedIndex;
                    return select;
                } else if (select && elementInfo.selectedValue) {
                    // Try to find by value
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].value === elementInfo.selectedValue) {
                            select.selectedIndex = i;
                            return select;
                        }
                    }
                } else if (select && elementInfo.selectedText) {
                    // Try to find by text
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].text === elementInfo.selectedText) {
                            select.selectedIndex = i;
                            return select;
                        }
                    }
                }
            }
            
            // Nếu không tìm thấy, thử tìm kiếm dựa trên class và vị trí
            if (elementInfo.className) {
                const classes = elementInfo.className.split(' ').filter(c => c.trim());
                if (classes.length > 0) {
                    const classSelector = '.' + classes.join('.');
                    const elements = document.querySelectorAll(classSelector);
                    
                    // Nếu có nhiều phần tử cùng class, thử tìm theo vị trí hoặc text
                    if (elements.length > 0) {
                        if (elementInfo.coordinates) {
                            // Tìm phần tử gần nhất với tọa độ click
                            let closestEl = null;
                            let minDistance = Infinity;
                            
                            for (let el of elements) {
                                const rect = el.getBoundingClientRect();
                                const centerX = rect.left + rect.width / 2;
                                const centerY = rect.top + rect.height / 2;
                                const distance = Math.sqrt(
                                    Math.pow(centerX - elementInfo.coordinates.x, 2) + 
                                    Math.pow(centerY - elementInfo.coordinates.y, 2)
                                );
                                
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    closestEl = el;
                                }
                            }
                            
                            if (closestEl) return closestEl;
                        }
                        
                        // Nếu có text, tìm phần tử có text tương tự
                        if (elementInfo.text) {
                            for (let el of elements) {
                                if (el.textContent.trim() === elementInfo.text.trim()) {
                                    return el;
                                }
                            }
                        }
                        
                        // Nếu không tìm thấy, trả về phần tử đầu tiên
                        return elements[0];
                    }
                }
            }
            
            return null;
        }

        // Helper function to get parent selector
        function getParentSelector(elementInfo) {
            if (elementInfo.element && elementInfo.element.dataAttributes) {
                if (elementInfo.element.dataAttributes['data-parent-id']) {
                    return '#' + elementInfo.element.dataAttributes['data-parent-id'];
                }
                if (elementInfo.element.dataAttributes['data-parent-class']) {
                    return '.' + elementInfo.element.dataAttributes['data-parent-class'].split(' ')[0];
                }
            }
            return null;
        }
        
        async function runAutomation() {
            console.log('Starting WordPress automation...');
            
            for (let i = 0; i < actions.length; i++) {
                const action = actions[i];
                
                // Skip session markers
                if (action.type === 'session_start' || action.type === 'session_end') {
                    continue;
                }
                
                try {
                    await executeAction(action);
                    currentStep++;
                } catch (error) {
                    console.error('Error executing action:', error);
                    break;
                }
            }
            
            console.log('Automation completed!');
        }
        
        // Auto-start after page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAutomation);
        } else {
            runAutomation();
        }
        
    })();

    // To use this script:
    // 1. Open WordPress Admin in your browser
    // 2. Open Developer Console (F12)
    // 3. Paste this script and press Enter
    // 4. The automation will run automatically

    // Note: This is a generated script. You may need to modify it based on your specific needs.`;

        return script;
    }
    
    // Xem chi tiết actions
    function viewDetails() {
        const detailWindow = window.open('', 'ActionDetails', 'width=800,height=600,scrollbars=yes');
        const detailHTML = generateDetailView();
        detailWindow.document.write(detailHTML);
    }
    
    function generateDetailView() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chi tiết hành động - Session ${sessionId}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .action-detail { 
                    border: 1px solid #ddd; 
                    margin: 10px 0; 
                    padding: 15px; 
                    border-radius: 5px;
                    background: #f9f9f9;
                }
                .action-header { 
                    font-weight: bold; 
                    color: #0073aa; 
                    margin-bottom: 10px; 
                }
                .action-info { margin: 5px 0; }
                .action-data { 
                    background: #fff; 
                    padding: 10px; 
                    border-left: 3px solid #0073aa; 
                    margin-top: 10px;
                    font-family: monospace;
                    font-size: 12px;
                }
                pre { margin: 0; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <h1>Chi tiết hành động - Session ${sessionId}</h1>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Tổng số bước:</strong> ${stepCounter}</p>
            <hr>
            
            ${actionSequence.map(action => `
                <div class="action-detail">
                    <div class="action-header">
                        Bước ${action.step}: ${getActionTypeLabel(action.type)}
                    </div>
                    <div class="action-info">
                        <strong>Thời gian:</strong> ${new Date(action.timestamp).toLocaleString()}
                    </div>
                    <div class="action-info">
                        <strong>Trang:</strong> ${action.page}
                    </div>
                    <div class="action-info">
                        <strong>URL:</strong> ${action.url}
                    </div>
                    <div class="action-data">
                        <pre>${JSON.stringify(action, null, 2)}</pre>
                    </div>
                </div>
            `).join('')}
        </body>
        </html>
        `;
    }
    
    // Lưu/load trạng thái
    function saveRecordingState() {
        chrome.storage.local.set({
            'recording_state': {
                isRecording: isRecording,
                sessionId: sessionId,
                stepCounter: stepCounter,
                lastSaved: Date.now()
            }
        });
    }
    
    function loadRecordingState() {
        chrome.storage.local.get(['recording_state'], function(result) {
            if (result.recording_state) {
                const state = result.recording_state;
                isRecording = state.isRecording;
                sessionId = state.sessionId;
                
                // Đảm bảo stepCounter được khôi phục đúng
                if (state.stepCounter > stepCounter) {
                    console.log('Khôi phục stepCounter từ storage:', state.stepCounter);
                    stepCounter = state.stepCounter;
                }
                
                if (isRecording) {
                    updateRecordingStatus('Đang ghi...', 'recording');
                }
                
                updateStepCount();
            }
        });
        
        // Load actions
        loadActions();
    }
    
    function saveActions() {
        chrome.storage.local.set({
            [`actions_${sessionId}`]: actionSequence
        });
    }
    
    function loadActions() {
        chrome.storage.local.get([`actions_${sessionId}`], function(result) {
            if (result[`actions_${sessionId}`]) {
                actionSequence = result[`actions_${sessionId}`];
                
                // Rebuild action log
                const logContainer = document.getElementById('action-log');
                if (logContainer) {
                    logContainer.innerHTML = '';
                    actionSequence.forEach(action => {
                        updateActionLog(action);
                    });
                }
            }
        });
    }
    
    // Hiển thị notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `wp-recorder-notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
})();