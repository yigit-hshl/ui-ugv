/**
 * TelemetryStore
 * 
 * Handles high-frequency data updates (10-50Hz) without triggering React re-renders.
 * Components subscribe to specific topics or poll the latest state via refs/requestAnimationFrame.
 */

class TelemetryStore {
    constructor() {
        this.subscribers = new Map();
        this.state = {
            imu: { roll: 0, pitch: 0, yaw: 0 },
            odometry: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
            battery: { voltage: 0, current: 0, percentage: 0 },
            path: [], // Array of {x, y, z}
            occupancyGrid: null, // Float32Array or similar
            status: 'DISCONNECTED', // CONNECTED, ERROR
            latency: 0,
        };
    }

    /**
     * Update telemetry state and notify subscribers
     * @param {Object} partialState - Object containing updates
     */
    update(partialState) {
        // Merge state (shallow merge for performance)
        this.state = { ...this.state, ...partialState };

        // Notify subscribers based on changed keys
        Object.keys(partialState).forEach(key => {
            if (this.subscribers.has(key)) {
                this.subscribers.get(key).forEach(callback => callback(this.state[key]));
            }
        });
    }

    /**
     * Subscribe to a specific telemetry topic
     * @param {string} topic - 'imu', 'odometry', 'battery', 'status'
     * @param {function} callback - Function to call with new data
     * @returns {function} unsubscribe function
     */
    subscribe(topic, callback) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        this.subscribers.get(topic).add(callback);

        // Initial call
        if (this.state[topic]) {
            callback(this.state[topic]);
        }

        return () => {
            if (this.subscribers.has(topic)) {
                this.subscribers.get(topic).delete(callback);
            }
        };
    }

    /**
     * Get current state snapshot
     */
    get() {
        return this.state;
    }
}

// Singleton instance
export const telemetryStore = new TelemetryStore();

// Mock Data Generator for Development
let mockInterval = null;

export const startMockTelemetry = () => {
    if (mockInterval) return;

    console.log('[TelemetryStore] Starting mock data stream at 50Hz');

    let t = 0;
    const pathHistory = [];

    // Generate static occupancy grid once
    const gridSize = 100;
    const gridData = new Float32Array(gridSize * gridSize);
    for (let i = 0; i < gridData.length; i++) {
        // Simple Perlin-ish noise or random blocks
        gridData[i] = Math.random() > 0.8 ? 1 : 0;
    }
    // Clear center for robot
    for (let x = 40; x < 60; x++) {
        for (let y = 40; y < 60; y++) {
            gridData[x + y * gridSize] = 0;
        }
    }

    mockInterval = setInterval(() => {
        t += 0.02; // 50Hz

        // Simulate motion
        const roll = Math.sin(t * 0.5) * 0.1;
        const pitch = Math.cos(t * 0.3) * 0.1;
        const yaw = t * 0.1;

        const x = Math.cos(t * 0.1) * 5;
        const y = Math.sin(t * 0.1) * 5;

        // Update Path (limit to last 1000 points)
        if (pathHistory.length > 1000) pathHistory.shift();
        pathHistory.push({ x, y, z: 0 });

        telemetryStore.update({
            imu: { roll, pitch, yaw },
            odometry: { x, y, z: 0 },
            path: [...pathHistory], // Create new reference
            occupancyGrid: t < 0.1 ? gridData : undefined, // Send once initially (or optimize to send delta)
            battery: {
                voltage: 24.5 + Math.random() * 0.1,
                percentage: 85 - (t * 0.1),
            },
            latency: 15 + Math.random() * 5
        });

    }, 20); // 20ms = 50Hz
};

export const stopMockTelemetry = () => {
    if (mockInterval) {
        clearInterval(mockInterval);
        mockInterval = null;
        console.log('[TelemetryStore] Stopped mock data stream');
    }
};
