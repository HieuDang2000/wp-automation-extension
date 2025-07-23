# 🎬 WordPress Action Recorder Extension

Extension Chrome giúp ghi lại các hành động trên WordPress Admin và tạo automation script để tự động hóa các tác vụ lặp đi lặp lại.

## ✨ Tính năng chính

- **Ghi lại hành động thực tế**: Click, nhập liệu, submit form, chuyển trang, AJAX requests
- **Export định dạng JSON**: Backup và phân tích dữ liệu
- **Tạo automation script**: JavaScript script có thể chạy trực tiếp trên browser
- **Giao diện trực quan**: Panel recording với các thông tin chi tiết
- **Hỗ trợ đa session**: Quản lý nhiều session recording
- **Control panel tự động**: Script automation có giao diện điều khiển

## 📦 Cài đặt

### Cách 1: Load extension từ source code

1. Download hoặc clone source code
2. Mở Chrome và vào `chrome://extensions/`
3. Bật "Developer mode" ở góc phải trên
4. Click "Load unpacked" và chọn thư mục chứa extension
5. Extension sẽ xuất hiện trong danh sách

### Cách 2: Từ Chrome Web Store (nếu có)

1. Tìm "WordPress Action Recorder" trên Chrome Web Store
2. Click "Add to Chrome"
3. Xác nhận cài đặt

## 🚀 Cách sử dụng

### Bước 1: Bắt đầu ghi

1. Mở WordPress Admin (`/wp-login/`)
2. Extension sẽ tự động hiển thị panel ở góc phải màn hình
3. Click nút **"🔴 Bắt đầu ghi"**
4. Thực hiện các thao tác bạn muốn tự động hóa

### Bước 2: Thực hiện các hành động

Extension sẽ tự động ghi lại:
- ✅ **Click**: Buttons, links, checkboxes, radio buttons
- ✅ **Input**: Text fields, textareas, select dropdowns  
- ✅ **Form Submit**: Tất cả form submissions
- ✅ **Page Navigation**: Chuyển trang trong admin
- ✅ **AJAX Requests**: Các request admin-ajax.php

### Bước 3: Dừng và Export

1. Click **"⏹️ Dừng ghi"** khi hoàn tất
2. Xem lại danh sách hành động đã ghi
3. Export theo định dạng mong muốn:
   - **📤 Export JSON**: Để backup hoặc phân tích
   - **📜 Export Script**: Để chạy automation

### Bước 4: Chạy Automation

1. Mở WordPress Admin (trang bạn muốn chạy automation)
2. Mở Developer Console (`F12` → Console tab)
3. Copy và paste automation script đã export
4. Script sẽ tự động tạo control panel và chạy

## 🎛️ Giao diện Control Panel

Automation script sẽ tạo control panel với các chức năng:

- **Start**: Bắt đầu chạy automation
- **Pause/Resume**: Tạm dừng và tiếp tục
- **Stop**: Dừng hoàn toàn
- **Progress**: Hiển thị tiến độ thực hiện
- **Status**: Trạng thái hiện tại

## 📁 Cấu trúc Files

```
wordpress-action-recorder/
├── manifest.json          # Cấu hình extension
├── content.js             # Script chính ghi lại hành động
├── recorder.css           # Styling cho recorder panel
├── popup.html             # Giao diện popup
├── popup.js               # Logic cho popup
├── background.js          # Service worker
├── README.md              # Hướng dẫn này
└── icons/                 # Icons cho extension
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## ⚙️ Cấu hình và Tùy chỉnh

### Thay đổi cài đặt recording

Trong `content.js`, bạn có thể tùy chỉnh:

```javascript
// Các input quan trọng sẽ được ghi lại
const importantNames = ['post_title', 'title', 'content', 'excerpt'];
const importantIds = ['title', 'content', 'excerpt'];

// Thời gian delay giữa các hành động (ms)
const DELAY_BETWEEN_ACTIONS = 800;

// Timeout tìm element (ms)  
const TIMEOUT_FOR_ELEMENTS = 5000;
```

### Thay đổi giao diện

Chỉnh sửa `recorder.css` để tùy chỉnh:
- Vị trí panel
- Màu sắc
- Kích thước
- Animation effects

## 🔧 API và Extension Points

### Content Script Messages

```javascript
// Toggle recording từ popup
chrome.tabs.sendMessage(tabId, {
    action: 'toggle_recording'
});

// Clear session
chrome.tabs.sendMessage(tabId, {
    action: 'clear_session'  
});

// Export session
chrome.tabs.sendMessage(tabId, {
    action: 'export_session'
});
```

### Storage Structure

```javascript
// Recording state
{
    recording_state: {
        isRecording: boolean,
        sessionId: number,
        stepCounter: number
    }
}

// Action data
{
    [`actions_${sessionId}`]: [
        {
            step: number,
            sessionId: number,
            timestamp: number,
            type: string,
            url: string,
            page: string,
            element: object,
            // ... action specific data
        }
    ]
}
```

## 🛠️ Development và Debugging

### Enable Debug Mode

Trong automation script:
```javascript
const CONFIG = {
    DEBUG: true,  // Hiển thị log chi tiết
    DELAY_BETWEEN_ACTIONS: 1000, // Tăng delay để observe
    // ...
};
```

### Console Commands

Khi chạy automation, có thể sử dụng:

```javascript
// Kiểm tra trạng thái
wpAutomation.status();

// Điều khiển thủ công
wpAutomation.start();
wpAutomation.pause();  
wpAutomation.stop();

