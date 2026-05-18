@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

:root {
    --neon-cyan: #00f0ff;
    --neon-magenta: #ff00ff;
    --neon-yellow: #f0ff00;
    --dark-bg: #0a0a12;
    --panel-bg: rgba(10, 10, 18, 0.92);
    --grid-color: rgba(0, 240, 255, 0.08);
    --danger-red: #ff0040;
    --success-green: #00ff80;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Share Tech Mono', monospace;
    background: var(--dark-bg);
    color: var(--neon-cyan);
    overflow: hidden;
    width: 100vw;
    height: 100vh;
}

body::before {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px);
    pointer-events: none;
    z-index: 9999;
}

body::after {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 9998;
    opacity: 0.3;
}

#app { width: 100vw; height: 100vh; position: relative; }

.view-container {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    display: none;
    z-index: 1;
}
.view-container.active { display: block; }

#map, #cesiumContainer, #iss-cesiumContainer { width: 100%; height: 100%; }

.mode-switcher {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 1000;
    background: var(--panel-bg);
    border: 1px solid var(--neon-cyan);
    padding: 8px;
    backdrop-filter: blur(10px);
}

.mode-btn {
    background: transparent;
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: var(--neon-cyan);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 2px;
}
.mode-btn:hover {
    background: rgba(0, 240, 255, 0.1);
    border-color: var(--neon-cyan);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}
.mode-btn.active {
    background: var(--neon-cyan);
    color: var(--dark-bg);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
}
.iss-mode { border-color: var(--neon-magenta); color: var(--neon-magenta); }
.iss-mode.active { background: var(--neon-magenta); color: var(--dark-bg); }

.hud-panel {
    position: absolute;
    background: var(--panel-bg);
    border: 1px solid var(--neon-cyan);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.15), inset 0 0 30px rgba(0, 240, 255, 0.03);
    backdrop-filter: blur(12px);
    z-index: 500;
    overflow: hidden;
}
.hud-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
    animation: scan-line 3s linear infinite;
}
@keyframes scan-line { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

.panel-header {
    font-size: 0.7rem;
    letter-spacing: 3px;
    color: var(--neon-magenta);
    padding: 10px 15px;
    border-bottom: 1px solid rgba(255, 0, 255, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
}
.panel-content {
    padding: 15px;
    max-height: 300px;
    overflow-y: auto;
}
.panel-content::-webkit-scrollbar { width: 4px; }
.panel-content::-webkit-scrollbar-track { background: rgba(0, 240, 255, 0.05); }
.panel-content::-webkit-scrollbar-thumb { background: var(--neon-cyan); }

#closest-sat { top: 80px; right: 20px; width: 340px; min-height: 220px; }
#pass-predictions { top: 80px; left: 20px; width: 300px; max-height: 400px; }
#sat-list { bottom: 80px; left: 20px; width: 280px; max-height: 300px; }
.status-bar { bottom: 20px; right: 20px; width: auto; min-width: 400px; }
.notification-panel { top: 80px; right: 380px; width: auto; padding: 10px 15px; }
.audio-panel { top: 80px; right: 520px; width: auto; padding: 10px 15px; display: flex; align-items: center; gap: 10px; }

.status-grid { display: flex; gap: 25px; padding: 10px 15px; }
.status-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.status-label { font-size: 0.6rem; color: rgba(0, 240, 255, 0.5); letter-spacing: 2px; }
.status-value { font-size: 1rem; color: var(--neon-cyan); text-shadow: 0 0 8px var(--neon-cyan); }

.satellite-card {
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 10px;
    margin-bottom: 8px;
    background: rgba(0, 240, 255, 0.03);
    transition: all 0.3s;
    cursor: pointer;
}
.satellite-card:hover {
    border-color: var(--neon-cyan);
    background: rgba(0, 240, 255, 0.08);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}
.satellite-card.closest {
    border-color: var(--neon-magenta);
    background: rgba(255, 0, 255, 0.08);
    animation: pulse-border 2s infinite;
}
@keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 0, 255, 0.3); }
    50% { box-shadow: 0 0 20px rgba(255, 0, 255, 0.6); }
}

.sat-name { font-size: 0.9rem; color: var(--neon-cyan); margin-bottom: 5px; text-shadow: 0 0 5px var(--neon-cyan); }
.sat-data { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem; }
.sat-data span { color: rgba(0, 240, 255, 0.7); }
.sat-data .value { color: var(--neon-cyan); text-align: right; }

