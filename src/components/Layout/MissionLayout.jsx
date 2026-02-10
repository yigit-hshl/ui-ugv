import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { SLAMCanvas } from '../Viewports/SLAMCanvas';
import { VideoFeed } from '../Viewports/VideoFeed';
import { Sidebar } from '../Telemetry/Sidebar';
import { ConfigPanel } from '../Controls/ConfigPanel';
import './MissionLayout.css';

export const MissionLayout = () => {
    const [configOpen, setConfigOpen] = useState(false);

    return (
        <div className="mission-layout">
            <ConfigPanel isOpen={configOpen} onClose={() => setConfigOpen(false)} />

            <header className="mission-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="logo">UGV COMMAND</div>
                    <button
                        onClick={() => setConfigOpen(!configOpen)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            color: configOpen ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem'
                        }}
                    >
                        <Settings size={14} /> TUNE
                    </button>
                </div>

                <div className="status-bar">
                    <span className="status-indicator online"></span> ONLINE
                </div>
            </header>

            <main className="mission-main">
                <SLAMCanvas />
            </main>

            <aside className="mission-sidebar">
                <div className="video-container">
                    <VideoFeed />
                </div>
                <div className="telemetry-container">
                    <Sidebar />
                </div>
            </aside>
        </div>
    );
};
