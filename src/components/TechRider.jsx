import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ──────── 3D Equipment Models ──────── */

const CDJModel = ({ neonColor, hovered }) => {
    const groupRef = useRef();
    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * (hovered ? 0.8 : 0.3);
        }
    });

    return (
        <group ref={groupRef} scale={0.55}>
            {/* Base chassis */}
            <RoundedBox args={[1.6, 0.15, 1.8]} radius={0.03} smoothness={4}>
                <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
            </RoundedBox>
            {/* Jog wheel */}
            <mesh position={[0, 0.1, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Jog wheel ring */}
            <mesh position={[0, 0.12, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.45, 0.02, 8, 48]} />
                <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={hovered ? 4 : 2} />
            </mesh>
            {/* Center dot */}
            <mesh position={[0, 0.12, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.08, 24]} />
                <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1.5} />
            </mesh>
            {/* Screen */}
            <RoundedBox args={[1.0, 0.02, 0.4]} radius={0.01} position={[0, 0.1, -0.55]}>
                <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={hovered ? 2.5 : 1.2} />
            </RoundedBox>
            {/* Play/Cue */}
            {[-0.25, 0.25].map((x, i) => (
                <mesh key={i} position={[x, 0.09, 0.7]}>
                    <boxGeometry args={[0.15, 0.03, 0.08]} />
                    <meshStandardMaterial color={i === 0 ? '#00ff00' : '#ff3333'} emissive={i === 0 ? '#00ff00' : '#ff3333'} emissiveIntensity={1} />
                </mesh>
            ))}
            {/* Tempo slider */}
            <mesh position={[0.6, 0.09, 0]}>
                <boxGeometry args={[0.04, 0.02, 0.8]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
};

const MixerModel = ({ neonColor, hovered, brand = 'pioneer' }) => {
    const groupRef = useRef();
    const isPioneer = brand === 'pioneer';

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * (hovered ? 0.8 : 0.3);
        }
    });

    return (
        <group ref={groupRef} scale={0.5}>
            {/* Base */}
            <RoundedBox args={[1.3, 0.2, 2.0]} radius={0.03} smoothness={4}>
                <meshStandardMaterial color={isPioneer ? '#111' : '#1a1a2e'} metalness={0.6} roughness={0.4} />
            </RoundedBox>
            {/* Faders */}
            {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
                <group key={`f-${i}`}>
                    <mesh position={[x, 0.11, 0.3]}>
                        <boxGeometry args={[0.04, 0.02, 0.6]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[x, 0.13, 0.3 + (i % 2 === 0 ? 0.1 : -0.1)]}>
                        <boxGeometry args={[0.06, 0.04, 0.08]} />
                        <meshStandardMaterial color="#ddd" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            ))}
            {/* EQ knobs */}
            {[-0.35, -0.12, 0.12, 0.35].map((x) =>
                [-0.3, -0.5, -0.7].map((z, j) => (
                    <mesh key={`k-${x}-${j}`} position={[x, 0.13, z]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
                        <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={hovered ? 2 : 0.8} />
                    </mesh>
                ))
            )}
            {/* Crossfader */}
            <mesh position={[0, 0.11, 0.75]}>
                <boxGeometry args={[0.5, 0.02, 0.04]} />
                <meshStandardMaterial color="#444" />
            </mesh>
            {/* VU meters */}
            {[-0.2, 0.2].map((x, i) => (
                <group key={`vu-${i}`}>
                    {[0, 1, 2, 3].map((j) => (
                        <mesh key={j} position={[x, 0.12, -0.85 + j * 0.05]}>
                            <boxGeometry args={[0.08, 0.02, 0.03]} />
                            <meshStandardMaterial
                                color={j < 3 ? '#00ff44' : '#ff3300'}
                                emissive={j < 3 ? '#00ff44' : '#ff3300'}
                                emissiveIntensity={j <= 2 ? 1.2 : 0.3}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

/* ──────── Single Equipment Card (video-game inventory slot) ──────── */

const EquipmentCard = ({ item, neonColor, isSelected, onToggle }) => {
    const [hovered, setHovered] = React.useState(false);

    const borderColor = isSelected ? neonColor : (hovered ? neonColor : '#333');
    const bgColor = isSelected
        ? `${neonColor}18`
        : hovered
            ? `${neonColor}10`
            : 'rgba(10, 10, 15, 0.9)';

    return (
        <div
            onClick={onToggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                width: '160px',
                border: `2px solid ${borderColor}`,
                borderRadius: '8px',
                background: bgColor,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: hovered
                    ? `0 0 20px ${neonColor}55, inset 0 0 20px ${neonColor}15`
                    : isSelected
                        ? `0 0 12px ${neonColor}33`
                        : '0 2px 8px rgba(0,0,0,0.5)',
                transform: hovered ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
                overflow: 'hidden',
            }}
        >
            {/* 3D Preview area */}
            <div style={{ width: '100%', height: '130px', position: 'relative' }}>
                <Canvas
                    camera={{ position: [1.5, 1.5, 1.5], fov: 35 }}
                    style={{ background: 'transparent' }}
                >
                    <ambientLight intensity={1} />
                    <pointLight position={[3, 3, 3]} intensity={1.5} color={hovered ? neonColor : '#ffffff'} />
                    <pointLight position={[-2, 2, -2]} intensity={0.5} color={neonColor} />

                    {item.type === 'player' ? (
                        <CDJModel neonColor={neonColor} hovered={hovered} />
                    ) : (
                        <MixerModel neonColor={neonColor} hovered={hovered} brand={item.brand} />
                    )}
                </Canvas>

                {/* Selected badge */}
                {isSelected && (
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: neonColor,
                        color: '#000',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-orbitron)',
                        letterSpacing: '0.05em',
                    }}>
                        ✓ ADDED
                    </div>
                )}
            </div>

            {/* Name label */}
            <div style={{
                padding: '8px 10px',
                borderTop: `1px solid ${borderColor}`,
                textAlign: 'center',
                fontFamily: 'var(--font-orbitron)',
                fontSize: '0.75rem',
                color: hovered || isSelected ? neonColor : '#ccc',
                letterSpacing: '0.08em',
                background: hovered
                    ? `linear-gradient(180deg, ${neonColor}10, ${neonColor}05)`
                    : 'transparent',
                transition: 'all 0.3s ease',
            }}>
                {item.name}
            </div>

            {/* Type badge */}
            <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                background: 'rgba(0,0,0,0.7)',
                color: '#888',
                fontSize: '0.5rem',
                padding: '2px 5px',
                borderRadius: '3px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.1em',
            }}>
                {item.type}
            </div>
        </div>
    );
};

/* ──────── Main TechRider component ──────── */

export const TechRider = ({ primaryColor, onAddEquipment, selectedEquipment = [] }) => {
    const equipmentData = [
        { id: 'cdj3000', name: 'CDJ-3000', type: 'player', brand: 'pioneer' },
        { id: 'a9', name: 'DJM-A9', type: 'mixer', brand: 'pioneer' },
        { id: 'v10', name: 'DJM-V10', type: 'mixer', brand: 'pioneer' },
        { id: 'xone92', name: 'Xone:92', type: 'mixer', brand: 'allen' },
        { id: 'xone96', name: 'Xone:96', type: 'mixer', brand: 'allen' },
    ];

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center',
            padding: '16px 8px',
        }}>
            {equipmentData.map((item) => (
                <EquipmentCard
                    key={item.id}
                    item={item}
                    neonColor={primaryColor}
                    isSelected={selectedEquipment.includes(item.name)}
                    onToggle={() => onAddEquipment(item.name)}
                />
            ))}
        </div>
    );
};
