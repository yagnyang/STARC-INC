import { useEffect, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';

const planetsData = [
  {
    name: 'Sun', texture: '/sun.jpg', size: 5, pos: [0, 0, 0], emissive: true,
    info: "The Sun is a yellow dwarf star, a hot ball of glowing gases at the heart of our solar system. Its gravity holds the solar system together.",
    stats: { "Type": "Yellow Dwarf", "Radius": "696,340 km", "Age": "4.6 Billion Years" }
  },
  {
    name: 'Mercury', texture: '/mercury.jpg', size: 0.5, pos: [8, 0, 0],
    info: "The smallest planet in our solar system and closest to the Sun. It is only slightly larger than Earth's Moon.",
    stats: { "Type": "Terrestrial", "Radius": "2,439 km", "Orbital Period": "88 Days" }
  },
  {
    name: 'Venus', texture: '/venus.jpg', size: 0.8, pos: [12, 0, 0],
    info: "Venus spins slowly in the opposite direction from most planets. A thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system.",
    stats: { "Type": "Terrestrial", "Radius": "6,051 km", "Surface Temp": "465Â°C" }
  },
  {
    name: 'Earth', texture: '/earth.jpg', size: 1, pos: [16, 0, 0], clouds: '/earth_clouds.png',
    info: "Our home planet is the only place we know of so far that's inhabited by living things. It's also the only planet in our solar system with liquid water on the surface.",
    stats: { "Type": "Terrestrial", "Radius": "6,371 km", "Moons": "1" }
  },
  {
    name: 'Mars', texture: '/mars.jpg', size: 0.7, pos: [20, 0, 0],
    info: "Mars is a dusty, cold, desert world with a very thin atmosphere. There is strong evidence Mars was—billions of years ago—wetter and warmer, with a thicker atmosphere.",
    stats: { "Type": "Terrestrial", "Radius": "3,389 km", "Moons": "2" }
  },
  {
    name: 'Jupiter', texture: '/jupiter.jpg', size: 2.5, pos: [28, 0, 0],
    info: "Jupiter is more than twice as massive than the other planets of our solar system combined. The Great Red Spot is a giant storm that is bigger than Earth.",
    stats: { "Type": "Gas Giant", "Radius": "69,911 km", "Moons": "95" }
  },
  {
    name: 'Saturn', texture: '/saturn.jpg', size: 2, pos: [38, 0, 0], ring: '/saturn_ring.png',
    info: "Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system. The other giant planets have rings, but none are as spectacular as Saturn's.",
    stats: { "Type": "Gas Giant", "Radius": "58,232 km", "Moons": "146" }
  },
  {
    name: 'Uranus', texture: '/uranus.jpg', size: 1.5, pos: [48, 0, 0],
    info: "Uranus rotates at a nearly 90-degree angle from the plane of its orbit. This unique tilt makes Uranus appear to spin on its side.",
    stats: { "Type": "Ice Giant", "Radius": "25,362 km", "Moons": "28" }
  },
  {
    name: 'Neptune', texture: '/neptune.jpg', size: 1.5, pos: [56, 0, 0],
    info: "Neptune is dark, cold, and whipped by supersonic winds. It was the first planet located through mathematical calculations.",
    stats: { "Type": "Ice Giant", "Radius": "24,622 km", "Moons": "16" }
  }
];

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}

