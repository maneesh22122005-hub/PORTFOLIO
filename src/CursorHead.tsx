import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Low-poly wireframe head that rotates to track the cursor           */
/* ------------------------------------------------------------------ */

function HeadModel() {
  const groupRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  // normalized pointer position in [-1, 1], relative to this canvas
  const pointer = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointer.current.set(
        THREE.MathUtils.clamp(x, -3, 3),
        THREE.MathUtils.clamp(y, -3, 3)
      );
    };
    // listen globally so the head keeps tracking even when the pointer
    // is elsewhere on the page, not just directly over the canvas
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [gl]);

  useFrame(() => {
    const px = THREE.MathUtils.clamp(pointer.current.x, -1.2, 1.2);
    const py = THREE.MathUtils.clamp(pointer.current.y, -1.2, 1.2);

    if (groupRef.current) {
      const targetRotY = px * 0.55;
      const targetRotX = -py * 0.35;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.08
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.08
      );
    }

    // subtle pupil shift toward cursor
    const shiftX = px * 0.05;
    const shiftY = py * 0.05;
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.35 + shiftX;
      leftPupilRef.current.position.y = 0.15 + shiftY;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.35 + shiftX;
      rightPupilRef.current.position.y = 0.15 + shiftY;
    }
  });

  return (
    <group ref={groupRef}>
      {/* skull - wireframe low-poly shell */}
      <mesh>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color="#00f2fe" wireframe transparent opacity={0.6} />
      </mesh>

      {/* faint solid fill for depth cue */}
      <mesh>
        <icosahedronGeometry args={[1.12, 1]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.35} roughness={0.6} />
      </mesh>

      {/* neck / jaw */}
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[0.32, 0.45, 0.9, 10, 1, true]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.45} />
      </mesh>

      {/* eye socket glow */}
      <mesh position={[-0.35, 0.15, 0.92]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0.35, 0.15, 0.92]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.25} />
      </mesh>

      {/* pupils - shift slightly toward cursor */}
      <mesh ref={leftPupilRef} position={[-0.35, 0.15, 0.95]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#e6fffb" />
      </mesh>
      <mesh ref={rightPupilRef} position={[0.35, 0.15, 0.95]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#e6fffb" />
      </mesh>
    </group>
  );
}

export default function CursorHeadCanvas({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={0.9} color="#00f2fe" />
        <pointLight position={[-3, -2, 2]} intensity={0.4} color="#10b981" />
        <HeadModel />
      </Canvas>
    </div>
  );
}
