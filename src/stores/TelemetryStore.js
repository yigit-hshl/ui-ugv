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
    mockInterval = setInterval(() => {
        t += 0.02; // 50Hz

        // Simulate motion
        const roll = Math.sin(t * 0.5) * 0.1;
        const pitch = Math.cos(t * 0.3) * 0.1;
        const yaw = t * 0.1;

        telemetryStore.update({
            imu: { roll, pitch, yaw },
            odometry: {
                x: Math.cos(t * 0.1) * 5,
                y: Math.sin(t * 0.1) * 5,
                z: 0
            },
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