.pass-card {
    border-left: 3px solid var(--neon-cyan);
    padding: 8px 12px;
    margin-bottom: 8px;
    background: rgba(0, 240, 255, 0.03);
}
.pass-card.high-priority {
    border-left-color: var(--neon-magenta);
    background: rgba(255, 0, 255, 0.05);
}
.pass-time { font-size: 0.85rem; color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); }
.pass-details { font-size: 0.7rem; color: rgba(0, 240, 255, 0.6); margin-top: 4px; }
.pass-countdown { font-size: 0.75rem; color: var(--neon-yellow); margin-top: 4px; }

.closest-display .sat-name { font-size: 1.4rem; margin-bottom: 15px; animation: glitch 3s infinite; }
.closest-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-box { border: 1px solid rgba(0, 240, 255, 0.2); padding: 10px; text-align: center; }
.stat-box .label { font-size: 0.65rem; color: rgba(0, 240, 255, 0.5); letter-spacing: 2px; margin-bottom: 5px; }
.stat-box .value { font-size: 1.2rem; color: var(--neon-cyan); text-shadow: 0 0 10px var(--neon-cyan); }
.stat-box.highlight .value { color: var(--neon-magenta); text-shadow: 0 0 10px var(--neon-magenta); }

.no-satellite { text-align: center; padding: 30px 0; color: rgba(0, 240, 255, 0.4); }

.cyber-btn {
    background: transparent;
    border: 2px solid var(--neon-cyan);
    color: var(--neon-cyan);
    font-family: 'Share Tech Mono', monospace;
    font-size: 1rem;
    padding: 12px 30px;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 3px;
    position: relative;
    overflow: hidden;
}
.cyber-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent);
    transition: left 0.5s;
}
.cyber-btn:hover::before { left: 100%; }
.cyber-btn:hover {
    background: rgba(0, 240, 255, 0.1);
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
    text-shadow: 0 0 10px var(--neon-cyan);
}
.cyber-btn.small { padding: 6px 12px; font-size: 0.8rem; }

.toggle-switch { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.toggle-switch input { display: none; }
.toggle-slider {
    width: 40px; height: 20px;
    background: rgba(0, 240, 255, 0.2);
    border: 1px solid var(--neon-cyan);
    position: relative;
    transition: all 0.3s;
}
.toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 14px; height: 14px;
    background: var(--neon-cyan);
    transition: all 0.3s;
    box-shadow: 0 0 10px var(--neon-cyan);
}
.toggle-switch input:checked + .toggle-slider {
    background: rgba(0, 240, 255, 0.3);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}
.toggle-switch input:checked + .toggle-slider::after {
    left: 22px;
    background: var(--neon-magenta);
    box-shadow: 0 0 10px var(--neon-magenta);
}
.toggle-label { font-size: 0.7rem; letter-spacing: 2px; }

#volume-slider {
    -webkit-appearance: none;
    width: 80px; height: 4px;
    background: rgba(0, 240, 255, 0.2);
    outline: none;
}
#volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px; height: 12px;
    background: var(--neon-cyan);
    cursor: pointer;
    box-shadow: 0 0 10px var(--neon-cyan);
}

.overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(10, 10, 18, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}
.overlay.hidden { display: none; }
.overlay-content {
    text-align: center;
    padding: 40px;
    border: 2px solid var(--neon-cyan);
    background: var(--panel-bg);
    box-shadow: 0 0 50px rgba(0, 240, 255, 0.2);
    max-width: 500px;
}
.overlay-content h2 { font-size: 1.5rem; margin-bottom: 20px; color: var(--neon-cyan); }
.overlay-content p { color: rgba(0, 240, 255, 0.7); margin-bottom: 30px; line-height: 1.6; }

.glitch-text { position: relative; animation: glitch 3s infinite; }
@keyframes glitch {
    0%, 90%, 100% { transform: translate(0); text-shadow: 0 0 10px var(--neon-cyan); }
    92% { transform: translate(-2px, 1px); text-shadow: -2px 0 var(--neon-magenta), 2px 0 var(--neon-cyan); }
    94% { transform: translate(2px, -1px); text-shadow: 2px 0 var(--neon-magenta), -2px 0 var(--neon-cyan); }
    96% { transform: translate(-1px, 2px); text-shadow: 0 0 20px var(--neon-cyan); }
}

.blink { animation: blink 1.5s infinite; }
@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0.2; } }

