/**
 * VoiceOrb.jsx
 * 3D animated AI voice orb with purple/orange neon theme,
 * microphone icon, voice waves, and particle effects.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import VoiceWaves from './VoiceWaves';
import './VoiceOrb.css';

function AnimatedSphere({ isListening, isSpeaking, isTranslating }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const materialRef = useRef();

  const state = isListening ? 'listening' : isSpeaking ? 'speaking' : isTranslating ? 'translating' : 'idle';

  const colors = useMemo(() => ({
    idle: new THREE.Color('#6A0DAD'),
    listening: new THREE.Color('#FF8C00'),
    speaking: new THREE.Color('#E040FB'),
    translating: new THREE.Color('#9C27B0'),
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (meshRef.current) {
      const rotSpeed = state === 'translating' ? 1.5 : state === 'listening' ? 0.5 : 0.15;
      meshRef.current.rotation.y += rotSpeed * 0.012;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.12;

      const pulseAmp = state === 'listening' ? 0.14 : state === 'speaking' ? 0.1 : 0.04;
      const pulseSpeed = state === 'listening' ? 3.5 : state === 'speaking' ? 4.5 : 1.2;
      const s = 1 + Math.sin(t * pulseSpeed) * pulseAmp;
      meshRef.current.scale.setScalar(s);
    }

    if (glowRef.current) {
      const glowScale = 1.35 + Math.sin(t * 2) * 0.08;
      glowRef.current.scale.setScalar(glowScale);
      glowRef.current.material.opacity = state === 'idle' ? 0.08 : 0.18;
    }

    if (materialRef.current) {
      materialRef.current.color.lerp(colors[state], 0.06);
      const targetDistort = state === 'listening' ? 0.65 : state === 'speaking' ? 0.45 : state === 'translating' ? 0.55 : 0.25;
      materialRef.current.distort += (targetDistort - materialRef.current.distort) * 0.06;
      materialRef.current.emissive.lerp(colors[state], 0.04);
      const targetIntensity = state === 'idle' ? 0.15 : 0.55;
      materialRef.current.emissiveIntensity += (targetIntensity - materialRef.current.emissiveIntensity) * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.3, 24]} />
          <MeshDistortMaterial
            ref={materialRef}
            color="#6A0DAD"
            emissive="#6A0DAD"
            emissiveIntensity={0.15}
            roughness={0.1}
            metalness={0.85}
            distort={0.25}
            speed={3}
            transparent
            opacity={0.95}
          />
        </mesh>
      </Float>
    </group>
  );
}

function ParticleRing({ isActive }) {
  const ref = useRef();
  const count = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.4 + Math.random() * 0.4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * (isActive ? 0.35 : 0.12);
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.25) * 0.12;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={isActive ? 0.045 : 0.03}
        color="#FF8C00"
        transparent
        opacity={isActive ? 0.8 : 0.4}
        sizeAttenuation
      />
    </points>
  );
}

function InnerGlowRing() {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.3;
      ref.current.rotation.x = Math.PI / 2;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.85, 0.02, 16, 80]} />
      <meshBasicMaterial color="#E040FB" transparent opacity={0.35} />
    </mesh>
  );
}

export default function VoiceOrb({ isListening, isSpeaking, isTranslating, showStatus = false }) {
  const isActive = isListening || isSpeaking || isTranslating;
  const state = isListening ? 'listening' : isSpeaking ? 'speaking' : isTranslating ? 'translating' : 'idle';

  return (
    <div className="voice-orb-container" id="voice-orb">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-4, 2, 3]} intensity={0.8} color="#6A0DAD" />
        <pointLight position={[4, -2, 2]} intensity={0.6} color="#FF8C00" />
        <pointLight position={[0, 3, -3]} intensity={0.4} color="#E040FB" />

        <VoiceWaves
          isListening={isListening}
          isSpeaking={isSpeaking}
          isTranslating={isTranslating}
        />
        <AnimatedSphere
          isListening={isListening}
          isSpeaking={isSpeaking}
          isTranslating={isTranslating}
        />
        <ParticleRing isActive={isActive} />
        <InnerGlowRing />
        <Sparkles
          count={isActive ? 80 : 40}
          scale={5}
          size={2}
          speed={0.4}
          color="#FF8C00"
          opacity={0.6}
        />
      </Canvas>

      <div className="orb-mic-overlay">
        <div className={`orb-mic-icon ${state}`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3z"
              fill="currentColor"
            />
            <path
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {showStatus && (
        <div className={`orb-status ${state}`}>
          <span className="orb-status-dot" />
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isTranslating ? 'Translating...' : 'Ready'}
        </div>
      )}
    </div>
  );
}
