import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, RoundedBox, Center } from '@react-three/drei';
import * as THREE from 'three';

/* ──────── Loading spinner ──────── */
export const LoadingFallback = () => (
    <group>
        <RoundedBox args={[1, 0.2, 1]}>
            <meshStandardMaterial color="#333" />
        </RoundedBox>
    </group>
);

/* ──────── GLTF Model Components (Hover Spin) ──────── */

export const CDJGLTFModel = ({ hovered, position = [0, 0, 0], scale = 1 }) => {
    const groupRef = useRef();
    const { scene } = useGLTF('./3D/CDJ3000.glb');
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2);
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <primitive object={clonedScene} scale={1} />
        </group>
    );
};

export const DJMAGLTFModel = ({ hovered, position = [0, 0, 0], scale = 1 }) => {
    const groupRef = useRef();
    const { scene } = useGLTF('./3D/DJMA9.glb');
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2);
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <primitive object={clonedScene} scale={1} />
        </group>
    );
};

export const DJMV10GLTFModel = ({ hovered, position = [0, 0, 0], scale = 1 }) => {
    const groupRef = useRef();
    const { scene } = useGLTF('./3D/DJM-V10.glb');
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2);
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <Center top>
                <primitive object={clonedScene} scale={7} />
            </Center>
        </group>
    );
};

export const GenericMixerModel = ({ hovered }) => {
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

/* ──────── DJ Booth Setup Preview (Static Models) ──────── */

const CDJBoothUnit = ({ position }) => {
    const { scene } = useGLTF('./3D/CDJ3000.glb');
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return (
        <group position={position}>
            <primitive object={clonedScene} scale={1} />
        </group>
    );
};

const DJMABoothUnit = ({ position }) => {
    const { scene } = useGLTF('./3D/DJMA9.glb');
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return (
        <group position={position}>
            <primitive object={clonedScene} scale={1} />
        </group>
    );
};

const DJMV10BoothUnit = ({ position }) => {
    const { scene } = useGLTF('./3D/DJM-V10.glb');
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return (
        <group position={position}>
            <Center top>
                <primitive object={clonedScene} scale={10} />
            </Center>
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

/* ──────── Preload GLTF ──────── */
useGLTF.preload('./3D/CDJ3000.glb');
useGLTF.preload('./3D/DJMA9.glb');
useGLTF.preload('./3D/DJM-V10.glb');

export const DJBoothPreview = ({ selectedEquipmentNames, cdjCount }) => {
    const equipmentData = [
        { id: 'cdj3000', name: 'CDJ-3000', type: 'player', brand: 'pioneer' },
        { id: 'a9', name: 'DJM-A9', type: 'mixer', brand: 'pioneer' },
        { id: 'v10', name: 'DJM-V10', type: 'mixer', brand: 'pioneer' },
        { id: 'xone92', name: 'Xone:92', type: 'mixer', brand: 'allen' },
        { id: 'xone96', name: 'Xone:96', type: 'mixer', brand: 'allen' },
    ];

    const selectedItems = equipmentData.filter(e => selectedEquipmentNames.includes(e.name));

    const hasPlayer = selectedItems.some(e => e.type === 'player');
    const hasMixer = selectedItems.some(e => e.type === 'mixer');
    const mixer = selectedItems.find(e => e.type === 'mixer');

    const leftCdjs = Math.ceil(cdjCount / 2);
    const rightCdjs = Math.floor(cdjCount / 2);
    const spacing = 3.2;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

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
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.55rem', letterSpacing: '0.2em',
                    color: '#888', textTransform: 'uppercase',
                }}>
                    DJ Booth Setup
                </span>
                <span style={{ fontSize: '0.6rem', color: '#fff', opacity: 0.8, fontFamily: 'Orbitron, sans-serif' }}>
                    {hasPlayer || hasMixer ? `${cdjCount}x CDJ ${mixer ? `+ ${mixer.name}` : ''}` : 'Empty Booth'}
                </span>
            </div>

            <div style={{ height: isMobile ? '220px' : '260px' }}>
                <Canvas camera={{ position: [0, 6, 10], fov: 45 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 6, 5]} intensity={0.8} />
                    <directionalLight position={[-3, 4, -3]} intensity={0.3} />

                    {/* Ground plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                        <planeGeometry args={[25, 15]} />
                        <meshStandardMaterial color="#0a0a0a" />
                    </mesh>

                    <gridHelper args={[20, 20, 0x222222, 0x111111]} position={[0, -0.29, 0]} />

                    <Suspense fallback={<LoadingFallback />}>
                        {/* Render LEFT CDJs */}
                        {hasPlayer && Array.from({ length: leftCdjs }).map((_, i) => (
                            <CDJBoothUnit key={`l-${i}`} position={[-(leftCdjs - i) * spacing, 0, 0]} />
                        ))}

                        {/* Render MIXER */}
                        {hasMixer && (
                            mixer?.id === 'a9' ? (
                                <DJMABoothUnit position={[0, 0, 0]} />
                            ) : mixer?.id === 'v10' ? (
                                <DJMV10BoothUnit position={[0, 0, 0]} />
                            ) : (
                                <GenericMixerBooth position={[0, 0, 0]} />
                            )
                        )}

                        {/* Render RIGHT CDJs */}
                        {hasPlayer && Array.from({ length: rightCdjs }).map((_, i) => (
                            <CDJBoothUnit key={`r-${i}`} position={[(i + 1) * spacing, 0, 0]} />
                        ))}
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
};
