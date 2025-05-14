/**
 * Student Hub - Main Application JavaScript
 * Provides shared functionality across the application
 */

// Global variables and configurations
const APP_NAME = 'Student Hub';
const APP_VERSION = '1.0.0';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${APP_NAME} v${APP_VERSION} initialized`);
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Check if dark mode is enabled
    checkDarkMode();
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

/**
 * Set up event listeners that apply to all pages
 */
function setupGlobalEventListeners() {
    // Handle navigation active states
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Handle collapsible navbar for mobile
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav) {
                navbarNav.classList.toggle('show');
            }
        });
    }
}

/**
 * Check if dark mode is enabled and apply appropriate styling
 */
function checkDarkMode() {
    // By default, we're using dark mode from Bootstrap
    // This function is a placeholder for potential future light mode toggle
    document.documentElement.setAttribute('data-bs-theme', 'dark');
}

/**
 * Format a date object into a human-readable string
 * @param {Date} date - The date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
function formatDate(date, includeTime = false) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
function isToday(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, warning, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1050';
        document.body.appendChild(notificationContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.classList.add('toast', 'show');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Set background color based on type
    let bgClass = 'bg-primary';
    switch(type) {
        case 'success':
            bgClass = 'bg-success';
            break;
        case 'warning':
            bgClass = 'bg-warning';
            break;
        case 'error':
            bgClass = 'bg-danger';
            break;
        case 'info':
            bgClass = 'bg-info';
            break;
    }
    
    toast.classList.add(bgClass, 'text-white');
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Student Hub</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(toast);
    
    // Set up auto-dismiss
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 5000);
    
    // Add event listener to close button
    const closeButton = toast.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        });
    }
}

/**
 * Utility function to truncate text to a specific length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Check if local storage is available
 * @returns {boolean} True if local storage is available
 */
function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Warn if local storage is not available
if (!isLocalStorageAvailable()) {
    console.warn('Local storage is not available. Data will not be persisted.');
    
    // Override localStorage methods to prevent errors
    window.localStorage = {
        getItem: function() { return null; },
        setItem: function() { },
        removeItem: function() { },
        clear: function() { }
    };
}
