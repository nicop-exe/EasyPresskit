import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ──────── GLTF Model Components ──────── */

const CDJGLTFModel = ({ hovered, position = [0, 0, 0], scale = 1 }) => {
    const groupRef = useRef();
    const { scene } = useGLTF('./3D/CDJ3000.glb');
    const clonedScene = React.useMemo(() => scene.clone(true), [scene]);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2);
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <primitive object={clonedScene} scale={0.01} />
        </group>
    );
};

const DJMAGLTFModel = ({ hovered, position = [0, 0, 0], scale = 1 }) => {
    const groupRef = useRef();
    const { scene } = useGLTF('./3D/DJMA9.glb');
    const clonedScene = React.useMemo(() => scene.clone(true), [scene]);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2);
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <primitive object={clonedScene} scale={0.01} />
        </group>
    );
};

/* ──────── Fallback geometric models (for non-GLTF equipment) ──────── */

const GenericMixerModel = ({ hovered }) => {
    const groupRef = useRef();
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2);
    });

    return (
        <group ref={groupRef} scale={0.5}>
            <RoundedBox args={[1.3, 0.2, 2.0]} radius={0.03} smoothness={4}>
                <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
            </RoundedBox>
            {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
                <group key={`f-${i}`}>
                    <mesh position={[x, 0.11, 0.3]}>
                        <boxGeometry args={[0.04, 0.02, 0.6]} />
                        <meshStandardMaterial color="#2a2a2a" />
                    </mesh>
                    <mesh position={[x, 0.13, 0.3 + (i % 2 === 0 ? 0.1 : -0.1)]}>
                        <boxGeometry args={[0.06, 0.04, 0.08]} />
                        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            ))}
            {[-0.35, -0.12, 0.12, 0.35].map((x) =>
                [-0.3, -0.5, -0.7].map((z, j) => (
                    <mesh key={`k-${x}-${j}`} position={[x, 0.13, z]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
                        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
                    </mesh>
                ))
            )}
        </group>
    );
};

/* ──────── Preload GLTF ──────── */
useGLTF.preload('./3D/CDJ3000.glb');
useGLTF.preload('./3D/DJMA9.glb');

/* ──────── Loading spinner ──────── */
const LoadingFallback = () => (
    <mesh>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#333" wireframe />
    </mesh>
);

/* ──────── Equipment Card ──────── */
const EquipmentCard = ({ item, isSelected, onToggle, count, onCountChange }) => {
    const [hovered, setHovered] = React.useState(false);

    const borderColor = isSelected ? '#fff' : (hovered ? '#666' : '#222');
    const bgColor = isSelected ? 'rgba(255,255,255,0.04)' : hovered ? 'rgba(255,255,255,0.02)' : '#0d0d0d';

    const isPlayer = item.type === 'player';

    return (
        <div
            style={{
                position: 'relative', width: '155px',
                border: `1px solid ${borderColor}`, borderRadius: '8px',
                background: bgColor, cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.4)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                overflow: 'hidden',
            }}
        >
            {/* 3D preview — click selects/deselects */}
            <div
                onClick={onToggle}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ width: '100%', height: '115px', position: 'relative' }}
            >
                <Canvas camera={{ position: [2, 2, 2], fov: 30 }} style={{ background: 'transparent' }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[3, 4, 3]} intensity={1} />
                    <directionalLight position={[-2, 2, -2]} intensity={0.4} />

                    <Suspense fallback={<LoadingFallback />}>
                        {item.id === 'cdj3000' ? (
                            <CDJGLTFModel hovered={hovered} />
                        ) : item.id === 'a9' ? (
                            <DJMAGLTFModel hovered={hovered} />
                        ) : (
                            <GenericMixerModel hovered={hovered} />
                        )}
                    </Suspense>
                </Canvas>

                {isSelected && (
                    <div style={{
                        position: 'absolute', top: '5px', right: '5px',
                        background: '#fff', color: '#000',
                        fontSize: '0.5rem', fontWeight: 'bold',
                        padding: '2px 5px', borderRadius: '3px',
                        fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
                    }}>
                        ✓
                    </div>
                )}
            </div>

            {/* Name */}
            <div style={{
                padding: '6px 8px', borderTop: `1px solid ${borderColor}`,
                textAlign: 'center', fontFamily: 'var(--font-display)',
                fontSize: '0.65rem', color: isSelected ? '#fff' : '#888',
                letterSpacing: '0.08em', transition: 'all 0.25s ease',
            }} onClick={onToggle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                {item.name}
            </div>

            {/* Quantity selector for players */}
            {isSelected && isPlayer && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '4px 8px',
                    borderTop: '1px solid #222', background: 'rgba(255,255,255,0.02)',
                }}>
                    <button onClick={(e) => { e.stopPropagation(); onCountChange(Math.max(1, count - 1)); }}
                        style={{ width: '22px', height: '22px', padding: 0, fontSize: '0.7rem', border: '1px solid #444', borderRadius: '4px', color: '#999', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        −
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: '#fff', minWidth: '12px', textAlign: 'center' }}>
                        {count}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onCountChange(Math.min(4, count + 1)); }}
                        style={{ width: '22px', height: '22px', padding: 0, fontSize: '0.7rem', border: '1px solid #444', borderRadius: '4px', color: '#999', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                    </button>
                </div>
            )}

            {/* Type badge */}
            <div style={{
                position: 'absolute', top: '5px', left: '5px',
                background: 'rgba(0,0,0,0.75)', color: '#666',
                fontSize: '0.45rem', padding: '2px 4px', borderRadius: '3px',
                textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                letterSpacing: '0.1em',
            }}>
                {item.type}
            </div>
        </div>
    );
};

