import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, Video, Map, Navigation } from 'lucide-react';
import { telemetryStore } from '../../stores/TelemetryStore';
import { Breadcrumbs } from './Breadcrumbs';
import { OccupancyGrid } from './OccupancyGrid';

// Robot Model (Simple Representation)
const Robot = () => {
    const meshRef = useRef();

    useEffect(() => {
        const unsubscribe = telemetryStore.subscribe('odometry', (odom) => {
            if (meshRef.current) {
                meshRef.current.position.set(odom.x, odom.y, odom.z);
                meshRef.current.rotation.z = odom.vz || 0; // Assuming vz maps to yaw for now or use quat
            }
        });
        return unsubscribe;
    }, []);

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.4]} />
            <meshStandardMaterial color="#00d2ff" wireframe />
            <axesHelper args={[1.5]} />
        </mesh>
    );
};

// Camera Controller
const CameraRig = ({ mode }) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef();
    const vec = new THREE.Vector3();

    useFrame(() => {
        if (mode === 'FOLLOW') {
            // Get latest position from store directly to avoid react render loop
            const state = telemetryStore.get();
            const { x, y, z } = state.odometry;

            // Target position (behind and above)
            const targetPos = new THREE.Vector3(x - 5, y - 5, z + 8);
            const lookAtPos = new THREE.Vector3(x, y, z);

            // Smooth interpolation
            camera.position.lerp(targetPos, 0.05);
            controlsRef.current?.target.lerp(lookAtPos, 0.1);
            controlsRef.current?.update();
        }
    });

    return <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} enableDamping />;
};

// Point Cloud Visualizer (Mock SLAM Map)
const PointCloud = () => {
    const pointsRef = useRef();
    const count = 5000;
    const particles = React.useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 50;
            temp[i * 3 + 1] = (Math.random() - 0.5) * 50;
            temp[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
        return temp;
    }, []);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.15} color="#7000ff" sizeAttenuation transparent opacity={0.6} />
        </points>
    );
};

export const SLAMCanvas = () => {
    const [viewMode, setViewMode] = useState('FOLLOW'); // FOLLOW | FREE
    const [layers, setLayers] = useState({
        grid: true,
        points: true,
        path: true,
        map: true
    });

    const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div style={{ width: '100%', height: '100%', background: '#050508', position: 'relative' }}>
            {/* Viewport Overlay Controls */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {/* Camera Mode Toggle */}
                <button
                    onClick={() => setViewMode(prev => prev === 'FOLLOW' ? 'FREE' : 'FOLLOW')}
                    style={{
                        background: viewMode === 'FOLLOW' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                        color: viewMode === 'FOLLOW' ? 'black' : 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    <Video size={16} /> {viewMode === 'FOLLOW' ? 'LOCKED' : 'FREE CAM'}
                </button>

                {/* Layer Toggles */}
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px', fontWeight: 'bold' }}>LAYERS</div>

                    <LayerToggle active={layers.map} onClick={() => toggleLayer('map')} label="Occ. Grid" icon={Map} />
                    <LayerToggle active={layers.path} onClick={() => toggleLayer('path')} label="Path Trail" icon={Navigation} />
                    <LayerToggle active={layers.points} onClick={() => toggleLayer('points')} label="Point Cloud" icon={Layers} />
                </div>
            </div>

            <Canvas camera={{ position: [0, -10, 10], fov: 50, up: [0, 0, 1] }}>
                <color attach="background" args={['#050508']} />

                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Grid infiniteGrid fadeDistance={30} sectionColor="#333" cellColor="#222" position={[0, 0, -1]} />

                <Robot />

                {layers.points && <PointCloud />}
                {layers.path && <Breadcrumbs />}
                {layers.map && <OccupancyGrid />}

                <CameraRig mode={viewMode} />
            </Canvas>
        </div>
    );
};

const LayerToggle = ({ active, onClick, label, icon: Icon }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px',
            opacity: active ? 1 : 0.5,
            color: active ? 'var(--color-success)' : 'white'
        }}
    >
        <Icon size={14} />
        <span style={{ fontSize: '0.8rem' }}>{label}</span>
    </div>
);
