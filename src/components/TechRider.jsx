import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    LoadingFallback,
    CDJGLTFModel,
    DJMAGLTFModel,
    GenericMixerModel,
    DJBoothPreview
} from './DJBooth3D';

/* ──────── Equipment Card with Small Preview ──────── */
const EquipmentCard = ({ item, isSelected, onToggle, count, onCountChange }) => {
    const [hovered, setHovered] = React.useState(false);

    const borderColor = isSelected ? '#fff' : (hovered ? '#666' : '#222');
    const bgColor = isSelected ? 'rgba(255,255,255,0.04)' : hovered ? 'rgba(255,255,255,0.02)' : '#0d0d0d';

    const isPlayer = item.type === 'player';

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                display: 'flex', flexDirection: 'column',
                height: '220px', // Fixed height for absolute alignment
                border: `1px solid ${borderColor}`, borderRadius: '8px',
                background: bgColor, cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.4)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                overflow: 'hidden',
                flexShrink: 0
            }}
        >
            {/* 3D preview — click selects/deselects */}
            <div
                onClick={onToggle}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ width: '100%', height: '100px', position: 'relative', flexShrink: 0 }}
            >
                <Canvas camera={{ position: [2.2, 2.5, 2.2], fov: 35 }} style={{ background: 'transparent' }}>
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
                padding: '6px 4px', borderTop: `1px solid ${borderColor}`,
                textAlign: 'center', fontFamily: 'var(--font-display)',
                fontSize: isMobile ? '0.55rem' : '0.65rem', color: isSelected ? '#fff' : '#888',
                letterSpacing: '0.05em', transition: 'all 0.25s ease',
                flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} onClick={onToggle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                {item.name}
            </div>

            {/* Quantity selector for players */}
            {isSelected && isPlayer && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.4rem', padding: '4px 6px',
                    borderTop: '1px solid #222', background: 'rgba(255,255,255,0.02)',
                    marginTop: 'auto'
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

/* ──────── Main TechRider ──────── */
export const TechRider = ({ onAddEquipment, selectedEquipment = [], cdjCount = 2, onCdjCountChange }) => {
    const equipmentData = [
        { id: 'cdj3000', name: 'CDJ-3000', type: 'player', brand: 'pioneer' },
        { id: 'a9', name: 'DJM-A9', type: 'mixer', brand: 'pioneer' },
        { id: 'v10', name: 'DJM-V10', type: 'mixer', brand: 'pioneer' },
        { id: 'xone92', name: 'Xone:92', type: 'mixer', brand: 'allen' },
        { id: 'xone96', name: 'Xone:96', type: 'mixer', brand: 'allen' },
    ];

    return (
        <div>
            {/* Equipment grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: (typeof window !== 'undefined' && window.innerWidth < 600) ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(155px, 1fr))',
                gap: '10px',
                padding: '10px 0',
                justifyItems: 'center',
                justifyContent: 'center',
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
                selectedEquipmentNames={selectedEquipment}
                cdjCount={cdjCount}
            />
        </div>
    );
};