function Planet({ planet, setFocusedPlanet, focusedPlanet }: { planet: any, setFocusedPlanet: (p: any) => void, focusedPlanet: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const map = useTexture(planet.texture) as THREE.Texture;
  const cloudsMap = planet.clouds ? useTexture(planet.clouds) as THREE.Texture : null;
  const ringMap = planet.ring ? useTexture(planet.ring) as THREE.Texture : null;

  const isFocused = focusedPlanet?.name === planet.name;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.006;
    }
  });

  return (
    <group position={new THREE.Vector3(...planet.pos)}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setFocusedPlanet(planet);
          speak(`${planet.name}. ${planet.info}`);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[planet.size, 64, 64]} />
        {planet.emissive ? (
          <meshBasicMaterial map={map} color="#ffffff" />
        ) : (
          <meshStandardMaterial map={map} roughness={0.7} metalness={0.1} />
        )}
      </mesh>

      {cloudsMap && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[planet.size * 1.01, 64, 64]} />
          <meshPhongMaterial map={cloudsMap} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      {planet.name === 'Saturn' && ringMap && (
        <mesh rotation={[Math.PI / 2 + 0.3, 0, 0]}>
          <ringGeometry args={[planet.size * 1.4, planet.size * 2.3, 64]} />
          <meshBasicMaterial map={ringMap} side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}

      {/* Educational Info Panel - Only show when focused */}
      {isFocused && (
        <Html
          position={[0, planet.size + 1.5, 0]}
          center
          distanceFactor={15}
          zIndexRange={[100, 0]}
        >
          <div className="bg-black/80 text-white p-4 rounded-lg border border-primary w-80 shadow-[0_0_15px_rgba(0,102,255,0.5)] backdrop-blur-md pointer-events-none select-none">
            <h2 className="text-2xl font-bold mb-2 text-primary border-b border-primary/30 pb-1">{planet.name}</h2>
            <p className="text-sm mb-3 leading-relaxed opacity-90">{planet.info}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(planet.stats).map(([key, value]) => (
                <div key={key} className="bg-white/10 p-2 rounded">
                  <span className="block opacity-60 uppercase text-[10px] tracking-wider">{key}</span>
                  <span className="font-semibold">{value as string}</span>
                </div>
              ))}
            </div>
            {/* Added a pulsing indicator for the AI voice guide */}
            <div className="mt-3 flex items-center gap-2 text-xs text-primary/80 bg-primary/10 p-1.5 rounded">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>AI Guide Speaking...</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraController({ focusedPlanet }: { focusedPlanet: any }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current && focusedPlanet) {
      const targetPos = new THREE.Vector3(...focusedPlanet.pos);
      // Move camera closer to the focused planet
      camera.position.set(
        targetPos.x + focusedPlanet.size * 3,
        targetPos.y + focusedPlanet.size * 2,
        targetPos.z + focusedPlanet.size * 3
      );
      controlsRef.current.target.copy(targetPos);
      controlsRef.current.update();
    } else if (controlsRef.current && !focusedPlanet) {
      // Default view (Earth)
      camera.position.set(16 + 3, 2, 3);
      controlsRef.current.target.set(16, 0, 0);
      controlsRef.current.update();
    }
  }, [focusedPlanet, camera]);

  return <OrbitControls ref={controlsRef} enableZoom={true} makeDefault enableDamping />;
}

function Scene({ focusedPlanet, setFocusedPlanet, isStereo }: { focusedPlanet: any, setFocusedPlanet: (p: any) => void, isStereo: boolean }) {
  // Load texture
  const texture = useLoader(THREE.TextureLoader, '/milkyway.jpg');
  texture.mapping = THREE.EquirectangularReflectionMapping;

  // Set the scene background
  const { scene } = useThree();
  useEffect(() => {
    if (scene) {
      scene.background = texture;
    }
  }, [scene, texture]);

  return (
    <>
      <ambientLight intensity={0.4} />
      {/* Sunlight */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />

      {planetsData.map((planet) => (
        <Planet key={planet.name} planet={planet} setFocusedPlanet={setFocusedPlanet} focusedPlanet={focusedPlanet} />
      ))}

      <CameraController focusedPlanet={focusedPlanet} />
    </>
  );
}

export default function VRSpaceView() {
  const [focusedPlanet, setFocusedPlanet] = useState<any>(planetsData.find(p => p.name === 'Earth'));
  const [isStereo, setIsStereo] = useState(false);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <>
      {/* Desktop Helper Text */}
      <div className="absolute top-20 left-4 z-50 bg-black/50 text-white p-4 rounded-lg pointer-events-none border border-primary/40 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-sm backdrop-blur-sm">
        <h1 className="font-bold text-xl text-primary mb-1 flex items-center gap-2">
          <span>âœ¨</span> Solar System Explorer
        </h1>
        <p className="text-sm opacity-80 mb-2">Interactive educational VR experience.</p>
        <div className="text-xs bg-white/10 p-2 rounded leading-tight">
          <p className="font-semibold text-white/90 mb-1">How to use:</p>
          <ul className="list-disc pl-4 space-y-1 opacity-80">
            <li>Click any planet to travel to it</li>
            <li>Read the holographic info panel</li>
            <li>Listen to the AI Voice Guide</li>
            <li>Drag & scroll to inspect</li>
          </ul>
        </div>
      </div>

      <button
        onClick={() => setIsStereo(!isStereo)}
        className="absolute top-4 right-4 z-50 bg-primary/80 hover:bg-primary px-4 py-2 rounded text-white border border-white/50 transition-colors font-bold shadow-lg"
      >
        {isStereo ? 'Exit Phone VR' : 'Enable Phone VR'}
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 overflow-x-auto max-w-[90vw] p-2 hide-scrollbar">
        {planetsData.map((planet) => (
          <button
            key={planet.name}
            onClick={() => {
              setFocusedPlanet(planet);
              speak(`${planet.name}. ${planet.info}`);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${focusedPlanet?.name === planet.name
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(0,102,255,0.6)] scale-105'
                : 'bg-black/60 text-white/80 border border-white/20 hover:bg-white/20 hover:scale-105 backdrop-blur-md'
              }`}
          >
            {planet.name}
          </button>
        ))}
      </div>

      <Canvas style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 10, background: '#000000' }}>
        <Scene focusedPlanet={focusedPlanet} setFocusedPlanet={setFocusedPlanet} isStereo={isStereo} />
      </Canvas>
    </>
  );
}
