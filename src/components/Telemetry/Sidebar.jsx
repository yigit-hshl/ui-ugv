import React, { useEffect, useRef } from 'react';
import { Activity, Battery, Compass, Move } from 'lucide-react';
import { telemetryStore } from '../../stores/TelemetryStore';

// Reusable Widget Container
const Widget = ({ title, icon: Icon, children }) => (
    <div style={{
        marginBottom: '1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        padding: '0.8rem'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0.8rem',
            color: 'var(--color-primary)',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '4px'
        }}>
            <Icon size={16} />
            {title}
        </div>
        {children}
    </div>
);

// High-Performance Value Display (No Re-renders)
const ValueDisplay = ({ label, unit, topic, selector }) => {
    const valueRef = useRef();

    useEffect(() => {
        return telemetryStore.subscribe(topic, (data) => {
            if (valueRef.current) {
                const val = selector(data);
                valueRef.current.textContent = typeof val === 'number' ? val.toFixed(2) : val;
            }
        });
    }, [topic, selector]);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            <span>
                <span ref={valueRef}>0.00</span>
                {unit && <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>{unit}</span>}
            </span>
        </div>
    );
};

export const Sidebar = () => {
    // Direct DOM refs for visualizers (bars, rotations)
    const rollBarRef = useRef();
    const pitchBarRef = useRef();
    const batteryFillRef = useRef();

    useEffect(() => {
        const unsubIMU = telemetryStore.subscribe('imu', (imu) => {
            // Update Visual Bars
            if (rollBarRef.current) {
                const percent = 50 + (imu.roll * 50); // Scale roughly
                rollBarRef.current.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            }
        });

        const unsubBatt = telemetryStore.subscribe('battery', (batt) => {
            if (batteryFillRef.current) {
                batteryFillRef.current.style.width = `${batt.percentage}%`;
                batteryFillRef.current.style.background = batt.percentage < 20 ? 'var(--color-danger)' : 'var(--color-success)';
            }
        });

        return () => {
            unsubIMU();
            unsubBatt();
        };
    }, []);

    return (
        <div style={{ padding: '1rem', color: 'var(--color-text-main)', height: '100%', overflowY: 'auto' }}>

            {/* IMU WIDGET */}
            <Widget title="INERTIAL MEASUREMENT" icon={Compass}>
                <ValueDisplay topic="imu" label="ROLL" unit="rad" selector={d => d.roll} />
                <div style={{ height: '4px', background: '#333', marginBottom: '8px', borderRadius: '2px' }}>
                    <div ref={rollBarRef} style={{ height: '100%', width: '50%', background: 'var(--color-primary)', transition: 'width 0.1s linear' }} />
                </div>

                <ValueDisplay topic="imu" label="PITCH" unit="rad" selector={d => d.pitch} />
                <ValueDisplay topic="imu" label="YAW" unit="rad" selector={d => d.yaw} />
            </Widget>

            {/* ODOMETRY WIDGET */}
            <Widget title="ODOMETRY (LOCAL)" icon={Move}>
                <ValueDisplay topic="odometry" label="POS X" unit="m" selector={d => d.x} />
                <ValueDisplay topic="odometry" label="POS Y" unit="m" selector={d => d.y} />
                <ValueDisplay topic="odometry" label="POS Z" unit="m" selector={d => d.z} />
            </Widget>

            {/* BATTERY WIDGET */}
            <Widget title="POWER SYSTEMS" icon={Battery}>
                <div style={{
                    height: '24px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    marginBottom: '8px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div ref={batteryFillRef} style={{
                        height: '100%',
                        width: '0%',
                        background: 'var(--color-success)',
                        transition: 'width 0.5s ease'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px black'
                    }}>
                        <ValueDisplay topic="battery" label="" unit="%" selector={d => d.percentage.toFixed(0)} />
                    </div>
                </div>
                <ValueDisplay topic="battery" label="VOLTAGE" unit="V" selector={d => d.voltage} />
            </Widget>

            {/* SYSTEM STATUS */}
            <Widget title="SYSTEM HEALTH" icon={Activity}>
                <ValueDisplay topic="latency" label="LINK LATENCY" unit="ms" selector={d => d.toFixed(1)} />
            </Widget>

        </div>
    );
};
