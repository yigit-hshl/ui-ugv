import React, { useState } from 'react';
import { Settings, Save, X } from 'lucide-react';

const SliderControl = ({ label, value, onChange, min, max, step }) => (
    <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
            <label>{label}</label>
            <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
        />
    </div>
);

export const ConfigPanel = ({ isOpen, onClose }) => {
    const [pid, setPid] = useState({ p: 1.2, i: 0.05, d: 0.4 });
    const [weights, setWeights] = useState({ visual: 0.8, wheel: 0.2 });

    const handleApply = () => {
        console.log('[Config] Applying parameters:', { pid, weights });
        // In a real app, this would send a command to the robot
    };

    return (
        <div style={{
            position: 'fixed',
            top: '48px', // Below header
            left: 0,
            bottom: 0,
            width: '300px',
            background: 'var(--color-bg-panel)',
            borderRight: '1px solid var(--color-border)',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(12px)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                letterSpacing: '1px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={18} /> CONFIGURATION
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>

                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Navigation PID Controller
                </h4>
                <SliderControl
                    label="Proportional (Kp)"
                    value={pid.p}
                    min={0} max={5} step={0.1}
                    onChange={v => setPid({ ...pid, p: v })}
                />
                <SliderControl
                    label="Integral (Ki)"
                    value={pid.i}
                    min={0} max={1} step={0.01}
                    onChange={v => setPid({ ...pid, i: v })}
                />
                <SliderControl
                    label="Derivative (Kd)"
                    value={pid.d}
                    min={0} max={2} step={0.05}
                    onChange={v => setPid({ ...pid, d: v })}
                />

                <div style={{ height: '1px', background: 'var(--color-border)', margin: '1.5rem 0' }} />

                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Sensor Fusion Weights
                </h4>
                <SliderControl
                    label="Visual Odometry"
                    value={weights.visual}
                    min={0} max={1} step={0.1}
                    onChange={v => setWeights({ ...weights, visual: v, wheel: Number((1 - v).toFixed(1)) })}
                />
                <SliderControl
                    label="Wheel Encoder"
                    value={weights.wheel}
                    min={0} max={1} step={0.1}
                    onChange={v => setWeights({ ...weights, wheel: v, visual: Number((1 - v).toFixed(1)) })}
                />

            </div>

            {/* Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                    onClick={handleApply}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--color-primary)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                >
                    <Save size={18} /> APPLY CHANGES
                </button>
            </div>
        </div>
    );
};
