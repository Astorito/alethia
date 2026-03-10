"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { PoliticianWithParty } from "@/lib/types";

interface SphereCardProps {
  politician: PoliticianWithParty;
  index: number;
  total: number;
  radius: number;
  onClick: (politician: PoliticianWithParty) => void;
  isHovered: boolean;
  onHover: (index: number | null) => void;
}

function SphereCard({ politician, index, total, radius, onClick, isHovered, onHover }: SphereCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate position using golden angle spiral for even distribution
  const position = useMemo(() => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996323
    const y = 1 - (index / (total - 1)) * 2; // y goes from 1 to -1
    const theta = goldenAngle * index;
    const radiusAtY = Math.sqrt(1 - y * y);
    
    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;
    const yPos = y * radius * 0.6; // Flatten slightly for better viewing
    
    return new THREE.Vector3(x, yPos, z);
  }, [index, total, radius]);

  // Look at center but flip to face outward
  const lookAtTarget = useMemo(() => {
    return position.clone().multiplyScalar(2);
  }, [position]);

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth hover animation
      const targetScale = isHovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Face the camera when hovered, otherwise face outward
      if (isHovered) {
        meshRef.current.lookAt(state.camera.position);
      } else {
        meshRef.current.lookAt(lookAtTarget);
      }
    }
  });

  // Calculate opacity based on Z position (depth)
  const depthOpacity = useMemo(() => {
    const normalizedZ = (position.z + radius) / (radius * 2); // 0 to 1
    return 0.4 + normalizedZ * 0.6; // 0.4 to 1.0
  }, [position, radius]);

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => {
        setHovered(true);
        onHover(index);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={() => onClick(politician)}
    >
      {/* Card background */}
      <mesh>
        <planeGeometry args={[2.2, 3]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={depthOpacity * 0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Card border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.24, 3.04]} />
        <meshBasicMaterial 
          color={politician.party?.color_hex || "#e5e5e5"} 
          transparent 
          opacity={depthOpacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Photo container */}
      <group position={[0, 0.5, 0.02]}>
        {/* Photo background circle */}
        <mesh>
          <circleGeometry args={[0.7, 32]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Photo image using Html for better image handling */}
        <Html
          transform
          occlude
          position={[0, 0, 0.01]}
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            overflow: "hidden",
            opacity: depthOpacity,
          }}
        >
          <img
            src={politician.photo_url}
            alt={politician.full_name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              border: `3px solid ${politician.party?.color_hex || "#e5e5e5"}`,
            }}
          />
        </Html>
      </group>

      {/* Name text */}
      <Text
        position={[0, -0.5, 0.02]}
        fontSize={0.18}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
        font="/fonts/Inter-Bold.woff"
      >
        {politician.full_name}
      </Text>

      {/* Party badge */}
      <Text
        position={[0, -0.85, 0.02]}
        fontSize={0.12}
        color={politician.party?.color_hex || "#6b7280"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Medium.woff"
      >
        {politician.party?.short_name || "Sin bloque"}
      </Text>

      {/* Score */}
      <Text
        position={[0, -1.15, 0.02]}
        fontSize={0.14}
        color="#4b5563"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.woff"
      >
        Score: {politician.consistency_score.toFixed(1)}
      </Text>

      {/* Hover indicator */}
      {isHovered && (
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.3, 3.1]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.1} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

interface SphereContainerProps {
  politicians: PoliticianWithParty[];
  onSelect: (politician: PoliticianWithParty) => void;
}

function SphereContainer({ politicians, onSelect }: SphereContainerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });
  const { camera, gl } = useThree();

  // Auto-rotation when not interacting
  useFrame((state, delta) => {
    if (groupRef.current && !isDragging) {
      // Apply inertia
      rotationVelocity.current.x *= 0.95;
      rotationVelocity.current.y *= 0.95;
      
      // Slow auto-rotation
      groupRef.current.rotation.y += 0.001 + rotationVelocity.current.y * delta;
      groupRef.current.rotation.x += rotationVelocity.current.x * delta * 0.3;
    }
  });

  // Handle mouse/touch events for rotation
  const handlePointerDown = (e: THREE.Event<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    gl.domElement.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: THREE.Event<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    
    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;
    
    rotationVelocity.current.y = deltaX * 0.001;
    rotationVelocity.current.x = deltaY * 0.001;
    
    if (groupRef.current) {
      groupRef.current.rotation.y += deltaX * 0.005;
      groupRef.current.rotation.x += deltaY * 0.005;
    }
    
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: THREE.Event<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    gl.domElement.releasePointerCapture(e.pointerId);
  };

  // Limit to 30 politicians
  const displayPoliticians = politicians.slice(0, 30);
  const radius = 8;

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {displayPoliticians.map((politician, index) => (
        <SphereCard
          key={politician.id}
          politician={politician}
          index={index}
          total={displayPoliticians.length}
          radius={radius}
          onClick={onSelect}
          isHovered={hoveredIndex === index}
          onHover={setHoveredIndex}
        />
      ))}
    </group>
  );
}

interface PoliticianSphereProps {
  politicians: PoliticianWithParty[];
  onSelect: (politician: PoliticianWithParty) => void;
}

export function PoliticianSphere({ politicians, onSelect }: PoliticianSphereProps) {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <SphereContainer politicians={politicians} onSelect={onSelect} />
      </Canvas>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
        <p className="text-xs text-gray-400 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
          Arrastra para rotar • Click para ver detalles
        </p>
      </div>
    </div>
  );
}
