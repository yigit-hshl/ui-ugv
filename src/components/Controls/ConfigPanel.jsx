import React, { useState, useEffect } from 'react';
import { Settings, Save, X, RefreshCw } from 'lucide-react';
import { parameterStore } from '../../stores/ParameterStore';

const DynamicInput = ({ label, path, value, pendingValue, onChange }) => (
    <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
            <label>{label}</label>
            {pendingValue !== undefined ? (
                <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={12} className="spin" /> {pendingValue}
                </span>
            ) : (
                <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{value}</span>
            )}
        </div>
        <input
            type="number"
            step="0.01"
            value={pendingValue !== undefined ? pendingValue : value}
            onChange={(e) => onChange(path, parseFloat(e.target.value))}
            style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: pendingValue !== undefined ? '1px solid var(--color-warning)' : '1px solid var(--color-border)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px'
            }}
        />
        <style>{`
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
);

export const ConfigPanel = ({ isOpen, onClose }) => {
    const [state, setState] = useState(parameterStore.get());

    useEffect(() => {
        return parameterStore.subscribe(setState);
    }, []);

    const handleChange = (path, val) => {
        if (!isNaN(val)) {
            parameterStore.updateParam(path, val);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '48px', left: 0, bottom: 0, width: '320px',
            background: 'var(--color-bg-panel)',
            borderRight: '1px solid var(--color-border)',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(12px)',
            zIndex: 50,
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px', fontWeight: 'bold' }}>
                    <Settings size={18} /> PARAMETERS
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                {Object.entries(state.params).map(([group, params]) => (
                    <div key={group} style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>{group}</h4>
                        {Object.entries(params).map(([key, val]) => {
                            const path = `${group}.${key}`;
                            return (
                                <DynamicInput
                                    key={path}
                                    label={key.replace(/_/g, ' ')}
                                    path={path}
                                    value={val}
                                    pendingValue={state.pending[path]}
                                    onChange={handleChange}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
