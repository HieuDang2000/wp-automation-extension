// WordPress Auto Login Script
const username = "namivsb";
const password = "cvzEWxfCwRcZCyUNQlN";

(function() {
    'use strict';
    
    // Wait for the page to fully load
    function waitForPageLoad() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    // Wait for an element to be available in the DOM
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    function simulateCtrlTab() {
        console.log('Simulating Ctrl+Tab key combination');
        
        // Create keyboard events for keydown
        const ctrlDownEvent = new KeyboardEvent('keydown', {
            key: 'Control',
            code: 'ControlLeft',
            ctrlKey: true,
            bubbles: true
        });
        
        const tabDownEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            code: 'Tab',
            ctrlKey: true,
            bubbles: true
        });
        
        // Create keyboard events for keyup
        const tabUpEvent = new KeyboardEvent('keyup', {
            key: 'Tab',
            code: 'Tab',
            ctrlKey: true,
            bubbles: true
        });
        
        const ctrlUpEvent = new KeyboardEvent('keyup', {
            key: 'Control',
            code: 'ControlLeft',
            ctrlKey: false,
            bubbles: true
        });
        
        // Dispatch the events in sequence
        document.dispatchEvent(ctrlDownEvent);
        document.dispatchEvent(tabDownEvent);
        document.dispatchEvent(tabUpEvent);
        document.dispatchEvent(ctrlUpEvent);
        
        console.log('Ctrl+Tab key combination simulated');
    }
    
    // Perform the login
    async function performLogin() {
        try {
            console.log('Starting WordPress auto-login...');
            
            // Wait for login form elements
            const usernameField = await waitForElement('#user_login');
            const passwordField = await waitForElement('#user_pass');
            
            // Fill in credentials
            usernameField.value = username;
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('Username entered');
            
            passwordField.value = password;
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('Password entered');
            
            // Submit the form
            const loginButton = await waitForElement('#wp-submit');
            console.log('Login button found, clicking...');
            loginButton.click();
            
            // Simulate Ctrl+Tab after all steps are completed
            setTimeout(() => {
                simulateCtrlTab();
            }, 500);

        } catch (error) {
            console.error('Auto-login failed:', error);
        }
    }
    
    // Start the login process
    waitForPageLoad().then(performLogin);
})();








