import React, { useRef, useState, useEffect } from 'react';
import { controlStore } from '../../stores/ControlStore';

const JOYSTICK_SIZE = 120;
const HANDLE_SIZE = 50;
const MAX_DISTANCE = JOYSTICK_SIZE / 2;

export const VirtualJoystick = () => {
    const containerRef = useRef();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    const handleStart = (e) => {
        setDragging(true);
        updatePosition(e);
    };

    const handleMove = (e) => {
        if (!dragging) return;
        updatePosition(e);
    };

    const handleEnd = () => {
        setDragging(false);
        setPosition({ x: 0, y: 0 });
        controlStore.update({ linear: 0, angular: 0, activeInput: 'NONE' });
    };

    const updatePosition = (e) => {
        if (!containerRef.current) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > MAX_DISTANCE) {
            const ratio = MAX_DISTANCE / distance;
            dx *= ratio;
            dy *= ratio;
        }

        setPosition({ x: dx, y: dy });

        // Normalize -1 to 1
        // Y is inverted (Forward is -1 in screen coords, but usually +1 in robotics, 
        // but here we'll map -y to forward)
        let linear = -dy / MAX_DISTANCE;
        let angular = -dx / MAX_DISTANCE;

        // Deadzone handled in store or here
        if (Math.abs(linear) < 0.1) linear = 0;
        if (Math.abs(angular) < 0.1) angular = 0;

        controlStore.update({
            linear,
            angular,
            activeInput: 'JOYSTICK'
        });
    };

    // Attach global listeners for drag outside
    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [dragging]);

    return (
        <div
            ref={containerRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            style={{
                width: JOYSTICK_SIZE,
                height: JOYSTICK_SIZE,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                touchAction: 'none',
                cursor: 'pointer'
            }}
        >
            <div
                style={{
                    width: HANDLE_SIZE,
                    height: HANDLE_SIZE,
                    borderRadius: '50%',
                    background: dragging ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.2)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    transition: dragging ? 'none' : 'transform 0.2s ease-out',
                    boxShadow: dragging ? '0 0 15px var(--color-primary)' : 'none'
                }}
            />
        </div>
    );
};
