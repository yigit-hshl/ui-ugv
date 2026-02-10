import React, { useRef, useEffect, useState } from 'react';
import { telemetryStore } from '../../stores/TelemetryStore';

export const HUDOverlay = () => {
    const [imu, setImu] = useState({ roll: 0, pitch: 0, yaw: 0 });

    useEffect(() => {
        return telemetryStore.subscribe('imu', setImu);
    }, []);

    // Pitch conversion: 1 degree approx 5px shift
    // Roll: Rotate the entire horizon line
    // Yaw: Slide the compass tape

    const pitchOffset = imu.pitch * (180 / Math.PI) * 5;
    const rollDeg = -imu.roll * (180 / Math.PI);
    const yawDeg = (imu.yaw * (180 / Math.PI)) % 360;
    const normalizedYaw = yawDeg < 0 ? 360 + yawDeg : yawDeg;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            {/* Artificial Horizon */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: '60%', height: '2px',
                background: 'rgba(0, 210, 255, 0.5)',
                transform: `translate(-50%, -50%) rotate(${rollDeg}deg) translateY(${pitchOffset}px)`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ width: '40px', height: '10px', border: '2px solid rgba(0, 210, 255, 0.5)', borderTop: 'none' }} />
                <div style={{ width: '40px', height: '10px', border: '2px solid rgba(0, 210, 255, 0.5)', borderTop: 'none' }} />
            </div>

            {/* Pitch Ladder (Static Center Reference) */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px', height: '20px',
                border: '2px solid rgba(255, 210, 0, 0.7)',
                borderRadius: '50%',
                boxShadow: '0 0 5px rgba(0,0,0,0.5)'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: '100%', width: '15px', height: '2px', background: 'rgba(255, 210, 0, 0.7)' }} />
                <div style={{ position: 'absolute', top: '50%', right: '100%', width: '15px', height: '2px', background: 'rgba(255, 210, 0, 0.7)' }} />
            </div>

            {/* Compass Tape */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '300px',
                height: '40px',
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8), transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '40px',
                    transform: `translateX(${-normalizedYaw * 5}px)`, // 1deg = 5px
                    transition: 'transform 0.1s linear'
                }}>
                    {Array.from({ length: 72 }).map((_, i) => { // 360 / 5 = 72 markers
                        const deg = i * 5;
                        let label = '';
                        if (deg % 90 === 0) label = deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W';
                        else if (deg % 45 === 0) label = `${deg}`;

                        return (
                            <div key={i} style={{
                                width: '2px',
                                height: deg % 45 === 0 ? '15px' : '8px',
                                background: 'white',
                                position: 'relative'
                            }}>
                                {label && <span style={{
                                    position: 'absolute', top: '20px', left: '-50%',
                                    color: 'var(--color-primary)', fontWeight: 'bold'
                                }}>{label}</span>}
                            </div>
                        );
                    })}
                </div>
                {/* Center Indicator */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid var(--color-warning)' }} />
            </div>

            {/* Data Stats */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <div>R: {rollDeg.toFixed(1)}°</div>
                <div>P: {imu.pitch.toFixed(1)}°</div>
            </div>
        </div>
    );
};
