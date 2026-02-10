/**
 * ControlStore
 * 
 * Manages the current control state of the UGV.
 * Handles mixing inputs from different sources (Gamepad, Virtual Joystick).
 */
class ControlStore {
    constructor() {
        this.subscribers = new Map();
        this.state = {
            linear: 0,  // -1 to 1 (Forward/Backward)
            angular: 0, // -1 to 1 (Left/Right)
            activeInput: 'NONE', // 'GAMEPAD', 'JOYSTICK', 'KEYBOARD', 'NONE'
            connectedGamepad: null, // String name or null
            eStop: false, // Emergency Stop Active
        };
    }

    /**
     * Update control state and notify subscribers
     * @param {Object} partialState 
     */
    update(partialState) {
        // Prevent updates if E-Stop is active (unless unsetting E-Stop)
        if (this.state.eStop && !partialState.hasOwnProperty('eStop')) {
            console.warn('[ControlStore] Command ignored due to E-STOP');
            return;
        }

        this.state = { ...this.state, ...partialState };
        this.notify();
    }

    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }

    subscribe(callback) {
        const id = Symbol();
        this.subscribers.set(id, callback);
        callback(this.state);
        return () => this.subscribers.delete(id);
    }

    get() {
        return this.state;
    }

    triggerEmergencyStop() {
        this.update({ eStop: true, linear: 0, angular: 0 });
        console.error('[ControlStore] EMERGENCY STOP TRIGGERED');
    }

    clearEmergencyStop() {
        this.update({ eStop: false });
        console.log('[ControlStore] Emergency Stop Cleared');
    }
}

export const controlStore = new ControlStore();