/* ──────── DJ Booth Preview (CDJs flanking the mixer) ──────── */
const DJBoothPreview = ({ selectedEquipment, cdjCount }) => {
    const hasPlayer = selectedEquipment.some(e => e.type === 'player');
    const hasMixer = selectedEquipment.some(e => e.type === 'mixer');
    const mixer = selectedEquipment.find(e => e.type === 'mixer');

    if (!hasPlayer && !hasMixer) return null;

    // Calculate positions: CDJs evenly spaced on left and right of mixer
    const leftCdjs = Math.ceil(cdjCount / 2);
    const rightCdjs = Math.floor(cdjCount / 2);
    const spacing = 2.2;

    return (
        <div style={{
            marginTop: '1.5rem',
            border: '1px solid #1a1a1a',
            borderRadius: '10px',
            background: '#080808',
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '0.5rem 1rem',
                borderBottom: '1px solid #1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.55rem', letterSpacing: '0.2em',
                    color: '#555', textTransform: 'uppercase',
                }}>
                    DJ Booth Setup
                </span>
                <span style={{ fontSize: '0.6rem', color: '#333' }}>
                    {cdjCount}x CDJ {mixer ? `+ ${mixer.name}` : ''}
                </span>
            </div>

            <div style={{ height: '220px' }}>
                <Canvas camera={{ position: [0, 4, 6], fov: 40 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 6, 5]} intensity={0.8} />
                    <directionalLight position={[-3, 4, -3]} intensity={0.3} />

                    {/* Ground plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                        <planeGeometry args={[15, 8]} />
                        <meshStandardMaterial color="#0a0a0a" />
                    </mesh>

                    <Suspense fallback={<LoadingFallback />}>
                        {/* Left CDJs */}
                        {hasPlayer && Array.from({ length: leftCdjs }).map((_, i) => (
                            <CDJBoothUnit key={`l-${i}`} position={[-(leftCdjs - i) * spacing, 0, 0]} />
                        ))}

                        {/* Center Mixer */}
                        {hasMixer && (
                            mixer?.id === 'a9' ? (
                                <DJMABoothUnit position={[0, 0, 0]} />
                            ) : (
                                <GenericMixerBooth position={[0, 0, 0]} />
                            )
                        )}

                        {/* Right CDJs */}
                        {hasPlayer && Array.from({ length: rightCdjs }).map((_, i) => (
                            <CDJBoothUnit key={`r-${i}`} position={[(i + 1) * spacing, 0, 0]} />
                        ))}
                    </Suspense>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 2.5}
                        autoRotate
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </div>
        </div>
    );
};

/* Static booth models (no spin) */
const CDJBoothUnit = ({ position }) => {
    const { scene } = useGLTF('./3D/CDJ3000.glb');
    const clonedScene = React.useMemo(() => scene.clone(true), [scene]);
    return (
        <group position={position}>
            <primitive object={clonedScene} scale={0.01} />
        </group>
    );
};

const DJMABoothUnit = ({ position }) => {
    const { scene } = useGLTF('./3D/DJMA9.glb');
    const clonedScene = React.useMemo(() => scene.clone(true), [scene]);
    return (
        <group position={position}>
            <primitive object={clonedScene} scale={0.01} />
        </group>
    );
};

const GenericMixerBooth = ({ position }) => (
    <group position={position} scale={0.5}>
        <RoundedBox args={[1.3, 0.2, 2.0]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </RoundedBox>
    </group>
);

/* ──────── Main TechRider ──────── */
export const TechRider = ({ onAddEquipment, selectedEquipment = [], cdjCount = 2, onCdjCountChange }) => {
    const equipmentData = [
        { id: 'cdj3000', name: 'CDJ-3000', type: 'player', brand: 'pioneer' },
        { id: 'a9', name: 'DJM-A9', type: 'mixer', brand: 'pioneer' },
        { id: 'v10', name: 'DJM-V10', type: 'mixer', brand: 'pioneer' },
        { id: 'xone92', name: 'Xone:92', type: 'mixer', brand: 'allen' },
        { id: 'xone96', name: 'Xone:96', type: 'mixer', brand: 'allen' },
    ];

    const selectedItems = equipmentData.filter(e => selectedEquipment.includes(e.name));

    return (
        <div>
            {/* Equipment grid */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px',
                justifyContent: 'center', padding: '10px 0',
            }}>
                {equipmentData.map((item) => (
                    <EquipmentCard
                        key={item.id}
                        item={item}
                        isSelected={selectedEquipment.includes(item.name)}
                        onToggle={() => onAddEquipment(item.name)}
                        count={cdjCount}
                        onCountChange={onCdjCountChange}
                    />
                ))}
            </div>

            {/* DJ Booth Preview */}
            <DJBoothPreview
                selectedEquipment={selectedItems}
                cdjCount={cdjCount}
            />
        </div>
    );
};
