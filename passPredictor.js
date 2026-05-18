/**
 * Satellite Engine
 * Fetches TLE data and calculates real-time satellite positions
 */
class SatelliteEngine {
    constructor() {
        this.satellites = [];
        this.tleUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle';
        this.lastFetch = null;
        this.cacheDuration = 3600000; // 1 hour
    }

    async fetchTLEData() {
        // Check cache
        if (this.lastFetch && (Date.now() - this.lastFetch) < this.cacheDuration) {
            return this.satellites;
        }

        try {
            // Use a CORS proxy or fetch directly if supported
            const response = await fetch(this.tleUrl);
            if (!response.ok) throw new Error('Failed to fetch TLE data');

            const tleText = await response.text();
            this.satellites = this.parseTLEs(tleText);
            this.lastFetch = Date.now();

            return this.satellites;
        } catch (error) {
            console.warn('Failed to fetch TLE, using fallback:', error);
            // Return demo data if fetch fails
            return this.getDemoData();
        }
    }

    parseTLEs(tleText) {
        const lines = tleText.trim().split('\n');
        const satellites = [];

        for (let i = 0; i < lines.length; i += 3) {
            if (i + 2 >= lines.length) break;

            const name = lines[i].trim();
            const line1 = lines[i + 1].trim();
            const line2 = lines[i + 2].trim();

            if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
                satellites.push({
                    name: name,
                    line1: line1,
                    line2: line2,
                    noradId: line2.substring(2, 7).trim()
                });
            }
        }

        return satellites;
    }

    getDemoData() {
        // ISS TLE (approximate, for demo purposes)
        return [
            {
                name: 'ISS (ZARYA)',
                line1: '1 25544U 98067A   24138.50000000  .00020000  00000-0  28000-4 0  9999',
                line2: '2 25544  51.6416 247.4627 0006703 130.5360 229.5775 15.509955193  1234',
                noradId: '25544'
            },
            {
                name: 'HST',
                line1: '1 20580U 90037B   24138.50000000  .00001000  00000-0  10000-4 0  9999',
                line2: '2 20580  28.4699 288.4772 0002809  30.5199 329.5830 15.096910012  5678',
                noradId: '20580'
            }
        ];
    }

    calculatePosition(satellite, observerLat, observerLon, observerAlt = 0, date = new Date()) {
        try {
            const satrec = satelliteJS.twoline2satrec(satellite.line1, satellite.line2);
            const positionAndVelocity = satelliteJS.propagate(satrec, date);

            if (!positionAndVelocity.position) {
                return null;
            }

            const gmst = satelliteJS.gstime(date);
            const geodetic = satelliteJS.eciToGeodetic(positionAndVelocity.position, gmst);

            const satLat = satelliteJS.degreesLat(geodetic.latitude);
            const satLon = satelliteJS.degreesLong(geodetic.longitude);
            const satAlt = geodetic.height;

            // Calculate look angles from observer to satellite
            const observerGeodetic = {
                longitude: satelliteJS.degreesToRadians(observerLon),
                latitude: satelliteJS.degreesToRadians(observerLat),
                height: observerAlt / 1000 // Convert to km
            };

            const positionEcf = satelliteJS.eciToEcf(positionAndVelocity.position, gmst);
            const lookAngles = satelliteJS.ecfToLookAngles(observerGeodetic, positionEcf);

            const azimuth = satelliteJS.degreesAz(lookAngles.azimuth);
            const elevation = satelliteJS.degreesEl(lookAngles.elevation);
            const rangeSat = lookAngles.rangeSat;

            // Check if satellite is in sunlight (simplified)
            const isSunlit = this.isSatelliteSunlit(positionAndVelocity.position, date);

            return {
                name: satellite.name,
                noradId: satellite.noradId,
                lat: satLat,
                lon: satLon,
                alt: satAlt,
                azimuth: azimuth,
                elevation: elevation,
                range: rangeSat,
                velocity: Math.sqrt(
                    positionAndVelocity.velocity.x ** 2 +
                    positionAndVelocity.velocity.y ** 2 +
                    positionAndVelocity.velocity.z ** 2
                ),
                isVisible: elevation > 0,
                isSunlit: isSunlit,
                timestamp: date
            };
        } catch (error) {
            console.error('Error calculating position for', satellite.name, error);
            return null;
        }
    }

    isSatelliteSunlit(eciPosition, date) {
        // Simplified sunlit calculation
        // In a full implementation, you'd calculate the sun's position and check if the satellite
        // is in Earth's shadow
        const hour = date.getUTCHours();
        // Very rough approximation - not accurate but works for demo
        return hour > 6 && hour < 18;
    }

    // Calculate position for Cesium (needs Cartesian3)
    calculatePositionForCesium(satellite, date = new Date()) {
        try {
            const satrec = satelliteJS.twoline2satrec(satellite.line1, satellite.line2);
            const positionAndVelocity = satelliteJS.propagate(satrec, date);

            if (!positionAndVelocity.position) return null;

            const gmst = satelliteJS.gstime(date);
            const geodetic = satelliteJS.eciToGeodetic(positionAndVelocity.position, gmst);

            return {
                longitude: satelliteJS.degreesLong(geodetic.longitude),
                latitude: satelliteJS.degreesLat(geodetic.latitude),
                height: geodetic.height * 1000 // Convert to meters for Cesium
            };
        } catch (error) {
            return null;
        }
    }

    // Get all visible satellites sorted by range
    getVisibleSatellites(observerLat, observerLon, satellites = this.satellites) {
        const now = new Date();
        const visible = [];

        for (const sat of satellites) {
            const pos = this.calculatePosition(sat, observerLat, observerLon, 0, now);
            if (pos && pos.isVisible) {
                visible.push(pos);
            }
        }

        return visible.sort((a, b) => a.range - b.range);
    }

    // Get satellite by name
    getSatelliteByName(name) {
        return this.satellites.find(s => 
            s.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    // Get ISS specifically
    getISS() {
        return this.getSatelliteByName('ISS');
    }
}

window.SatelliteEngine = SatelliteEngine;
