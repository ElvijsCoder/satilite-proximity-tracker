/**
 * Notification Service
 * Handles Web Push notifications for satellite passes
 */
class NotificationService {
    constructor() {
        this.enabled = false;
        this.swRegistration = null;
        this.notifiedPasses = new Set();
    }

    async init() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported');
            return false;
        }

        try {
            this.swRegistration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registered');
            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return false;
        }

        const permission = await Notification.requestPermission();
        this.enabled = permission === 'granted';
        return this.enabled;
    }

    async toggle() {
        if (!this.enabled) {
            const granted = await this.requestPermission();
            if (granted) {
                this.enabled = true;
                this.showToast('ALERTS ENABLED', 'You will be notified of upcoming satellite passes');
            }
        } else {
            this.enabled = false;
            this.showToast('ALERTS DISABLED', 'Notifications turned off');
        }
        return this.enabled;
    }

    checkAndNotify(passes) {
        if (!this.enabled) return;
        const now = new Date();

        passes.forEach(pass => {
            const timeUntil = pass.startTime - now;
            const passId = `${pass.satellite}-${pass.startTime.getTime()}`;

            if (timeUntil > 0 && timeUntil <= 15 * 60000 && !this.notifiedPasses.has(passId)) {
                this.notifiedPasses.add(passId);
                this.sendNotification(pass);
            }

            if (pass.isBright && timeUntil > 0 && timeUntil <= 5 * 60000 && !this.notifiedPasses.has(passId + '-urgent')) {
                this.notifiedPasses.add(passId + '-urgent');
                this.sendUrgentNotification(pass);
            }
        });

        this.cleanupOldNotifications();
    }

    sendNotification(pass) {
        const title = 'SATELLITE APPROACHING';
        const options = {
            body: `${pass.satellite} will be visible in ${Math.ceil((pass.startTime - new Date()) / 60000)} minutes\nMax elevation: ${pass.maxElevation.toFixed(1)}°`,
            icon: 'assets/satellite-icon.png',
            badge: 'assets/badge-icon.png',
            tag: `pass-${pass.satellite}`,
            requireInteraction: true,
            actions: [
                { action: 'view', title: 'VIEW' },
                { action: 'dismiss', title: 'DISMISS' }
            ]
        };

        if (this.swRegistration) {
            this.swRegistration.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    }

    sendUrgentNotification(pass) {
        const title = '⚠ BRIGHT SATELLITE INCOMING';
        const options = {
            body: `${pass.satellite} visible NOW!\nLook ${this.getDirection(pass.startAzimuth)} - Elevation: ${pass.maxElevation.toFixed(1)}°`,
            icon: 'assets/satellite-icon.png',
            badge: 'assets/badge-icon.png',
            tag: `urgent-${pass.satellite}`,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 400],
            actions: [
                { action: 'view', title: 'TRACK NOW' },
                { action: 'dismiss', title: 'DISMISS' }
            ]
        };

        if (this.swRegistration) {
            this.swRegistration.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    }

    getDirection(azimuth) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(azimuth / 22.5) % 16;
        return directions[index];
    }

    showToast(title, message) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    cleanupOldNotifications() {
        const cutoff = Date.now() - 24 * 3600 * 1000;
        for (const id of this.notifiedPasses) {
            const timestamp = parseInt(id.split('-').pop());
            if (!isNaN(timestamp) && timestamp < cutoff) {
                this.notifiedPasses.delete(id);
            }
        }
    }
}

window.NotificationService = NotificationService;
