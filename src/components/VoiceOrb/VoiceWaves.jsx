/**
 * VoiceWaves.jsx
 * Three.js animated sinusoidal frequency waves behind the voice orb.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WAVE_COUNT = 5;
const POINTS = 120;

function WaveLine({ index, isActive, color }) {
  const lineRef = useRef();
  const materialRef = useRef();

  const geometry = useMemo(() => {
    const positions = new Float32Array(POINTS * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const t = clock.getElapsedTime();
    const positions = lineRef.current.geometry.attributes.position.array;
    const amplitude = isActive ? 0.35 + index * 0.08 : 0.12 + index * 0.03;
    const frequency = 2 + index * 0.6;
    const phase = t * (1.2 + index * 0.3) + index * 1.5;
    const yOffset = (index - WAVE_COUNT / 2) * 0.35;
    const width = 5.5;

    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1) - 0.5) * width;
      const wave = Math.sin(x * frequency + phase) * amplitude;
      const envelope = Math.exp(-x * x * 0.15);
      positions[i * 3] = x;
      positions[i * 3 + 1] = wave * envelope + yOffset;
      positions[i * 3 + 2] = -1.5 - index * 0.15;
    }

    lineRef.current.geometry.attributes.position.needsUpdate = true;

    if (materialRef.current) {
      const targetOpacity = isActive ? 0.55 - index * 0.08 : 0.15 - index * 0.02;
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.08;
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.2}
        linewidth={1}
      />
    </line>
  );
}

export default function VoiceWaves({ isListening, isSpeaking, isTranslating }) {
  const groupRef = useRef();
  const isActive = isListening || isSpeaking || isTranslating;

  const colors = useMemo(() => [
    '#FF8C00',
    '#E040FB',
    '#6A0DAD',
    '#FF6B35',
    '#9C27B0',
  ], []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.15) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {colors.map((color, i) => (
        <WaveLine key={color} index={i} isActive={isActive} color={color} />
      ))}
    </group>
  );
}
