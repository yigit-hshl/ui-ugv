import React, { useState, useEffect } from 'react';
import { Octagon, AlertTriangle } from 'lucide-react';
import { controlStore } from '../../stores/ControlStore';

export const EmergencyStop = () => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                toggleStop();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [active]);

    const toggleStop = () => {
        if (!active) {
            controlStore.triggerEmergencyStop();
            setActive(true);
        } else {
            // Require explicit click to disengage? Or logic
            controlStore.clearEmergencyStop();
            setActive(false);
        }
    };

    return (
        <button
            onClick={toggleStop}
            style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: active ? 'var(--color-danger)' : 'rgba(255, 0, 85, 0.2)',
                color: 'white',
                border: `2px solid var(--color-danger)`,
                padding: '12px 32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: active ? '0 0 30px var(--color-danger)' : '0 0 10px rgba(0,0,0,0.5)',
                zIndex: 100,
                transition: 'all 0.1s ease',
                animation: active ? 'pulse 0.5s infinite alternate' : 'none'
            }}
        >
            {active ? <AlertTriangle size={32} /> : <Octagon size={32} />}
            {active ? 'E-STOP ACTIVE' : 'EMERGENCY STOP'}

            <style>{`
                @keyframes pulse {
                    from { transform: translateX(-50%) scale(1); }
                    to { transform: translateX(-50%) scale(1.05); }
                }
            `}</style>
        </button>
    );
};
