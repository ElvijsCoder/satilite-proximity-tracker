/**
 * Pass Predictor
 * Calculates upcoming satellite passes for the observer's location
 */
class PassPredictor {
    constructor(satelliteEngine) {
        this.satEngine = satelliteEngine;
        this.predictionWindow = 48; // hours ahead
        this.timeStep = 30; // seconds between samples
    }

    async calculatePasses(observerLat, observerLon, satellite) {
        const passes = [];
        const now = new Date();
        const endTime = new Date(now.getTime() + this.predictionWindow * 3600 * 1000);

        let currentTime = new Date(now);
        let inPass = false;
        let currentPass = null;

        // Sample every 30 seconds
        while (currentTime < endTime) {
            const pos = this.satEngine.calculatePosition(
                satellite, observerLat, observerLon, 0, currentTime
            );

            if (pos) {
                if (pos.elevation > 0 && !inPass) {
                    // Pass starts
                    inPass = true;
                    currentPass = {
                        satellite: satellite.name,
                        startTime: new Date(currentTime),
                        startAzimuth: pos.azimuth,
                        maxElevation: pos.elevation,
                        maxElevationTime: new Date(currentTime),
                        endTime: null,
                        endAzimuth: null,
                        duration: 0,
                        isBright: pos.isSunlit && pos.elevation > 20
                    };
                } else if (pos.elevation > 0 && inPass) {
                    // During pass, track max elevation
                    if (pos.elevation > currentPass.maxElevation) {
                        currentPass.maxElevation = pos.elevation;
                        currentPass.maxElevationTime = new Date(currentTime);
                    }
                } else if (pos.elevation <= 0 && inPass) {
                    // Pass ends
                    inPass = false;
                    currentPass.endTime = new Date(currentTime);
                    currentPass.endAzimuth = pos.azimuth;
                    currentPass.duration = (currentPass.endTime - currentPass.startTime) / 1000;

                    if (currentPass.duration > 60) { // Only passes > 1 minute
                        passes.push(currentPass);
                    }
                    currentPass = null;
                }
            }

            currentTime = new Date(currentTime.getTime() + this.timeStep * 1000);
        }

        return passes;
    }

    async calculateAllPasses(observerLat, observerLon, satellites) {
        const allPasses = [];

        for (const sat of satellites) {
            const passes = await this.calculatePasses(observerLat, observerLon, sat);
            allPasses.push(...passes);
        }

        // Sort by start time
        return allPasses.sort((a, b) => a.startTime - b.startTime);
    }

    // Get next N passes
    async getNextPasses(observerLat, observerLon, satellites, count = 10) {
        const allPasses = await this.calculateAllPasses(observerLat, observerLon, satellites);
        return allPasses.slice(0, count);
    }

    // Format pass time for display
    formatPassTime(date) {
        const now = new Date();
        const diff = date - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    // Format absolute time
    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Check if a pass is happening soon (within 15 minutes)
    isPassSoon(pass) {
        const now = new Date();
        const diff = pass.startTime - now;
        return diff > 0 && diff < 15 * 60000;
    }
}

window.PassPredictor = PassPredictor;
