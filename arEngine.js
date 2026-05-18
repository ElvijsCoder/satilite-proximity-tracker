/**
 * Location Service
 * Handles geolocation with error handling and fallback
 */
class LocationService {
    constructor() {
        this.position = null;
        this.watchId = null;
        this.hasPermission = false;
    }

    async requestLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.position = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        alt: position.coords.altitude || 0,
                        accuracy: position.coords.accuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };
                    this.hasPermission = true;
                    resolve(this.position);
                },
                (error) => {
                    let message = 'Unknown error';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Position unavailable';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out';
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });
    }

    startWatching(callback) {
        if (!navigator.geolocation) return;

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.position = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    alt: position.coords.altitude || 0,
                    accuracy: position.coords.accuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp
                };
                if (callback) callback(this.position);
            },
            (error) => console.error('Watch position error:', error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    }

    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    // Fallback to IP-based geolocation
    async getApproximateLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                lat: data.latitude,
                lon: data.longitude,
                alt: 0,
                accuracy: 50000, // 50km accuracy
                city: data.city,
                country: data.country_name,
                isApproximate: true
            };
        } catch (error) {
            // Ultimate fallback - return a default location (e.g., New York)
            return {
                lat: 40.7128,
                lon: -74.0060,
                alt: 0,
                accuracy: 1000000,
                isApproximate: true,
                isDefault: true
            };
        }
    }

    getCurrentPosition() {
        return this.position;
    }
}

window.LocationService = LocationService;
