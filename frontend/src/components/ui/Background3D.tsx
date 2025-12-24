import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

const Background3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scene = new THREE.Scene();

        // Adjust fog based on theme
        // Adjust fog based on theme
        const isDark = theme === 'dark';
        const bgColor = isDark ? 0x050505 : 0xffffff;
        scene.fog = new THREE.FogExp2(bgColor, 0.03);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(ambientLight);

        const lights = [
            { color: 0x2dd4bf, pos: [5, 5, 5] },  // Teal
            { color: 0xa78bfa, pos: [-5, -5, 5] }, // Purple
            { color: 0x60a5fa, pos: [0, 5, -5] }   // Blue
        ];

        lights.forEach(l => {
            const light = new THREE.PointLight(l.color, 1.5, 20);
            light.position.set(l.pos[0], l.pos[1], l.pos[2]);
            scene.add(light);
        });

        // The "Brain/Neural" Sphere
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const material = new THREE.MeshPhysicalMaterial({
            color: isDark ? 0x2a2a2a : 0xe5e7eb, // Lighter gray for dark mode visibility
            roughness: 0.2,
            metalness: 0.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: isDark ? 0x2a2a2a : 0xffffff,
            emissiveIntensity: isDark ? 0.4 : 0.5 // Higher intensity for dark mode visibility
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 300;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: isDark ? 0xffffff : 0x000000,
            transparent: true,
            opacity: isDark ? 0.4 : 0.2
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Animation
        const clock = new THREE.Clock();
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Breathing Sphere
            sphere.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
            sphere.rotation.y = t * 0.1;
            sphere.rotation.z = t * 0.05;

            // Rotating Lights (Simulate Aurora)
            const radius = 6;
            scene.children.forEach(child => {
                if ((child as THREE.PointLight).isPointLight) {
                    child.position.x = Math.sin(t * 0.5 + child.id) * radius;
                    child.position.y = Math.cos(t * 0.3 + child.id) * radius;
                }
            });

            // Particles Swirl
            particlesMesh.rotation.y = -t * 0.05;

            renderer.render(scene, camera);
        };
        animate();

        // Responsive
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [theme]); // Re-run when theme changes to update colors

    return (
        <div
            ref={containerRef}
            id="canvas-container"
            className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none"
        />
    );
};

export default Background3D;
