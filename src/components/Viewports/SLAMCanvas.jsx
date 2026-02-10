import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { telemetryStore } from '../../stores/TelemetryStore';

// Robot Model (Simple Representation)
const Robot = () => {
    const meshRef = useRef();

    useEffect(() => {
        // Subscribe to odometry updates for high-frequency position updates
        const unsubscribe = telemetryStore.subscribe('odometry', (odom) => {
            if (meshRef.current) {
                meshRef.current.position.set(odom.x, odom.y, odom.z);
                // In a real app, we'd enable rotation too
                // meshRef.current.rotation.set(0, 0, odom.yaw);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.4]} />
            <meshStandardMaterial color="#00d2ff" wireframe />
            <axesHelper args={[2]} />
        </mesh>
    );
};

// Point Cloud Visualizer (Mock SLAM Map)
const PointCloud = () => {
    const pointsRef = useRef();
    const count = 5000;

    // Generate static random points for now (Mock Map)
    const particles = React.useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 2;
            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z;
        }
        return temp;
    }, []);

    useFrame((state) => {
        // Optional: Animate points or update from store if dynamic
        // For large point clouds, we update geometry attributes directly
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#7000ff"
                sizeAttenuation
                transparent
                opacity={0.8}
            />
        </points>
    );
};

export const SLAMCanvas = () => {
    return (
        <div style={{ width: '100%', height: '100%', background: '#050508' }}>
            <Canvas camera={{ position: [0, -10, 10], fov: 50, up: [0, 0, 1] }}>
                <color attach="background" args={['#050508']} />

                {/* Scene Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Environment */}
                <Grid
                    infiniteGrid
                    fadeDistance={30}
                    sectionColor="#333"
                    cellColor="#222"
                    position={[0, 0, -1]}
                />

                {/* Components */}
                <Robot />
                <PointCloud />

                {/* Controls */}
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
};
