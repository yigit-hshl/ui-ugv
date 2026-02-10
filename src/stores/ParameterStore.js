/**
 * ParameterStore
 * 
 * Manages UGV configuration parameters.
 * Implements "Safe-Write" logic where changes are pending until ACKed by the UGV.
 */
class ParameterStore {
    constructor() {
        this.subscribers = new Set();
        this.params = {
            velocity: {
                max_linear: 2.0,
                max_angular: 1.5,
                acceleration: 0.5
            },
            pid: {
                kp: 1.2,
                ki: 0.05,
                kd: 0.4
            },
            sensors: {
                lidar_offset_x: 0.2,
                lidar_offset_z: 0.1
            }
        };
        this.pendingACK = new Map(); // path -> value
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.get());
        return () => this.subscribers.delete(callback);
    }

    notify() {
        const state = this.get();
        this.subscribers.forEach(cb => cb(state));
    }

    get() {
        return {
            params: this.params,
            pending: Object.fromEntries(this.pendingACK)
        };
    }

    /**
     * Request a parameter change.
     * Starts "Syncing" state until ACK is received.
     */
    updateParam(path, value) {
        // Flattened path e.g. "pid.kp"
        console.log(`[ParameterStore] Requesting update: ${path} = ${value}`);
        this.pendingACK.set(path, value);
        this.notify();

        // Simulate Network ACK delay (random 200-800ms)
        setTimeout(() => {
            this.handleACK(path, value);
        }, 200 + Math.random() * 600);
    }

    handleACK(path, value) {
        console.log(`[ParameterStore] ACK Received: ${path}`);

        // Apply change locally
        const keys = path.split('.');
        let current = this.params;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        // Clear pending status
        this.pendingACK.delete(path);
        this.notify();
    }
}

export const parameterStore = new ParameterStore();
