/**
 * AR Engine
 * Uses device orientation and camera to overlay satellite positions
 */
class AREngine {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.overlay = null;
        this.streaming = false;
        this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
        this.satellites = [];
        this.observer = null;
        this.fov = { horizontal: 60, vertical: 45 }; // Typical phone camera FOV
    }

    async init(videoElement, canvasElement, overlayElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.overlay = overlayElement;

        // Resize canvas to match video
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Request camera access
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            this.video.srcObject = stream;
            this.streaming = true;
        } catch (error) {
            console.error('Camera access denied:', error);
            throw error;
        }

        // Request device orientation
        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Device orientation permission denied');
                }
            }

            window.addEventListener('deviceorientation', (e) => {
                this.deviceOrientation = {
                    alpha: e.alpha || 0,   // Compass direction (0-360)
                    beta: e.beta || 0,     // Front-back tilt (-180 to 180)
                    gamma: e.gamma || 0    // Left-right tilt (-90 to 90)
                };
            });
        }

        // Start render loop
        this.render();
    }

    setObserver(observer) {
        this.observer = observer;
    }

    setSatellites(satellites) {
        this.satellites = satellites.filter(s => s.isVisible);
    }

    // Convert satellite azimuth/elevation to screen coordinates
    satelliteToScreen(satAzimuth, satElevation) {
        // Normalize device orientation
        const heading = this.deviceOrientation.alpha;
        const pitch = this.deviceOrientation.beta - 90; // Adjust so 0 is horizon
        const roll = this.deviceOrientation.gamma;

        // Calculate relative angles
        let relAzimuth = satAzimuth - heading;
        if (relAzimuth > 180) relAzimuth -= 360;
        if (relAzimuth < -180) relAzimuth += 360;

        let relElevation = satElevation - pitch;

        // Convert to screen coordinates (center of screen is 0,0)
        const screenX = (relAzimuth / this.fov.horizontal) * this.canvas.width + this.canvas.width / 2;
        const screenY = this.canvas.height / 2 - (relElevation / this.fov.vertical) * this.canvas.height;

        return { x: screenX, y: screenY, inView: Math.abs(relAzimuth) < this.fov.horizontal / 2 && Math.abs(relElevation) < this.fov.vertical / 2 };
    }

    render() {
        if (!this.streaming) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw horizon line
        this.drawHorizon();

        // Draw satellites
        this.satellites.forEach(sat => {
            const screenPos = this.satelliteToScreen(sat.azimuth, sat.elevation);

            if (screenPos.inView) {
                this.drawSatelliteMarker(screenPos.x, screenPos.y, sat);
            }
        });

        // Update DOM overlay
        this.updateOverlay();

        requestAnimationFrame(() => this.render());
    }

    drawHorizon() {
        const pitch = this.deviceOrientation.beta - 90;
        const horizonY = this.canvas.height / 2 - (pitch / this.fov.vertical) * this.canvas.height;

        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, horizonY);
        this.ctx.lineTo(this.canvas.width, horizonY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw compass directions
        const heading = this.deviceOrientation.alpha;
        const directions = [
            { label: 'N', angle: 0 },
            { label: 'E', angle: 90 },
            { label: 'S', angle: 180 },
            { label: 'W', angle: 270 }
        ];

        directions.forEach(dir => {
            let relAngle = dir.angle - heading;
            if (relAngle > 180) relAngle -= 360;
            if (relAngle < -180) relAngle += 360;

            if (Math.abs(relAngle) < this.fov.horizontal / 2) {
                const x = (relAngle / this.fov.horizontal) * this.canvas.width + this.canvas.width / 2;
                this.ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
                this.ctx.font = '14px "Share Tech Mono"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(dir.label, x, this.canvas.height / 2 + 30);
            }
        });
    }

    drawSatelliteMarker(x, y, sat) {
        const size = Math.max(8, 20 - sat.range / 500);
        const pulse = (Date.now() % 1000) / 1000;
        const glowSize = size + pulse * 10;

        // Glow effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Core dot
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Label
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.font = '12px "Share Tech Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(sat.name.substring(0, 15), x, y - size - 5);

        // Range
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        this.ctx.font = '10px "Share Tech Mono"';
        this.ctx.fillText(`${sat.range.toFixed(0)} km`, x, y + size + 15);
    }

    updateOverlay() {
        if (!this.overlay) return;

        const container = document.getElementById('ar-satellites');
        if (!container) return;

        // Only update DOM occasionally to avoid performance issues
        if (Math.random() > 0.1) return;

        container.innerHTML = '';

        this.satellites.slice(0, 3).forEach(sat => {
            const screenPos = this.satelliteToScreen(sat.azimuth, sat.elevation);
            if (!screenPos.inView) return;

            const marker = document.createElement('div');
            marker.className = 'ar-satellite-marker';
            marker.style.left = `${(screenPos.x / this.canvas.width) * 100}%`;
            marker.style.top = `${(screenPos.y / this.canvas.height) * 100}%`;
            marker.innerHTML = `
                <div class="ar-sat-marker-dot"></div>
                <div class="ar-sat-marker-label">
                    ${sat.name.substring(0, 12)}<br>
                    ${sat.elevation.toFixed(1)}° ${sat.azimuth.toFixed(0)}°
                </div>
            `;
            container.appendChild(marker);
        });
    }

    stop() {
        this.streaming = false;
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

window.AREngine = AREngine;
