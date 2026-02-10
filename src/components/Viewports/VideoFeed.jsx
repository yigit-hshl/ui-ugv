import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Radio, AlertCircle, RefreshCw } from 'lucide-react';
import { HUDOverlay } from './HUDOverlay';

export const VideoFeed = () => {
    const videoRef = useRef();
    const [status, setStatus] = useState('CONNECTED'); // CONNECTED, RECONNECTING, ERROR
    const [latency, setLatency] = useState(24);
    const [bitrate, setBitrate] = useState(4.2);

    // Simulate Stream Reconnection Logic
    useEffect(() => {
        let stuckTimer;

        const checkStream = () => {
            // In a real app, we check if video.currentTime is advancing
            // For now, we simulate a random connection drop
            if (Math.random() > 0.995 && status === 'CONNECTED') {
                triggerReconnect();
            }
        };

        const triggerReconnect = () => {
            setStatus('RECONNECTING');
            console.warn('[VideoFeed] Stream Connection Lost. Attempting Reconnect...');

            setTimeout(() => {
                setStatus('CONNECTED');
                console.log('[VideoFeed] Stream Reconnected.');
            }, 2000);
        };

        const interval = setInterval(checkStream, 100);
        return () => clearInterval(interval);
    }, [status]);

    // Simulate network stats
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
            {/* Video Element (Mock Source) */}
            <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                autoPlay
                muted
                loop
                playsInline
            >
                {/* 
                    Ideally this would be a WebRTC stream or HLS source.
                    For now using a reliable placeholder that looks "techy" or just noise 
                    Since we can't fetch external URLs easily without setup, we stick to the CSS gradient fallback 
                    if no source is provided, effectively 'hiding' this video tag and showing the background below.
                */}
            </video>

            {/* Signal Noise Background (Visible if video fails or acts as underlay) */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, #222 0%, #000 100%)',
                zIndex: -1
            }} />

            {/* HUD Layer */}
            <HUDOverlay />

            {/* Status Overlay */}
            {status === 'RECONNECTING' && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-warning)', zIndex: 50
                }}>
                    <RefreshCw className="spin" size={48} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>SIGNAL LOST</div>
                    <div style={{ fontSize: '0.8rem' }}>ATTEMPTING RECONNECTION...</div>
                </div>
            )}

            {/* Info Bar */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%',
                padding: '8px',
                display: 'flex', justifyContent: 'space-between',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        color: status === 'CONNECTED' ? 'var(--color-danger)' : '#666',
                        fontWeight: 'bold', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <div style={{
                            width: '8px', height: '8px',
                            background: status === 'CONNECTED' ? 'var(--color-danger)' : '#666',
                            borderRadius: '50%',
                            boxShadow: status === 'CONNECTED' ? '0 0 5px var(--color-danger)' : 'none'
                        }} />
                        REC
                    </span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontFamily: 'monospace' }}>CAM_01</span>
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

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
