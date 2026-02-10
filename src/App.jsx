import { useEffect } from 'react';
import { MissionLayout } from './components/Layout/MissionLayout';
import { startMockTelemetry } from './stores/TelemetryStore';

function App() {
    useEffect(() => {
        // Start mock data for development
        startMockTelemetry();
        return () => {
            // connecting strictly once might be tricky in StrictMode
        };
    }, []);

    return (
        <MissionLayout />
    );
}

export default App;
