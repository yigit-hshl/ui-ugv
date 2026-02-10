import { useEffect } from 'react';
import { MissionLayout } from './components/Layout/MissionLayout';
import { startMockTelemetry } from './stores/TelemetryStore';
import { gamepadManager } from './managers/GamepadManager';

function App() {
    useEffect(() => {
        // Start mock data for development
        startMockTelemetry();

        // Start Gamepad Listener
        gamepadManager.start();

        return () => {
            gamepadManager.stop();
        };
    }, []);

    return (
        <MissionLayout />
    );
}

export default App;
