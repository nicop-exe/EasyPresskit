import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float, Center, Resize, useGLTF, MeshDistortMaterial, Environment, Stage } from '@react-three/drei';

const Model = ({ url, ...props }) => {
    const { scene } = useGLTF(url, true); // Use draco if needed, simplified here
    // Clone scene to allow multiple instances
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);
    return <primitive object={clonedScene} {...props} />;
};

const Equipment = ({ position, name, type, color = "#222", neonColor = "#00f2ff", onClick, isSelected }) => {
    const isMixer = type === 'mixer';
    const [hovered, setHovered] = React.useState(false);

    // Determine which model to load
    let modelUrl = null;
    // Note: These paths are relative to the public folder
    if (name.includes('CDJ-3000')) modelUrl = '/3D/CDJ3000.glb';
    if (name.includes('DJM-A9')) modelUrl = '/3D/DJMA9.glb';

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
            <group
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.05 : 1}
            >
                {modelUrl ? (
                    <group rotation={[0, Math.PI, 0]}>
                        <Resize scale={1.5}>
                            <Center>
                                <Model url={modelUrl} />
                            </Center>
                        </Resize>

                        {/* Highlight effect */}
                        {isSelected && (
                            <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[2, 2.5]} />
                                <meshBasicMaterial color={neonColor} transparent opacity={0.3} />
                            </mesh>
                        )}
                    </group>
                ) : (
                    /* Fallback for models without GLB (V10, 92, 96) */
                    <group>
                        {/* Main Chassis */}
                        <mesh>
                            <boxGeometry args={[isMixer ? 1.2 : 1.5, 0.4, 2]} />
                            <meshStandardMaterial
                                color={isSelected ? neonColor : color}
                                metalness={0.5}
                                roughness={0.5}
                            />
                        </mesh>

                        {/* Screen / Controls Area */}
                        <mesh position={[0, 0.21, isMixer ? 0 : -0.4]}>
                            <boxGeometry args={[isMixer ? 0.8 : 1.2, 0.05, isMixer ? 1.6 : 0.8]} />
                            <meshStandardMaterial color={isMixer ? "#333" : neonColor} emissive={isMixer ? "#000" : neonColor} emissiveIntensity={isMixer ? 0 : 2} />
                        </mesh>

                        {isMixer && [1, 2, 3, 4].map((i) => (
                            <mesh key={i} position={[(i - 2.5) * 0.2, 0.25, 0.2]}>
                                <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
                                <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1} />
                            </mesh>
                        ))}
                    </group>
                )}

                {/* Labels */}
                <Text
                    position={[0, 0.8, 0]}
                    fontSize={0.15}
                    color="white"
                    font="https://fonts.gstatic.com/s/orbitron/v25/yV0X-y_SDRD6QY_A2.woff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {name}
                </Text>

                {/* Add Button Hint */}
                {hovered && (
                    <Text
                        position={[0, 1.1, 0]}
                        fontSize={0.2}
                        color={neonColor}
                        font="https://fonts.gstatic.com/s/orbitron/v25/yV0X-y_SDRD6QY_A2.woff"
                    >
                        + ADD
                    </Text>
                )}
            </group>
        </Float>
    );
};

export const TechRider = ({ primaryColor, onAddEquipment, selectedEquipment = [] }) => {
    const equipmentData = [
        { id: 'cdj3000', name: 'CDJ-3000', type: 'player', color: '#111' },
        { id: 'a9', name: 'DJM-A9', type: 'mixer', color: '#111' },
        { id: 'v10', name: 'DJM-V10', type: 'mixer', color: '#111' },
        { id: 'xone92', name: 'Xone:92', type: 'mixer', color: '#1a1a1a' },
        { id: 'xone96', name: 'Xone:96', type: 'mixer', color: '#1a1a1a' },
    ];

    return (
        <div id="canvas-container">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={50} />
                <OrbitControls enableZoom={false} makeDefault />

                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color={primaryColor} />
                <spotLight position={[-10, 20, 5]} angle={0.5} penumbra={1} intensity={3} castShadow />
                <Environment preset="city" />

                <Suspense fallback={
                    <Text position={[0, 1, 0]} fontSize={0.5} color="white">
                        Loading 3D Models...
                    </Text>
                }>
                    <group position={[0, -1, 0]}>
                        {/* Base platform */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                            <planeGeometry args={[20, 20]} />
                            <MeshDistortMaterial
                                color="#050505"
                                speed={1}
                                distort={0.1}
                                radius={1}
                            />
                        </mesh>

                        {/* Render equipment in a line */}
                        {equipmentData.map((item, index) => (
                            <Equipment
                                key={item.id}
                                name={item.name}
                                type={item.type}
                                position={[(index - 2) * 2.2, 0, 0]}
                                color={item.color}
                                neonColor={primaryColor}
                                onClick={() => onAddEquipment(item.name)}
                                isSelected={false} // Could be used to visually toggle
                            />
                        ))}
                    </group>
                </Suspense>
            </Canvas>
        </div>
    );
};
