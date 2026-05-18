/**
 * ISS Tracker
 * Dedicated ISS tracking with live telemetry and video feed
 */
class ISSTracker {
    constructor() {
        this.cesiumView = null;
        this.telemetry = {};
        this.updateInterval = null;
    }

    async init(cesiumContainerId) {
        // Initialize dedicated Cesium view for ISS
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTYyYTU5Ni1jZWU1LTQ1ZTEtODVhNy05M2M4ZjFlY2ZhNTgiLCJpZCI6NDMzMTY1LCJpc3MiOiJodHRwczovL2lvbi5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3NzkxMjQxOTZ9.PH9dWmOUNHn-fesDtcDkyXU-RsbK3wdJ8D4FZsLEm-0'; // Replace with your token

        this.cesiumView = new Cesium.Viewer(cesiumContainerId, {
            terrain: Cesium.Terrain.fromWorldTerrain(),
            skyBox: false,
            skyAtmosphere: true,
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: true,
            timeline: false,
            fullscreenButton: false,
            vrButton: false,
            infoBox: true,
            selectionIndicator: true,
            shadows: true,
            shouldAnimate: true
        });

        // Space theme
        this.cesiumView.scene.backgroundColor = Cesium.Color.BLACK;
        this.cesiumView.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0a12');
        this.cesiumView.scene.globe.enableLighting = true;
        this.cesiumView.scene.globe.lightingFadeOutDistance = 100000;
        this.cesiumView.scene.globe.lightingFadeInDistance = 10000000;

        // Dark map
        this.cesiumView.imageryLayers.removeAll();
        this.cesiumView.imageryLayers.add(new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                subdomains: ['a', 'b', 'c', 'd'],
                maximumLevel: 19
            })
        ));

        // Add ISS model
        this.addISSModel();

        // Start telemetry updates
        this.startTelemetryUpdates();

        return this.cesiumView;
    }

    addISSModel() {
        // ISS position callback
        const issPosition = new Cesium.CallbackProperty((time) => {
            if (this.telemetry.lat && this.telemetry.lon) {
                return Cesium.Cartesian3.fromDegrees(
                    this.telemetry.lon,
                    this.telemetry.lat,
                    this.telemetry.alt * 1000
                );
            }
            return Cesium.Cartesian3.ZERO;
        }, false);

        // ISS entity with custom styling
        this.issEntity = this.cesiumView.entities.add({
            name: 'International Space Station',
            position: issPosition,
            point: {
                pixelSize: 20,
                color: Cesium.Color.fromCssColorString('#ff00ff'),
                outlineColor: Cesium.Color.fromCssColorString('#00f0ff'),
                outlineWidth: 3
            },
            label: {
                text: 'ISS',
                font: 'bold 16px "Share Tech Mono"',
                fillColor: Cesium.Color.fromCssColorString('#ff00ff'),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -15)
            },
            ellipse: {
                semiMinorAxis: 500000,
                semiMajorAxis: 500000,
                material: Cesium.Color.fromCssColorString('#ff00ff').withAlpha(0.05),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#ff00ff').withAlpha(0.2),
                outlineWidth: 1,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
            }
        });

        // ISS orbit trail
        this.issTrail = [];
        this.cesiumView.entities.add({
            name: 'ISS Orbit Trail',
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return this.issTrail.map(p => 
                        Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.alt * 1000)
                    );
                }, false),
                width: 3,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.5,
                    color: Cesium.Color.fromCssColorString('#ff00ff').withAlpha(0.8)
                })
            }
        });

        // Ground track
        this.cesiumView.entities.add({
            name: 'ISS Ground Track',
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return this.issTrail.map(p => 
                        Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 0)
                    );
                }, false),
                width: 2,
                material: Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.3)
            }
        });
    }

    async updateTelemetry(satelliteEngine, observer) {
        const iss = satelliteEngine.getISS();
        if (!iss) return;

        const pos = satelliteEngine.calculatePosition(iss, observer.lat, observer.lon, observer.alt || 0);
        if (!pos) return;

        this.telemetry = {
            lat: pos.lat,
            lon: pos.lon,
            alt: pos.alt,
            velocity: pos.velocity,
            azimuth: pos.azimuth,
            elevation: pos.elevation,
            range: pos.range,
            timestamp: new Date()
        };

        // Add to trail
        this.issTrail.push({
            lat: pos.lat,
            lon: pos.lon,
            alt: pos.alt
        });
        if (this.issTrail.length > 200) {
            this.issTrail.shift();
        }

        // Update telemetry display
        this.updateTelemetryDisplay();

        // Camera follow ISS
        this.cesiumView.camera.position = Cesium.Cartesian3.fromDegrees(
            pos.lon - 30,
            pos.lat + 10,
            5000000
        );
        this.cesiumView.camera.lookAt(
            Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000)
        );
    }

    updateTelemetryDisplay() {
        const container = document.getElementById('iss-telemetry');
        if (!container) return;

        const t = this.telemetry;
        container.innerHTML = `
            <div class="telemetry-grid">
                <div class="telemetry-item">
                    <div class="label">LATITUDE</div>
                    <div class="value">${t.lat ? t.lat.toFixed(4) : '--'}°</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">LONGITUDE</div>
                    <div class="value">${t.lon ? t.lon.toFixed(4) : '--'}°</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">ALTITUDE</div>
                    <div class="value">${t.alt ? t.alt.toFixed(1) : '--'} km</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">VELOCITY</div>
                    <div class="value">${t.velocity ? (t.velocity * 3.6).toFixed(0) : '--'} km/h</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">AZIMUTH</div>
                    <div class="value">${t.azimuth ? t.azimuth.toFixed(1) : '--'}°</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">ELEVATION</div>
                    <div class="value">${t.elevation ? t.elevation.toFixed(1) : '--'}°</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">RANGE</div>
                    <div class="value">${t.range ? t.range.toFixed(0) : '--'} km</div>
                </div>
                <div class="telemetry-item">
                    <div class="label">VISIBILITY</div>
                    <div class="value" style="color: ${t.elevation > 0 ? '#00ff80' : '#ff0040'}">
                        ${t.elevation > 0 ? 'VISIBLE' : 'BELOW HORIZON'}
                    </div>
                </div>
            </div>
        `;
    }

    startTelemetryUpdates() {
        // Telemetry display updates every second
        setInterval(() => {
            this.updateTelemetryDisplay();
        }, 1000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.cesiumView) {
            this.cesiumView.destroy();
        }
    }
}

window.ISSTracker = ISSTracker;
