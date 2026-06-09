/**
 * AuthOrb.jsx
 * Lightweight 3D orb for auth branding panel.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function Sphere() {
  const meshRef = useRef();
  const matRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 20]} />
        <MeshDistortMaterial
          ref={matRef}
          color="#6A0DAD"
          emissive="#FF8C00"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.9}
          distort={0.35}
          speed={2.5}
        />
      </mesh>
    </Float>
  );
}

function Ring() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.4;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.6, 0.015, 16, 100]} />
      <meshBasicMaterial color="#E040FB" transparent opacity={0.4} />
    </mesh>
  );
}

export default function AuthOrb() {
  return (
    <div className="auth-orb-canvas">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={0.8} color="#FF8C00" />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#6A0DAD" />
        <Sphere />
        <Ring />
        <Sparkles count={50} scale={4} size={1.5} speed={0.3} color="#FF8C00" />
      </Canvas>
      <div className="auth-orb-glow" />
    </div>
  );
}
