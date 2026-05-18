/**
 * Cesium 3D View
 * Renders satellites on a 3D globe with orbital trails
 */
class CesiumView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.viewer = null;
        this.satelliteEntities = new Map();
        this.trailEntities = new Map();
        this.observerEntity = null;
        this.trailLength = 90; // Number of positions in trail
        this.satelliteHistory = new Map(); // Store position history for trails
    }

    async init() {
        // Initialize Cesium with dark theme
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1ZDAwZC1iZTYxLTQ2MjMtODRlOS0wYWJiYzdjYjQ0NzgiLCJpZCI6NTYwODUsImlhdCI6MTY5NjA0MjE3OH0.MmK0RXva9E8Z7aW3F9X7v3z9z9z9z9z9z9z9z9z9z9z'; // Replace with your token

        this.viewer = new Cesium.Viewer(this.container, {
            terrain: Cesium.Terrain.fromWorldTerrain(),
            skyBox: false,
            skyAtmosphere: false,
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: true,
            timeline: true,
            fullscreenButton: false,
            vrButton: false,
            infoBox: true,
            selectionIndicator: true,
            shadows: false,
            shouldAnimate: true
        });

        // Dark space background
        this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0a12');
        this.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0a12');
        this.viewer.scene.globe.enableLighting = false;
        this.viewer.scene.globe.depthTestAgainstTerrain = false;

        // Remove default imagery and add dark tiles
        this.viewer.imageryLayers.removeAll();
        const darkLayer = new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                subdomains: ['a', 'b', 'c', 'd'],
                maximumLevel: 19
            })
        );
        this.viewer.imageryLayers.add(darkLayer);

        // Add star field
        this.viewer.scene.skyBox = new Cesium.SkyBox({
            sources: {
                positiveX: 'assets/stars_px.jpg',
                negativeX: 'assets/stars_nx.jpg',
                positiveY: 'assets/stars_py.jpg',
                negativeY: 'assets/stars_ny.jpg',
                positiveZ: 'assets/stars_pz.jpg',
                negativeZ: 'assets/stars_nz.jpg'
            }
        });

        // Set initial view
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
            duration: 0
        });

        return this.viewer;
    }

    addObserver(lat, lon) {
        if (this.observerEntity) {
            this.viewer.entities.remove(this.observerEntity);
        }

        this.observerEntity = this.viewer.entities.add({
            name: 'Observer',
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            point: {
                pixelSize: 15,
                color: Cesium.Color.fromCssColorString('#00f0ff'),
                outlineColor: Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.5),
                outlineWidth: 2
            },
            ellipse: {
                semiMinorAxis: 50000,
                semiMajorAxis: 50000,
                material: Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.1),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.3),
                outlineWidth: 1,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });

        // Fly to observer
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 10000000),
            duration: 2
        });
    }

    updateSatellite(satellite, position) {
        const id = satellite.noradId;

        // Update position history for trail
        if (!this.satelliteHistory.has(id)) {
            this.satelliteHistory.set(id, []);
        }
        const history = this.satelliteHistory.get(id);
        history.push({
            longitude: position.lon,
            latitude: position.lat,
            height: position.alt * 1000
        });
        if (history.length > this.trailLength) {
            history.shift();
        }

        // Create or update entity
        if (!this.satelliteEntities.has(id)) {
            // Create satellite entity
            const entity = this.viewer.entities.add({
                name: satellite.name,
                position: new Cesium.CallbackProperty((time) => {
                    const pos = this.getCurrentPosition(id);
                    if (pos) {
                        return Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000);
                    }
                    return Cesium.Cartesian3.ZERO;
                }, false),
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.fromCssColorString('#00f0ff'),
                    outlineColor: Cesium.Color.fromCssColorString('#ff00ff'),
                    outlineWidth: 2
                },
                label: {
                    text: satellite.name,
                    font: '14px "Share Tech Mono"',
                    fillColor: Cesium.Color.fromCssColorString('#00f0ff'),
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10)
                }
            });
            this.satelliteEntities.set(id, entity);

            // Create trail entity
            const trailEntity = this.viewer.entities.add({
                name: `${satellite.name} Trail`,
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        const hist = this.satelliteHistory.get(id) || [];
                        return hist.map(p => Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, p.height));
                    }, false),
                    width: 2,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.3,
                        color: Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.6)
                    })
                }
            });
            this.trailEntities.set(id, trailEntity);
        }

        // Update current position
        this.currentPositions = this.currentPositions || {};
        this.currentPositions[id] = position;
    }

    getCurrentPosition(id) {
        return this.currentPositions ? this.currentPositions[id] : null;
    }

    removeSatellite(noradId) {
        if (this.satelliteEntities.has(noradId)) {
            this.viewer.entities.remove(this.satelliteEntities.get(noradId));
            this.satelliteEntities.delete(noradId);
        }
        if (this.trailEntities.has(noradId)) {
            this.viewer.entities.remove(this.trailEntities.get(noradId));
            this.trailEntities.delete(noradId);
        }
        this.satelliteHistory.delete(noradId);
        if (this.currentPositions) {
            delete this.currentPositions[noradId];
        }
    }

    clearAll() {
        this.satelliteEntities.forEach(entity => this.viewer.entities.remove(entity));
        this.trailEntities.forEach(entity => this.viewer.entities.remove(entity));
        this.satelliteEntities.clear();
        this.trailEntities.clear();
        this.satelliteHistory.clear();
        this.currentPositions = {};
    }

    destroy() {
        this.clearAll();
        if (this.observerEntity) {
            this.viewer.entities.remove(this.observerEntity);
        }
        this.viewer.destroy();
    }
}

window.CesiumView = CesiumView;
