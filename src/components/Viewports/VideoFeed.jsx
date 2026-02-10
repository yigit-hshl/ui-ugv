import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Radio } from 'lucide-react';

export const VideoFeed = () => {
    const [latency, setLatency] = useState(24);
    const [bitrate, setBitrate] = useState(4.2);

    // Simulate network fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 10)));
            setBitrate(prev => Math.max(1, Math.min(8, prev + (Math.random() - 0.5) * 0.5)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Simulated Noise/Feed */}
            <div style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, #222 0%, #000 100%)',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#444',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
            }}>
                [VIDEO STREAM SIGNAL LOST]
            </div>

            {/* Overlay UI */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
            }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        color: 'var(--color-danger)',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            background: 'var(--color-danger)',
                            borderRadius: '50%',
                            boxShadow: '0 0 5px var(--color-danger)'
                        }} />
                        REC
                    </span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        CAM_01
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', color: 'var(--color-primary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Radio size={14} /> {latency.toFixed(0)}ms
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wifi size={14} /> {bitrate.toFixed(1)}Mb/s
                    </span>
                </div>
            </div>

            {/* Crosshair */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '20px',
                height: '20px',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '4px', background: 'rgba(0, 210, 255, 0.5)', transform: 'translate(-50%, -50%)' }} />
            </div>
        </div>
    );
};