.loading { text-align: center; padding: 20px; color: rgba(0, 240, 255, 0.5); font-size: 0.8rem; }

#ar-container { background: #000; }
#ar-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
#ar-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
#ar-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
.ar-instructions { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 1.2rem; color: var(--neon-cyan); text-shadow: 0 0 20px var(--neon-cyan); }

.ar-satellite-marker { position: absolute; transform: translate(-50%, -50%); text-align: center; pointer-events: auto; }
.ar-sat-marker-dot { width: 20px; height: 20px; background: var(--neon-cyan); border-radius: 50%; box-shadow: 0 0 20px var(--neon-cyan); margin: 0 auto 5px; animation: ar-pulse 2s infinite; }
@keyframes ar-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.7; } }
.ar-sat-marker-label { background: var(--panel-bg); border: 1px solid var(--neon-cyan); padding: 4px 8px; font-size: 0.7rem; color: var(--neon-cyan); white-space: nowrap; }

#iss-container { display: flex; }
#iss-cesiumContainer { width: 60%; height: 100%; }
.iss-hud { width: 40%; height: 100%; background: var(--panel-bg); border-left: 2px solid var(--neon-magenta); padding: 20px; overflow-y: auto; }
.iss-live-feed { margin-bottom: 30px; }
.iss-live-feed h3 { color: var(--neon-magenta); font-size: 0.9rem; letter-spacing: 3px; margin-bottom: 15px; border-bottom: 1px solid var(--neon-magenta); padding-bottom: 10px; }
.iss-live-feed iframe { width: 100%; height: 250px; border: 1px solid var(--neon-magenta); box-shadow: 0 0 20px rgba(255, 0, 255, 0.2); }
.iss-stats h3 { color: var(--neon-magenta); font-size: 0.9rem; letter-spacing: 3px; margin-bottom: 15px; }
.telemetry-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.telemetry-item { border: 1px solid rgba(255, 0, 255, 0.3); padding: 10px; text-align: center; }
.telemetry-item .label { font-size: 0.65rem; color: rgba(255, 0, 255, 0.6); letter-spacing: 2px; margin-bottom: 5px; }
.telemetry-item .value { font-size: 1.1rem; color: var(--neon-magenta); text-shadow: 0 0 10px var(--neon-magenta); }

.sat-popup { background: var(--panel-bg) !important; border: 1px solid var(--neon-cyan) !important; color: var(--neon-cyan) !important; font-family: 'Share Tech Mono', monospace !important; padding: 15px !important; min-width: 220px; }
.sat-popup h3 { color: var(--neon-magenta); margin-bottom: 10px; font-size: 1rem; }
.popup-data { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 0.8rem; }
.popup-data .label { color: rgba(0, 240, 255, 0.6); }
.popup-data .value { color: var(--neon-cyan); text-align: right; }

.leaflet-popup-content-wrapper { background: var(--panel-bg) !important; border: 1px solid var(--neon-cyan) !important; border-radius: 0 !important; box-shadow: 0 0 20px rgba(0, 240, 255, 0.2) !important; }
.leaflet-popup-tip { background: var(--neon-cyan) !important; }
.leaflet-container { background: var(--dark-bg) !important; }

.notification-toast {
    position: fixed;
    top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: var(--panel-bg);
    border: 2px solid var(--neon-magenta);
    padding: 15px 30px;
    z-index: 10001;
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
}
.notification-toast.show { transform: translateX(-50%) translateY(0); }
.notification-toast h4 { color: var(--neon-magenta); font-size: 0.9rem; margin-bottom: 5px; }
.notification-toast p { color: var(--neon-cyan); font-size: 0.8rem; }

@media (max-width: 768px) {
    .mode-switcher { flex-wrap: wrap; width: 90%; justify-content: center; }
    .mode-btn { font-size: 0.6rem; padding: 6px 10px; }
    #closest-sat, #pass-predictions, #sat-list { width: 90%; left: 5%; right: 5%; }
    #closest-sat { top: 120px; }
    #pass-predictions { top: auto; bottom: 300px; }
    #sat-list { bottom: 80px; }
    .status-bar { width: 90%; left: 5%; right: 5%; min-width: auto; }
    .notification-panel, .audio-panel { display: none; }
    .iss-hud { width: 100%; height: 50%; position: absolute; bottom: 0; }
    #iss-cesiumContainer { width: 100%; height: 50%; }
}
