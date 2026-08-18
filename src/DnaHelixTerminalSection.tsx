import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ------------------------------------------------------------------ */
/*  DNA Helix -> Coding Terminal auto-cycling transition               */
/*  Ported from the standalone three.js demo into a self-contained     */
/*  React section that mounts/unmounts cleanly inside the page.        */
/* ------------------------------------------------------------------ */

const TERMINAL_LINES: { text: string; color: string }[] = [
  { text: 'import numpy as np', color: '#c792ea' },
  { text: 'from bio.dna import Genome', color: '#c792ea' },
  { text: '', color: '#ffffff' },
  { text: 'genome = Genome.load("sequence.fa")', color: '#82aaff' },
  { text: 'print(genome.length)', color: '#82aaff' },
  { text: '>> 3,088,269,832', color: '#89ddff' },
  { text: '', color: '#ffffff' },
  { text: 'def transcribe(strand):', color: '#c3e88d' },
  { text: '    return strand.replace("T", "U")', color: '#c3e88d' },
  { text: '', color: '#ffffff' },
  { text: 'rna = transcribe(genome.strand_a)', color: '#82aaff' },
  { text: 'print(rna[:12])', color: '#82aaff' },
  { text: '>> AUGCCGUACGGA', color: '#89ddff' },
  { text: '', color: '#ffffff' },
  { text: '# Compiling helix render pipeline...', color: '#546e7a' },
  { text: 'render(status="OK")', color: '#f78c6c' },
];

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function DnaHelixTerminalSection() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phaseLabel, setPhaseLabel] = useState('DNA Helix');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    // ===== Scene / Camera / Renderer =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false; // don't hijack page scroll
    controls.minDistance = 4;
    controls.maxDistance = 30;

    // ===== Lighting =====
    const ambient = new THREE.AmbientLight(0x8899aa, 0.6);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x4477ff, 0.5);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // ===== Helix group =====
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const HELIX_HEIGHT = 12;
    const HELIX_RADIUS = 1.6;
    const TURNS = 4;
    const POINTS_PER_TURN = 24;
    const TOTAL_POINTS = TURNS * POINTS_PER_TURN;

    function strandPoint(i: number, phaseOffset: number) {
      const t = i / TOTAL_POINTS;
      const angle = t * TURNS * Math.PI * 2 + phaseOffset;
      const y = t * HELIX_HEIGHT - HELIX_HEIGHT / 2;
      return new THREE.Vector3(
        Math.cos(angle) * HELIX_RADIUS,
        y,
        Math.sin(angle) * HELIX_RADIUS
      );
    }

    const strandAPoints: THREE.Vector3[] = [];
    const strandBPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= TOTAL_POINTS; i++) {
      strandAPoints.push(strandPoint(i, 0));
      strandBPoints.push(strandPoint(i, Math.PI));
    }

    const curveA = new THREE.CatmullRomCurve3(strandAPoints);
    const curveB = new THREE.CatmullRomCurve3(strandBPoints);
    const tubeGeoA = new THREE.TubeGeometry(curveA, 400, 0.12, 8, false);
    const tubeGeoB = new THREE.TubeGeometry(curveB, 400, 0.12, 8, false);

    const backboneMatA = new THREE.MeshStandardMaterial({
      color: 0x3fa9f5,
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
    });
    const backboneMatB = new THREE.MeshStandardMaterial({
      color: 0xf53f8c,
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
    });
    const backboneA = new THREE.Mesh(tubeGeoA, backboneMatA);
    const backboneB = new THREE.Mesh(tubeGeoB, backboneMatB);
    helixGroup.add(backboneA, backboneB);

    const baseColors = [0x4fd1c5, 0xf6ad55, 0x9f7aea, 0x68d391];

    const nucleoGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const nucleoMatA = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      vertexColors: true,
    });
    const nucleoMatB = nucleoMatA.clone();

    const nucleoA = new THREE.InstancedMesh(nucleoGeo, nucleoMatA, TOTAL_POINTS + 1);
    const nucleoB = new THREE.InstancedMesh(nucleoGeo, nucleoMatB, TOTAL_POINTS + 1);

    const dummy = new THREE.Object3D();
    const colorArrayA = new Float32Array((TOTAL_POINTS + 1) * 3);
    const colorArrayB = new Float32Array((TOTAL_POINTS + 1) * 3);
    const tmpColor = new THREE.Color();

    for (let i = 0; i <= TOTAL_POINTS; i++) {
      const pA = strandAPoints[i];
      const pB = strandBPoints[i];
      const baseIdx = i % baseColors.length;

      dummy.position.copy(pA);
      dummy.updateMatrix();
      nucleoA.setMatrixAt(i, dummy.matrix);
      tmpColor.set(baseColors[baseIdx]);
      tmpColor.toArray(colorArrayA, i * 3);

      dummy.position.copy(pB);
      dummy.updateMatrix();
      nucleoB.setMatrixAt(i, dummy.matrix);
      tmpColor.set(baseColors[(baseIdx + 2) % baseColors.length]);
      tmpColor.toArray(colorArrayB, i * 3);
    }
    nucleoA.instanceColor = new THREE.InstancedBufferAttribute(colorArrayA, 3);
    nucleoB.instanceColor = new THREE.InstancedBufferAttribute(colorArrayB, 3);
    nucleoA.instanceMatrix.needsUpdate = true;
    nucleoB.instanceMatrix.needsUpdate = true;
    helixGroup.add(nucleoA, nucleoB);

    // base-pair rungs
    const rungStep = 2;
    const rungCount = Math.floor(TOTAL_POINTS / rungStep) + 1;
    const rungGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 6, 1, true);
    const rungMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e0,
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
    });
    const rungs = new THREE.InstancedMesh(rungGeo, rungMat, rungCount);
    const rungColorArray = new Float32Array(rungCount * 3);
    let rIdx = 0;
    for (let i = 0; i <= TOTAL_POINTS; i += rungStep) {
      const pA = strandAPoints[i];
      const pB = strandBPoints[i];
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(pB, pA);
      const len = dir.length();
      dir.normalize();

      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      dummy.position.copy(mid);
      dummy.quaternion.copy(quat);
      dummy.scale.set(1, len, 1);
      dummy.updateMatrix();
      rungs.setMatrixAt(rIdx, dummy.matrix);

      tmpColor.set(baseColors[(i / rungStep) % baseColors.length]).multiplyScalar(0.7).addScalar(0.15);
      tmpColor.toArray(rungColorArray, rIdx * 3);
      rIdx++;
    }
    rungs.instanceColor = new THREE.InstancedBufferAttribute(rungColorArray, 3);
    rungs.instanceMatrix.needsUpdate = true;
    helixGroup.add(rungs);

    // ambient particle field
    const PARTICLE_COUNT = 500;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 4 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * HELIX_HEIGHT * 1.6;
      particlePositions[i * 3] = Math.cos(theta) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x88aaff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ===== Coding terminal (canvas texture on a plane) =====
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;

    let typedLineCount = 0;
    let typedCharsInLine = 0;
    let cursorBlink = true;
    let terminalTimer = 0;
    let typingAccumulator = 0;

    function drawTerminal() {
      if (!ctx) return;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#161b22';
      ctx.fillRect(0, 0, canvas.width, 46);
      const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dotColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(28 + i * 26, 23, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#8b949e';
      ctx.font = '18px monospace';
      ctx.fillText('genome_pipeline.py — terminal', canvas.width / 2 - 140, 29);

      ctx.font = '22px monospace';
      const startY = 80;
      const lineHeight = 32;

      for (let li = 0; li < typedLineCount; li++) {
        const line = TERMINAL_LINES[li];
        if (!line) continue;
        const isCurrent = li === typedLineCount - 1;
        const textToDraw = isCurrent ? line.text.slice(0, typedCharsInLine) : line.text;
        ctx.fillStyle = line.color;
        ctx.fillText(textToDraw, 30, startY + li * lineHeight);

        if (isCurrent && cursorBlink) {
          const textWidth = ctx.measureText(textToDraw).width;
          ctx.fillStyle = '#e6edf3';
          ctx.fillRect(32 + textWidth, startY + li * lineHeight - 20, 10, 24);
        }
      }
      canvasTexture.needsUpdate = true;
    }
    drawTerminal();

    function updateTypingAnimation(dt: number) {
      terminalTimer += dt;
      const blinkInterval = 0.5;
      if (terminalTimer > blinkInterval) {
        terminalTimer = 0;
        cursorBlink = !cursorBlink;
      }

      typingAccumulator += dt;
      const charInterval = 0.018;
      if (typingAccumulator > charInterval && typedLineCount < TERMINAL_LINES.length) {
        typingAccumulator = 0;
        const currentLine = TERMINAL_LINES[typedLineCount];
        if (typedCharsInLine < currentLine.text.length) {
          typedCharsInLine++;
        } else {
          typedLineCount++;
          typedCharsInLine = 0;
        }
        drawTerminal();
      } else if (typedLineCount >= TERMINAL_LINES.length) {
        drawTerminal();
      }
    }

    const terminalGeo = new THREE.PlaneGeometry(8, 5);
    const terminalMat = new THREE.MeshBasicMaterial({ map: canvasTexture, transparent: true, opacity: 0 });
    const terminalMesh = new THREE.Mesh(terminalGeo, terminalMat);
    terminalMesh.visible = false;
    terminalMesh.scale.set(0.01, 0.01, 0.01);
    scene.add(terminalMesh);

    const frameGeo = new THREE.PlaneGeometry(8.2, 5.2);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x30363d, transparent: true, opacity: 0 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.z = -0.01;
    frameMesh.visible = false;
    terminalMesh.add(frameMesh);

    // ===== Transition state machine =====
    // Phases: 'helix' -> 'toTerminal' -> 'terminal' -> 'toHelix' -> back to 'helix'
    let phase: 'helix' | 'toTerminal' | 'terminal' | 'toHelix' = 'helix';
    let phaseTime = 0;
    let lastLabel = 'DNA Helix';
    const HOLD_DURATION = 4.0;
    const TRANSITION_DURATION = 1.8;

    function setOpacityRecursive(object: THREE.Object3D, opacity: number) {
      object.traverse((obj: any) => {
        if (obj.material) {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      });
    }
    [backboneMatA, backboneMatB, nucleoMatA, nucleoMatB, rungMat].forEach((m) => {
      m.transparent = true;
    });

    function applyLabel(label: string) {
      if (lastLabel !== label) {
        lastLabel = label;
        setPhaseLabel(label);
      }
    }

    function updateTransition(dt: number) {
      phaseTime += dt;

      if (phase === 'helix') {
        helixGroup.visible = true;
        helixGroup.scale.setScalar(1);
        setOpacityRecursive(helixGroup, 1);
        terminalMesh.visible = false;
        frameMesh.visible = false;
        applyLabel('DNA Helix');

        if (phaseTime > HOLD_DURATION) {
          phase = 'toTerminal';
          phaseTime = 0;
        }
      } else if (phase === 'toTerminal') {
        const t = Math.min(phaseTime / TRANSITION_DURATION, 1);
        const e = easeInOutCubic(t);

        helixGroup.visible = true;
        terminalMesh.visible = true;
        frameMesh.visible = true;

        helixGroup.scale.setScalar(Math.max(1 - e, 0.001));
        setOpacityRecursive(helixGroup, 1 - e);

        terminalMesh.scale.setScalar(0.05 + e * 0.95);
        terminalMat.opacity = e;
        frameMat.opacity = e * 0.9;

        applyLabel('Compiling...');

        if (t >= 1) {
          phase = 'terminal';
          phaseTime = 0;
          typedLineCount = 0;
          typedCharsInLine = 0;
          typingAccumulator = 0;
        }
      } else if (phase === 'terminal') {
        helixGroup.visible = false;
        terminalMesh.visible = true;
        frameMesh.visible = true;
        terminalMesh.scale.setScalar(1);
        terminalMat.opacity = 1;
        frameMat.opacity = 0.9;
        applyLabel('Terminal');

        updateTypingAnimation(dt);

        if (phaseTime > HOLD_DURATION + 2.5) {
          phase = 'toHelix';
          phaseTime = 0;
        }
      } else if (phase === 'toHelix') {
        const t = Math.min(phaseTime / TRANSITION_DURATION, 1);
        const e = easeInOutCubic(t);

        helixGroup.visible = true;
        terminalMesh.visible = true;
        frameMesh.visible = true;

        helixGroup.scale.setScalar(Math.max(e, 0.001));
        setOpacityRecursive(helixGroup, e);

        terminalMesh.scale.setScalar(Math.max(1 - e * 0.95, 0.001));
        terminalMat.opacity = 1 - e;
        frameMat.opacity = (1 - e) * 0.9;

        applyLabel('Decompiling...');

        if (t >= 1) {
          phase = 'helix';
          phaseTime = 0;
          terminalMesh.visible = false;
          frameMesh.visible = false;
        }
      }
    }

    // ===== Animation loop =====
    const clock = new THREE.Clock();
    function animate() {
      const dt = Math.min(clock.getDelta(), 0.05);

      helixGroup.rotation.y += dt * 0.25;
      particles.rotation.y += dt * 0.02;

      updateTransition(dt);

      controls.update();
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    // ===== Resize (observes the section container, not window) =====
    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();

      [tubeGeoA, tubeGeoB, nucleoGeo, rungGeo, terminalGeo, frameGeo, particleGeo].forEach((g) =>
        g.dispose()
      );
      [
        backboneMatA,
        backboneMatB,
        nucleoMatA,
        nucleoMatB,
        rungMat,
        terminalMat,
        frameMat,
        particleMat,
      ].forEach((m) => m.dispose());
      canvasTexture.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      id="terminal"
      className="relative w-full h-screen h-[100dvh] bg-[#05070a] overflow-hidden"
    >
      <div ref={mountRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute top-6 left-6 z-10 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200 text-[13px] font-mono tracking-wide backdrop-blur-sm">
        {phaseLabel}
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 z-10 max-w-sm text-slate-400 text-sm font-mono leading-relaxed">
        Genome sequence compiling into a render pipeline. Drag to orbit.
      </div>
    </section>
  );
}
