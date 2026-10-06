"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function KineticCore() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Outer Wireframe Icosahedron (Interface Layer)
    const outerGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerSphere = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerSphere);

    // Inner Dense Core (AI Intelligence Layer)
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 3);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCore);

    // Floating Particle Cloud
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 5;
      positions[i + 1] = (Math.random() - 0.5) * 5;
      positions[i + 2] = (Math.random() - 0.5) * 5;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const rotVelocity = { x: 0.003, y: 0.005 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      if (!isDragging) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / container.clientWidth - 0.5;
        const y = (e.clientY - rect.top) / container.clientHeight - 0.5;
        rotVelocity.x = y * 0.01;
        rotVelocity.y = x * 0.01;
        return;
      }
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      outerSphere.rotation.y += deltaX * 0.008;
      outerSphere.rotation.x += deltaY * 0.008;
      innerCore.rotation.y -= deltaX * 0.008;
      innerCore.rotation.x -= deltaY * 0.008;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support for mobile
    let prevTouchPos = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevTouchPos.x;
      const deltaY = e.touches[0].clientY - prevTouchPos.y;
      outerSphere.rotation.y += deltaX * 0.008;
      outerSphere.rotation.x += deltaY * 0.008;
      innerCore.rotation.y -= deltaX * 0.008;
      innerCore.rotation.x -= deltaY * 0.008;
      prevTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop with Visibility Culling (Pause when offscreen)
    let animId: number = 0;
    let isVisible = false;

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        outerSphere.rotation.y += rotVelocity.y;
        outerSphere.rotation.x += rotVelocity.x;
        innerCore.rotation.y -= rotVelocity.y * 1.5;
        innerCore.rotation.x -= rotVelocity.x * 1.5;
        rotVelocity.x *= 0.96;
        rotVelocity.y *= 0.96;
        if (Math.abs(rotVelocity.x) < 0.002) rotVelocity.x = 0.002;
        if (Math.abs(rotVelocity.y) < 0.003) rotVelocity.y = 0.003;
      }

      particles.rotation.y += 0.001;
      particles.rotation.x -= 0.0005;

      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />;
}
