import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { telemetryStore } from '../../stores/TelemetryStore';

export const Breadcrumbs = () => {
    const lineRef = useRef();

    useLayoutEffect(() => {
        const unsubscribe = telemetryStore.subscribe('path', (pathData) => {
            if (lineRef.current && pathData.length > 0) {
                const points = pathData.map(p => new THREE.Vector3(p.x, p.y, p.z));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);

                // Dispose old geometry to prevent memory leaks
                lineRef.current.geometry.dispose();
                lineRef.current.geometry = geometry;
            }
        });
        return unsubscribe;
    }, []);

    return (
        <line ref={lineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#00d2ff" opacity={0.6} transparent linewidth={2} />
        </line>
    );
};
