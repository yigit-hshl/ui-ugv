import { controlStore } from '../stores/ControlStore';

/**
 * GamepadManager
 * 
 * Polls the Gamepad API and updates the ControlStore.
 * Implements dead-zone and axis mapping.
 */
class GamepadManager {
    constructor() {
        this.pollingInterval = null;
        this.gamepadIndex = null;
        this.deadzone = 0.1;
    }

    start() {
        window.addEventListener("gamepadconnected", this.handleConnect);
        window.addEventListener("gamepaddisconnected", this.handleDisconnect);
    }

    stop() {
        window.removeEventListener("gamepadconnected", this.handleConnect);
        window.removeEventListener("gamepaddisconnected", this.handleDisconnect);
        this.stopPolling();
    }

    handleConnect = (e) => {
        console.log("[GamepadManager] Connected:", e.gamepad.id);
        this.gamepadIndex = e.gamepad.index;
        controlStore.update({ connectedGamepad: e.gamepad.id });
        this.startPolling();
    };

    handleDisconnect = (e) => {
        console.log("[GamepadManager] Disconnected:", e.gamepad.id);
        if (this.gamepadIndex === e.gamepad.index) {
            this.gamepadIndex = null;
            controlStore.update({ connectedGamepad: null, activeInput: 'NONE' });
            this.stopPolling();
        }
    };

    startPolling() {
        if (!this.pollingInterval) {
            this.pollingInterval = requestAnimationFrame(this.poll);
        }
    }

    stopPolling() {
        if (this.pollingInterval) {
            cancelAnimationFrame(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    poll = () => {
        if (this.gamepadIndex !== null) {
            const gamepad = navigator.getGamepads()[this.gamepadIndex];
            if (gamepad) {
                this.processInput(gamepad);
            }
        }
        this.pollingInterval = requestAnimationFrame(this.poll);
    };

    processInput(gamepad) {
        // Standard Mapping (Xbox/DualSense)
        // Axis 1: Left Stick Y (Linear)
        // Axis 2: Right Stick X (Angular)

        let linear = -gamepad.axes[1]; // Invert Y
        let angular = -gamepad.axes[2]; // Right Stick X

        // Deadzone
        if (Math.abs(linear) < this.deadzone) linear = 0;
        if (Math.abs(angular) < this.deadzone) angular = 0;

        // Only update if input is detected to avoid overriding other controls
        if (Math.abs(linear) > 0 || Math.abs(angular) > 0) {
            controlStore.update({
                linear,
                angular,
                activeInput: 'GAMEPAD'
            });
        }
    }
}

export const gamepadManager = new GamepadManager();