// Xem config và data
wpAutomation.config;
wpAutomation.actions;
```

### Common Issues

**Extension không xuất hiện:**
- Kiểm tra URL có chứa `/wp-admin/` không
- Reload trang và kiểm tra console có lỗi
- Verify extension đã được enable

**Recording không chính xác:**
- Thực hiện thao tác chậm và rõ ràng
- Tránh click liên tục hoặc quá nhanh
- Kiểm tra element selector có chính xác

**Automation script không chạy:**
- Kiểm tra console có JavaScript errors
- Verify các element vẫn tồn tại trên trang
- Thử tăng delay time giữa actions

## 📋 Roadmap

- [ ] Hỗ trợ record trên Gutenberg editor
- [ ] Visual selector tool để chọn elements
- [ ] Conditional logic trong automation
- [ ] Integration với WordPress REST API
- [ ] Scheduled automation runs
- [ ] Multi-site recording support

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Tạo Pull Request

## 📄 License

MIT License - xem file `LICENSE` để biết chi tiết.

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra console browser để xem errors
2. Export JSON session data để phân tích
3. Tạo issue trên GitHub với thông tin chi tiết
4. Include browser version, WordPress version, và error logs

---

**WordPress Action Recorder v1.0**  
Tạo automation script từ hành động thực tế 🚀
## 🎯 **Tính năng chính:** (tiếp tục)

1. **Ghi lại mọi hành động:**
   - Click buttons, links, checkboxes
   - Nhập liệu vào text fields, textarea
   - Submit forms 
   - Chuyển trang trong admin
   - AJAX requests

2. **Giao diện trực quan:**
   - Panel recorder ở góc phải màn hình
   - Popup extension với các controls
   - Hiển thị real-time số bước đã ghi
   - Log chi tiết từng hành động

3. **Export đa định dạng:**
   - **JSON**: Backup và phân tích dữ liệu
   - **JavaScript Script**: Automation script có thể chạy ngay

4. **Automation Script thông minh:**
   - Control panel tự động
   - Pause/Resume/Stop controls
   - Progress tracking
   - Tự động tiếp tục sau khi chuyển trang
   - Error handling và retry logic

## 📦 **Cài đặt Extension:**

1. Tạo thư mục `wordpress-action-recorder`
2. Tạo các file từ artifacts tôi đã cung cấp:
   - `manifest.json`
   - `content.js`  
   - `recorder.css`
   - `popup.html`
   - `popup.js`
   - `background.js`

3. Mở Chrome → `chrome://extensions/`
4. Bật "Developer mode"
5. Click "Load unpacked" → chọn thư mục extension

## 🚀 **Workflow sử dụng:**

### Bước 1: Ghi lại hành động
```
1. Mở WordPress Admin
2. Extension tự động hiện panel recording
3. Click "🔴 Bắt đầu ghi"
4. Thực hiện các thao tác bình thường
5. Extension ghi lại tất cả: clicks, inputs, form submissions, page navigation
6. Click "⏹️ Dừng ghi" khi xong
```

### Bước 2: Export automation script
```
1. Click "📜 Export Script" 
2. File .js sẽ được download
3. Script chứa toàn bộ logic để replay các hành động
```

### Bước 3: Chạy automation
```
1. Mở WordPress Admin (trang muốn chạy auto)
2. Mở Console (F12)
3. Paste script đã export
4. Script tự tạo control panel
5. Click "Start" để chạy automation
```

## 🎮 **Control Panel Features:**

Automation script tạo control panel với:
- **Progress bar**: Hiển thị tiến độ 
- **Start/Pause/Stop**: Điều khiển execution
- **Auto-resume**: Tự động tiếp tục sau page navigation
- **Debug logging**: Chi tiết từng bước thực hiện
- **Error handling**: Retry khi element không tìm thấy

## 💡 **Advanced Features:**

1. **Element Finding Strategy:**
   - Thử tìm theo ID → Selector → Name → Text content → Class
   - Fallback multiple strategies để tăng độ tin cậy

2. **Smart Delays:**
   - Configurable delay giữa actions
   - Timeout cho việc tìm elements
   - Wait for page load sau navigation

3. **Session Management:**
   - Lưu state vào Chrome storage
   - Resume recording sau page reload
   - Multiple session support

4. **Developer Tools:**
   - `wpAutomation` object trong console
   - Debug mode với detailed logging
   - Configuration options

## 🔧 **Customization:**

Có thể tùy chỉnh trong code:

```javascript
// Trong automation script
const CONFIG = {
    DEBUG: true,
    DELAY_BETWEEN_ACTIONS: 800, // ms giữa các action
    TIMEOUT_FOR_ELEMENTS: 5000, // timeout tìm element
    RETRY_ATTEMPTS: 3
};

// Trong content.js - các input quan trọng được ghi
const importantNames = ['post_title', 'title', 'content', 'excerpt'];
```

## 🎯 **Use Cases phổ biến:**

1. **Bulk post operations**: Tạo nhiều bài viết với format giống nhau
2. **User management**: Thêm users hàng loạt
3. **Plugin/Theme testing**: Test workflows lặp đi lặp lại
4. **Content migration**: Copy content giữa các sites
5. **QA testing**: Automated testing các admin workflows

Extension này sẽ giúp bạn tiết kiệm rất nhiều thời gian cho các tác vụ lặp đi lặp lại trên WordPress Admin. Script automation được tạo ra rất chi tiết và có thể handle các case phức tạp như page navigation và AJAX requests.