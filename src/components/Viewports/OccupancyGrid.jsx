import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { telemetryStore } from '../../stores/TelemetryStore';

const GRID_SIZE = 100; // Matches mock generator
const CELL_SIZE = 0.5;

export const OccupancyGrid = () => {
    const meshRef = useRef();
    const dummy = new THREE.Object3D();

    useEffect(() => {
        const unsubscribe = telemetryStore.subscribe('occupancyGrid', (grid) => {
            if (!grid || !meshRef.current) return;

            let count = 0;
            // Iterate through grid
            for (let i = 0; i < grid.length; i++) {
                if (grid[i] > 0.5) { // Threshold for "occupied"
                    const x = (i % GRID_SIZE) - (GRID_SIZE / 2);
                    const y = Math.floor(i / GRID_SIZE) - (GRID_SIZE / 2);

                    dummy.position.set(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE / 2);
                    dummy.updateMatrix();

                    meshRef.current.setMatrixAt(count, dummy.matrix);

                    // Optional: Set color based on value
                    // meshRef.current.setColorAt(count, new THREE.Color(...));

                    count++;
                }
            }

            meshRef.current.count = count;
            meshRef.current.instanceMatrix.needsUpdate = true;
        });

        return unsubscribe;
    }, []);

    return (
        <instancedMesh ref={meshRef} args={[null, null, GRID_SIZE * GRID_SIZE]}>
            <boxGeometry args={[CELL_SIZE * 0.9, CELL_SIZE * 0.9, CELL_SIZE]} />
            <meshStandardMaterial color="#ff0055" transparent opacity={0.8} />
        </instancedMesh>
    );
};
