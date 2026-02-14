import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float, MeshDistortMaterial } from '@react-three/drei';

const Equipment = ({ position, name, type, color = "#222", neonColor = "#00f2ff", onClick, isSelected }) => {
    const isMixer = type === 'mixer';
    const [hovered, setHovered] = React.useState(false);

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
            <group
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.1 : 1}
            >
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

                {/* Knobs/Buttons simulation for mixers */}
                {isMixer && [1, 2, 3, 4].map((i) => (
                    <mesh key={i} position={[(i - 2.5) * 0.2, 0.25, 0.2]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
                        <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1} />
                    </mesh>
                ))}

                {/* Labels */}
                <Text
                    position={[0, 0.5, 0.7]}
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
                        position={[0, 0.8, 0]}
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

                <Suspense fallback={null}>
                    <group position={[0, 0, 0]}>
                        {/* Base platform */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
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
