<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SATELLITE PROXIMITY TRACKER // SYSTEM ONLINE</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://cesium.com/downloads/cesiumjs/releases/1.141/Build/Cesium/Cesium.js"></script>
    <link href="https://cesium.com/downloads/cesiumjs/releases/1.141/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
    <link rel="stylesheet" href="css/cyberpunk.css">
    <link rel="stylesheet" href="css/cesium-dark.css">
</head>
<body>
    <div id="app">
        <!-- Mode Switcher -->
        <div class="mode-switcher">
            <button class="mode-btn active" data-mode="2d">2D MAP</button>
            <button class="mode-btn" data-mode="3d">3D GLOBE</button>
            <button class="mode-btn" data-mode="ar">AR MODE</button>
            <button class="mode-btn iss-mode" data-mode="iss">ISS TRACK</button>
        </div>

        <!-- 2D Map Container -->
        <div id="map-container" class="view-container active">
            <div id="map"></div>
        </div>

        <!-- 3D Cesium Container -->
        <div id="cesium-container" class="view-container">
            <div id="cesiumContainer"></div>
        </div>

        <!-- AR Container -->
        <div id="ar-container" class="view-container">
            <video id="ar-video" autoplay playsinline></video>
            <canvas id="ar-canvas"></canvas>
            <div id="ar-overlay">
                <div class="ar-instructions">
                    <span class="blink">/// POINT CAMERA AT SKY ///</span>
                </div>
                <div id="ar-satellites"></div>
            </div>
        </div>

        <!-- ISS Mode Container -->
        <div id="iss-container" class="view-container">
            <div id="iss-cesiumContainer"></div>
            <div class="iss-hud">
                <div class="iss-live-feed">
                    <h3>ISS HD LIVE FEED</h3>
                    <iframe id="iss-video" src="https://www.youtube.com/embed/86YLFOog4GM?autoplay=0" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="iss-stats">
                    <h3>ISS TELEMETRY</h3>
                    <div id="iss-telemetry"></div>
                </div>
            </div>
        </div>

        <!-- HUD: Closest Satellite -->
        <div id="closest-sat" class="hud-panel">
            <div class="panel-header">
                <span class="blink">●</span> CLOSEST SATELLITE
            </div>
            <div class="panel-content">
                <div class="no-satellite">
                    <span class="blink">/// INITIALIZING SYSTEM ///</span>
                </div>
            </div>
        </div>

        <!-- HUD: Pass Predictions -->
        <div id="pass-predictions" class="hud-panel">
            <div class="panel-header">UPCOMING PASSES</div>
            <div class="panel-content" id="pass-list">
                <div class="loading">CALCULATING ORBITS...</div>
            </div>
        </div>

        <!-- HUD: Satellite List -->
        <div id="sat-list" class="hud-panel">
            <div class="panel-header">TRACKED SATELLITES</div>
            <div class="panel-content" id="tracked-sats">
                <div class="loading">LOADING TLE DATA...</div>
            </div>
        </div>

        <!-- HUD: Status Bar -->
        <div class="hud-panel status-bar">
            <div class="status-grid">
                <div class="status-item">
                    <span class="status-label">LOC</span>
                    <span id="loc-status" class="status-value">ACQUIRING...</span>
                </div>
                <div class="status-item">
                    <span class="status-label">SAT</span>
                    <span id="sat-count" class="status-value">0</span>
                </div>
                <div class="status-item">
                    <span class="status-label">VISIBLE</span>
                    <span id="visible-count" class="status-value">0</span>
                </div>
                <div class="status-item">
                    <span class="status-label">NEXT PASS</span>
                    <span id="next-pass-time" class="status-value">--:--</span>
                </div>
            </div>
        </div>

        <!-- Notification Toggle -->
        <div class="hud-panel notification-panel">
            <label class="toggle-switch">
                <input type="checkbox" id="notify-toggle">
                <span class="toggle-slider"></span>
                <span class="toggle-label">ALERTS</span>
            </label>
        </div>

        <!-- Audio Controls -->
        <div class="hud-panel audio-panel">
            <button id="audio-toggle" class="cyber-btn small">🔊</button>
            <input type="range" id="volume-slider" min="0" max="100" value="50">
        </div>

        <!-- Location Request Overlay -->
        <div id="loc-request" class="overlay">
            <div class="overlay-content">
                <h2 class="glitch-text">LOCATION ACCESS REQUIRED</h2>
                <p>Grant location access to calculate satellite proximity vectors.</p>
                <button id="grant-loc" class="cyber-btn">INITIALIZE</button>
            </div>
        </div>

        <!-- AR Permission Overlay -->
        <div id="ar-permission" class="overlay hidden">
            <div class="overlay-content">
                <h2 class="glitch-text">CAMERA ACCESS REQUIRED</h2>
                <p>AR mode requires camera access to overlay satellite positions.</p>
                <button id="grant-ar" class="cyber-btn">ENABLE AR</button>
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/satellite.js/4.1.4/satellite.min.js"></script>
    <script src="js/audioEngine.js"></script>
    <script src="js/satelliteEngine.js"></script>
    <script src="js/locationService.js"></script>
    <script src="js/passPredictor.js"></script>
    <script src="js/notificationService.js"></script>
    <script src="js/arEngine.js"></script>
    <script src="js/cesiumView.js"></script>
    <script src="js/issTracker.js"></script>
    <script src="js/uiController.js"></script>
    <script src="js/app.js"></script>
</body>
</html>