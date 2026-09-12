"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

/**
 * ============================================================================
 * 1. DATA STRUCTURES & COORDINATES
 * ============================================================================
 * Photorealistic 3D Satellite Globe for Global Education Agency
 */

export interface GlobeNode {
  id: string;
  name: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  color: string;
  glowColor: string;
  url?: string;
  tag: string;
  intake?: string;
  isOrigin?: boolean;
  scholarship?: string;
  topPrograms?: string[];
  partnerCount?: string;
  visaRate?: string;
}

export interface GlobeArc {
  id: string;
  from: string;
  to: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  startColor: string; // Origin color: Electric Cyan (#00f2fe)
  endColor: string; // Destination color: Neon Purple / Country accent
  altitude: number; // Arc height factor
  speed: number; // Speed multiplier for traveling shooting star
  trailLength: number; // Number of trailing comet photon particles
  destUrl?: string;
  destName: string;
}

// Origin Point: Dhaka, Bangladesh (Bay of Bengal / Ganges Delta)
export const ORIGIN_NODE: GlobeNode = {
  id: "dhaka",
  name: "Bangladesh Central Advisory Desk",
  country: "Bangladesh",
  city: "Dhaka",
  lat: 23.8103,
  lng: 90.4125,
  color: "#00f2fe", // Electric Cyan
  glowColor: "rgba(0, 242, 254, 0.95)",
  tag: "BD",
  isOrigin: true,
  scholarship: "Free Initial Profile Assessment & Scholarship Matching",
  topPrograms: [
    "University Selection",
    "SOP & Visa Filing",
    "Bangladesh Bank Student File",
  ],
  partnerCount: "40+ Direct Global Partner Universities",
  visaRate: "Central Advisory Desk",
};

// Destination Points with Academic Intel
export const DESTINATION_NODES: GlobeNode[] = [
  {
    id: "china",
    name: "China (Beijing & Zhejiang)",
    country: "China",
    city: "Beijing",
    lat: 39.9042,
    lng: 116.4074,
    color: "#ff2a55", // Neon Crimson
    glowColor: "rgba(255, 42, 85, 0.9)",
    tag: "CN",
    url: "/destinations/china",
    intake: "Spring 2027",
    scholarship: "100% CSC & Presidential Full Tuition + Monthly Stipend",
    topPrograms: [
      "MBBS (English)",
      "Computer Science & AI",
      "Civil & Mechanical Eng",
    ],
    partnerCount: "25+ MoE Ranked Campuses",
    visaRate: "99.2% JW202 Visa Success",
  },
  {
    id: "malaysia",
    name: "Malaysia (Kuala Lumpur)",
    country: "Malaysia",
    city: "Kuala Lumpur",
    lat: 3.139,
    lng: 101.6869,
    color: "#00f2fe", // Electric Cyan
    glowColor: "rgba(0, 242, 254, 0.9)",
    tag: "MY",
    url: "/destinations/malaysia",
    intake: "Feb 2027",
    scholarship: "Up to 50% Merit Waivers · UK/Australian Dual Degrees",
    topPrograms: [
      "Software Engineering",
      "Business & Fintech",
      "Biotechnology",
    ],
    partnerCount: "18+ QS Top 200 Campuses",
    visaRate: "98.7% Fast EMGS Approval",
  },
  {
    id: "south-korea",
    name: "South Korea (Seoul)",
    country: "South Korea",
    city: "Seoul",
    lat: 37.5665,
    lng: 126.978,
    color: "#a855f7", // Neon Purple
    glowColor: "rgba(168, 85, 247, 0.9)",
    tag: "KR",
    url: "/destinations/south-korea",
    intake: "March 2027",
    scholarship: "GKS Government Scholarship · 30–100% University Waivers",
    topPrograms: [
      "AI & Robotics",
      "Global Business & Media",
      "Korean Language",
    ],
    partnerCount: "15+ Top National & Private Univs",
    visaRate: "97.5% Embassy Approval",
  },
  {
    id: "india",
    name: "India (Delhi & Bangalore)",
    country: "India",
    city: "New Delhi",
    lat: 28.6139,
    lng: 77.209,
    color: "#fbbf24", // Amber Gold
    glowColor: "rgba(251, 191, 36, 0.9)",
    tag: "IN",
    url: "/destinations/india",
    intake: "Spring 2027",
    scholarship: "Up to 100% Study in India (SII) Scholarships",
    topPrograms: ["B.Tech Computer Science", "Pharmacy & Nursing", "BBA & MBA"],
    partnerCount: "30+ NAAC A++ Campuses",
    visaRate: "99.5% Visa Success",
  },
  {
    id: "europe",
    name: "Europe (Frankfurt / Germany)",
    country: "Europe",
    city: "Frankfurt",
    lat: 50.1109,
    lng: 8.6821,
    color: "#38bdf8", // Sky Blue
    glowColor: "rgba(56, 189, 248, 0.9)",
    tag: "EU",
    url: "/destinations",
    intake: "Fall 2027",
    scholarship: "Tuition-Free Public Univs · 50% Private Waivers",
    topPrograms: [
      "Data Science",
      "Automotive & Mechanical",
      "International Mgmt",
    ],
    partnerCount: "12+ German & EU Campuses",
    visaRate: "98.1% Blocked Account Visa Support",
  },
];

// All nodes combined
export const ALL_NODES: GlobeNode[] = [ORIGIN_NODE, ...DESTINATION_NODES];

/**
 * Arcs mapping from Dhaka to all destination hubs.
 */
export const ARCS_DATA: GlobeArc[] = DESTINATION_NODES.map((dest, idx) => ({
  id: `arc-dhaka-${dest.id}`,
  from: ORIGIN_NODE.name,
  to: dest.name,
  startLat: ORIGIN_NODE.lat,
  startLng: ORIGIN_NODE.lng,
  endLat: dest.lat,
  endLng: dest.lng,
  startColor: "#00f2fe", // Electric Cyan
  endColor: dest.color || "#a855f7", // Destination color
  altitude: 0.24 + idx * 0.03, // Parabolic 3D loop height
  speed: 0.0036 + idx * 0.0005, // Dynamic, visible cruising flight speed (4-5s flight duration)
  trailLength: 26, // Trailing student flight contrail particles
  destUrl: dest.url,
  destName: dest.name,
}));

/**
 * ============================================================================
 * 2. GEOGRAPHIC COORDINATE CONVERTER
 * Converts (latitude, longitude) on a sphere into 3D Cartesian Vector (x, y, z)
 * Perfectly calibrated with Three.js SphereGeometry equirectangular UV layout.
 * ============================================================================
 */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates an ultra-crisp retina canvas sprite badge for 3D billboard labels
 */
function createCountryBadgeTexture(
  tag: string,
  color: string,
  isOrigin?: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = isOrigin ? 400 : 340;
  canvas.height = 130;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padX = 14;
  const padY = 14;
  const w = canvas.width - padX * 2;
  const h = canvas.height - padY * 2;
  const r = h / 2;
  const x = padX;
  const y = padY;

  // 1. Soft cyber glow behind the badge
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 2. Dark glassmorphic pill background
  ctx.fillStyle = isOrigin ? "rgba(2, 14, 32, 0.96)" : "rgba(3, 9, 26, 0.94)";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // 3. Crisp glowing neon border
  ctx.lineWidth = 4.0;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Reset shadow for crisp text & icon
  ctx.shadowBlur = 0;

  // 4. Academic Insignia / Origin Indicator
  if (isOrigin) {
    // Central Hub Compass Pin
    const pinX = x + 38;
    const pinY = y + h / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pinX, pinY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(pinX, pinY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Origin Tag
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 38px Inter, system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("BANGLADESH", pinX + 22, pinY + 1);
  } else {
    // Bold Academic Graduation Cap (Mortarboard) vector insignia
    const capX = x + 44;
    const capY = y + h / 2;

    // Top Diamond Rhombus Mortarboard
    ctx.fillStyle = "#fbbf24"; // Radiant Gold Cap
    ctx.beginPath();
    ctx.moveTo(capX, capY - 14);
    ctx.lineTo(capX + 22, capY - 4);
    ctx.lineTo(capX, capY + 6);
    ctx.lineTo(capX - 22, capY - 4);
    ctx.closePath();
    ctx.fill();

    // Thin bright border on mortarboard
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Cap Skullcap underneath
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(capX - 12, capY - 2);
    ctx.quadraticCurveTo(capX, capY + 12, capX + 12, capY - 2);
    ctx.fill();

    // Hanging Gold Tassel with Bead
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(capX, capY - 4);
    ctx.lineTo(capX + 22, capY + 2);
    ctx.lineTo(capX + 22, capY + 12);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(capX + 22, capY + 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Country Tag Text (e.g. CN, MY, KR, IN, EU)
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 46px Inter, system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(tag, capX + 34, capY + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * ============================================================================
 * 3. ATMOSPHERIC RAYLEIGH SCATTERING SHADER
 * Produces an authentic cyan-to-azure limb glow as seen from satellite orbit
 * ============================================================================
 */
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      // Smooth atmospheric horizon limb falloff hugging the planet curvature
      float rim = 1.0 - clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
      float alpha = pow(rim, 3.6) * 0.75;

      // Sunward direction: Sun light comes from top-left and top-right
      float sunFactor = clamp((-vNormal.x * 0.5 + vNormal.y * 0.7), 0.0, 1.0);

      // Blend from website sunset amber on sunward rim to soft atmospheric azure on shadow rim
      vec3 sunsetAtmosphere = vec3(1.0, 0.65, 0.30); // #FFA64D Sunset Amber
      vec3 skyAtmosphere = vec3(0.24, 0.70, 0.98);    // #3DB3FA Soft Sky Cyan
      vec3 atmosphereColor = mix(skyAtmosphere, sunsetAtmosphere, sunFactor * 0.65);

      gl_FragColor = vec4(atmosphereColor, alpha);
    }
  `,
};

/**
 * ============================================================================
 * 4. 3D INTERACTIVE PHOTOREALISTIC SATELLITE GLOBE
 * ============================================================================
 */
export function HeroGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeDest, setActiveDest] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GlobeNode | null>(null);

  // Synchronous refs to prevent re-initializing Three.js on hover/selection
  const routerRef = useRef(router);
  routerRef.current = router;

  const activeDestRef = useRef(activeDest);
  activeDestRef.current = activeDest;

  const hoveredNodeRef = useRef(hoveredNode);
  hoveredNodeRef.current = hoveredNode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 520;

    // --- 1. Scene, Camera, Renderer (Elevated Floating Horizon Perspective) ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1500);
    camera.position.set(0, 14, 228);
    camera.lookAt(0, -12, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent background
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    const GLOBE_RADIUS = 112;
    const GLOBE_CENTER_Y = -60;

    // --- 2. Master Globe Group (Rotated so Bangladesh, India & Asia face camera) ---
    const globeGroup = new THREE.Group();
    // 180 degrees (Math.PI) brings 90° E (Dhaka/South Asia) directly to the front
    globeGroup.rotation.y = Math.PI;
    globeGroup.rotation.x = -0.22; // Axis tilted so Bangladesh/Dhaka hub sits prominent and higher up ("upside") on the dome
    globeGroup.position.set(0, GLOBE_CENTER_Y, 0);
    scene.add(globeGroup);

    // --- 3. High-Definition Photorealistic Satellite Earth ---
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];

    const loadTexture = (
      url: string,
      onLoad?: (t: THREE.Texture) => void,
    ): THREE.Texture => {
      const tex = textureLoader.load(url, (t) => {
        if (onLoad) onLoad(t);
      });
      loadedTextures.push(tex);
      return tex;
    };

    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0a1c30), // Rich deep oceanic base
      roughness: 0.48,
      metalness: 0.02,
      clearcoat: 0.6,
      clearcoatRoughness: 0.16,
      bumpScale: 1.1,
      emissive: new THREE.Color(0xffcf70),
      emissiveIntensity: 1.35,
    });

    // A. NASA Blue Marble True Satellite Map (Sharp, Full Resolution with 16x Anisotropy)
    loadTexture("/textures/earth/earth_blue_marble.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
      earthMaterial.map = tex;
      earthMaterial.color.set(0xffffff); // Full satellite color transmission once texture is ready
      earthMaterial.needsUpdate = true;
    });

    // B. Elevation & Mountain Relief Bump Map
    loadTexture("/textures/earth/earth_topology.png", (tex) => {
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      earthMaterial.bumpMap = tex;
      earthMaterial.bumpScale = 1.1;
      earthMaterial.needsUpdate = true;
    });

    // C. Specular Ocean vs Matte Continents Map
    loadTexture("/textures/earth/earth_specular.jpg", (tex) => {
      tex.generateMipmaps = true;
      earthMaterial.roughnessMap = tex;
      earthMaterial.needsUpdate = true;
    });

    // D. Night City Lights Emissive Glow (Vibrant Sparkling Amber Cities)
    loadTexture("/textures/earth/earth_lights.png", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      earthMaterial.emissive = new THREE.Color(0xffcf70);
      earthMaterial.emissiveMap = tex;
      earthMaterial.emissiveIntensity = 1.35;
      earthMaterial.needsUpdate = true;
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // --- 4. Floating Atmospheric Cloud Layer (Clearly Visible Luminous Cloud Formations) ---
    const cloudsGeometry = new THREE.SphereGeometry(
      GLOBE_RADIUS * 1.014,
      64,
      64,
    );
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    loadTexture("/textures/earth/earth_clouds.png", (tex) => {
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      cloudsMaterial.map = tex;
      cloudsMaterial.opacity = 0.35; // Luminous, clearly visible clouds drifting across continents
      cloudsMaterial.needsUpdate = true;
    });

    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);

    // --- 5. Outer Rayleigh Atmospheric Horizon Glow (Close exosphere hugging limb) ---
    const atmosphereGeometry = new THREE.SphereGeometry(
      GLOBE_RADIUS * 1.028,
      64,
      64,
    );
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(
      atmosphereGeometry,
      atmosphereMaterial,
    );
    atmosphereMesh.position.set(0, GLOBE_CENTER_Y, 0);
    scene.add(atmosphereMesh);

    // --- 6. Solar, Ambient & Balanced Studio Daylight Lighting ---
    // Primary Daylight Sun: illuminates South Asia, Middle East & Europe
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    sunLight.position.set(-105, 90, 160);
    scene.add(sunLight);

    // Secondary Daylight Sun: illuminates East Asia, China, Malaysia, Korea & Pacific
    const eastSunLight = new THREE.DirectionalLight(0xe8f2ff, 1.8);
    eastSunLight.position.set(105, 75, 140);
    scene.add(eastSunLight);

    // Luminous Ambient Fill: Deepens ocean blues and lets city lights and topography shine
    const ambientLight = new THREE.AmbientLight(0x4a6582, 0.9);
    scene.add(ambientLight);

    // Warm Sunset Rim Light (accents the golden horizon)
    const sunsetRimLight = new THREE.DirectionalLight(0xff9944, 1.3);
    sunsetRimLight.position.set(-140, 35, -25);
    scene.add(sunsetRimLight);

    // Soft Atmospheric Sky Rim Light
    const skyRimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    skyRimLight.position.set(130, 25, -30);
    scene.add(skyRimLight);

    // --- 7. Orbital Micro-Particle Field (Warm Amber & Atmospheric Cyan) ---
    const dustCount = 350;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const r = GLOBE_RADIUS * (1.03 + Math.random() * 0.75);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      dustPositions[i * 3 + 2] = r * Math.cos(phi);

      const isWarm = Math.random() > 0.45;
      dustColors[i * 3] = isWarm ? 1.0 : 0.22;
      dustColors[i * 3 + 1] = isWarm ? 0.72 : 0.74;
      dustColors[i * 3 + 2] = isWarm ? 0.24 : 0.98;
    }

    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3),
    );
    dustGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(dustColors, 3),
    );

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    dustParticles.position.set(0, GLOBE_CENTER_Y, 0);
    scene.add(dustParticles);

    // --- 8. Unique 3D Sci-Fi Holographic Beacons & Country Badges ---
    interface BeaconObject {
      node: GlobeNode;
      normal: THREE.Vector3;
      basePos: THREE.Vector3;
      tipPos: THREE.Vector3;
      beamHeight: number;
      diamond: THREE.Mesh;
      innerCore: THREE.Mesh;
      gimbalRing: THREE.Mesh;
      badgeSprite: THREE.Sprite;
      baseScale: THREE.Vector3;
      hitTarget: THREE.Mesh;
      rippleRings: {
        mesh: THREE.Mesh;
        phase: number;
        maxScale: number;
        speed: number;
      }[];
    }

    const beaconObjects: BeaconObject[] = [];
    const nodeHitTargets: {
      mesh: THREE.Mesh;
      node: GlobeNode;
      beacon: BeaconObject;
    }[] = [];
    const beaconDisposables: (
      THREE.BufferGeometry | THREE.Material | THREE.Texture
    )[] = [];

    ALL_NODES.forEach((node) => {
      const normal = latLngToVector3(node.lat, node.lng, 1.0).normalize();
      const basePos = normal.clone().multiplyScalar(GLOBE_RADIUS * 1.002);
      const beamHeight = node.isOrigin ? 7.2 : 5.6;
      const beamCenter = basePos
        .clone()
        .addScaledVector(normal, beamHeight / 2);
      const tipPos = basePos.clone().addScaledVector(normal, beamHeight);

      // A. Ground Reticle Anchor Disc
      const groundDiscGeo = new THREE.RingGeometry(
        0.12,
        node.isOrigin ? 1.6 : 1.2,
        32,
      );
      const groundDiscMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const groundDisc = new THREE.Mesh(groundDiscGeo, groundDiscMat);
      groundDisc.position.copy(basePos.clone().addScaledVector(normal, 0.04));
      groundDisc.lookAt(basePos.clone().addScaledVector(normal, 10));
      globeGroup.add(groundDisc);
      beaconDisposables.push(groundDiscGeo, groundDiscMat);

      // B. Ground Dual Staggered Radar Sonar Ripples
      const rippleRings: {
        mesh: THREE.Mesh;
        phase: number;
        maxScale: number;
        speed: number;
      }[] = [];
      const rippleGeo = new THREE.RingGeometry(
        node.isOrigin ? 0.9 : 0.7,
        node.isOrigin ? 1.2 : 0.95,
        32,
      );
      beaconDisposables.push(rippleGeo);

      [0.0, 0.5].forEach((initialPhase) => {
        const rippleMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
        rippleMesh.position.copy(basePos.clone().addScaledVector(normal, 0.05));
        rippleMesh.lookAt(basePos.clone().addScaledVector(normal, 10));
        globeGroup.add(rippleMesh);
        beaconDisposables.push(rippleMat);

        rippleRings.push({
          mesh: rippleMesh,
          phase: initialPhase,
          maxScale: node.isOrigin ? 3.4 : 2.8,
          speed: node.isOrigin ? 0.0036 : 0.0028,
        });
      });

      // C. Tapered Holographic Light Pillar (Shooting up from surface)
      const beamGeo = new THREE.CylinderGeometry(
        0.22,
        0.95,
        beamHeight,
        16,
        4,
        true,
      );
      const beamPosAttr = beamGeo.getAttribute("position");
      const beamColors = new Float32Array(beamPosAttr.count * 3);
      const baseC = new THREE.Color(node.color);
      const tipC = new THREE.Color(0xffffff);

      for (let i = 0; i < beamPosAttr.count; i++) {
        const y = beamPosAttr.getY(i);
        const t = (y + beamHeight / 2) / beamHeight;
        const c = baseC.clone().lerp(tipC, t * 0.7);
        beamColors[i * 3] = c.r;
        beamColors[i * 3 + 1] = c.g;
        beamColors[i * 3 + 2] = c.b;
      }
      beamGeo.setAttribute("color", new THREE.BufferAttribute(beamColors, 3));

      const beamMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: node.isOrigin ? 0.65 : 0.48,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.copy(beamCenter);
      beamMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal,
      );
      globeGroup.add(beamMesh);
      beaconDisposables.push(beamGeo, beamMat);

      // D. Floating Luminous Diamond Crystal
      const diamondRadius = node.isOrigin ? 1.18 : 0.92;
      const diamondGeo = new THREE.OctahedronGeometry(diamondRadius, 0);
      const diamondMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 1.4,
        roughness: 0.15,
        metalness: 0.25,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.95,
      });
      const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
      diamondMesh.position.copy(tipPos);
      globeGroup.add(diamondMesh);
      beaconDisposables.push(diamondGeo, diamondMat);

      // E. Radiant White Energy Core
      const coreGeo = new THREE.SphereGeometry(
        node.isOrigin ? 0.42 : 0.32,
        16,
        16,
      );
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(tipPos);
      globeGroup.add(coreMesh);
      beaconDisposables.push(coreGeo, coreMat);

      // F. Orbiting Gyro Gimbal Ring
      const ringRadius = node.isOrigin ? 1.8 : 1.45;
      const ringTube = 0.045;
      const gimbalGeo = new THREE.TorusGeometry(ringRadius, ringTube, 8, 32);
      const gimbalMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const gimbalMesh = new THREE.Mesh(gimbalGeo, gimbalMat);
      gimbalMesh.position.copy(tipPos);
      globeGroup.add(gimbalMesh);
      beaconDisposables.push(gimbalGeo, gimbalMat);

      // G. Crisp Country Insignia Sprite Billboard
      const badgeTex = createCountryBadgeTexture(
        node.tag,
        node.color,
        node.isOrigin,
      );
      loadedTextures.push(badgeTex);
      beaconDisposables.push(badgeTex);

      const badgeMat = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        depthTest: false,
      });
      const badgeSprite = new THREE.Sprite(badgeMat);
      badgeSprite.position.copy(tipPos.clone().addScaledVector(normal, 2.2));
      const baseScale = node.isOrigin
        ? new THREE.Vector3(10.6, 3.45, 1)
        : new THREE.Vector3(8.0, 3.0, 1);
      badgeSprite.scale.copy(baseScale);
      globeGroup.add(badgeSprite);
      beaconDisposables.push(badgeMat);

      // H. Responsive Interactive Hit Target Sphere
      const hitGeo = new THREE.SphereGeometry(3.2, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(tipPos);
      globeGroup.add(hitMesh);
      beaconDisposables.push(hitGeo, hitMat);

      const beaconObj: BeaconObject = {
        node,
        normal,
        basePos,
        tipPos,
        beamHeight,
        diamond: diamondMesh,
        innerCore: coreMesh,
        gimbalRing: gimbalMesh,
        badgeSprite,
        baseScale,
        hitTarget: hitMesh,
        rippleRings,
      };

      beaconObjects.push(beaconObj);
      nodeHitTargets.push({ mesh: hitMesh, node, beacon: beaconObj });
    });

    // --- 9. Glowing 3D Curved Arcs Linking Elevated Beacons ---
    interface ArcObject {
      curve: THREE.QuadraticBezierCurve3;
      tubeMesh: THREE.Mesh;
      packetMesh: THREE.Group | THREE.Mesh;
      packetTrail: THREE.Points;
      trailPositions: Float32Array;
      trailLength: number;
      progress: number;
      speed: number;
    }

    const arcObjects: ArcObject[] = [];

    ARCS_DATA.forEach((arc) => {
      const originBeacon = beaconObjects.find((b) => b.node.isOrigin);
      const destBeacon = beaconObjects.find(
        (b) => b.node.name === arc.destName,
      );

      const startVec = originBeacon
        ? originBeacon.tipPos.clone()
        : latLngToVector3(arc.startLat, arc.startLng, GLOBE_RADIUS + 7.2);
      const endVec = destBeacon
        ? destBeacon.tipPos.clone()
        : latLngToVector3(arc.endLat, arc.endLng, GLOBE_RADIUS + 5.6);

      // Elevated midpoint for smooth parabolic curve between floating diamonds
      const midVec = new THREE.Vector3()
        .addVectors(startVec, endVec)
        .multiplyScalar(0.5);
      const distance = startVec.distanceTo(endVec);
      const altitude =
        GLOBE_RADIUS * (1.1 + arc.altitude * (distance / GLOBE_RADIUS));
      midVec.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);

      // A. Static Fiber-Optic Arc Tube
      const curvePoints = curve.getPoints(50);
      const tubeGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(curvePoints),
        44,
        0.16,
        8,
        false,
      );

      const posAttr = tubeGeo.getAttribute("position");
      const count = posAttr ? posAttr.count : 0;
      const colors = new Float32Array(count * 3);
      const startC = new THREE.Color(arc.startColor);
      const endC = new THREE.Color(arc.endColor);

      for (let i = 0; i < count; i++) {
        const t = i / count;
        const c = startC.clone().lerp(endC, t);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      tubeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const tubeMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      globeGroup.add(tubeMesh);
      beaconDisposables.push(tubeGeo, tubeMat);

      // B. Animated Supersonic Student Flight Jetliner
      const gliderGroup = new THREE.Group();
      gliderGroup.scale.set(0.8, 0.8, 0.8);

      // 1. Fuselage Body (Gleaming white passenger airliner cabin)
      const fuselageGeo = new THREE.CylinderGeometry(0.85, 0.85, 3.8, 8);
      fuselageGeo.rotateX(Math.PI / 2); // Orient along +Z
      const fuselageMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
      });
      const fuselageMesh = new THREE.Mesh(fuselageGeo, fuselageMat);
      gliderGroup.add(fuselageMesh);

      // Aerodynamic Nose Cone
      const noseGeo = new THREE.ConeGeometry(0.85, 2.2, 8);
      noseGeo.rotateX(Math.PI / 2);
      noseGeo.translate(0, 0, 2.9);
      const noseMesh = new THREE.Mesh(noseGeo, fuselageMat);
      gliderGroup.add(noseMesh);

      // 2. Swept Passenger Wings & Tail Fin (Wingspan: 7.2 units!)
      const wingGeo = new THREE.BufferGeometry();
      const wingVertices = new Float32Array([
        // Left Wing
        0, 0, 1.2, -3.6, 0, -1.8, 0, 0, -1.0,
        // Right Wing
        0, 0, 1.2, 0, 0, -1.0, 3.6, 0, -1.8,
        // Vertical Tail Fin
        0, 0, -1.0, 0, 2.0, -2.4, 0, 0, -2.2,
      ]);
      wingGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(wingVertices, 3),
      );
      const wingMat = new THREE.MeshBasicMaterial({
        color: endC,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      gliderGroup.add(wingMesh);

      // 3. Twin Jet Engine Thrusters under wings
      const engineGeo = new THREE.CylinderGeometry(0.42, 0.52, 1.8, 8);
      engineGeo.rotateX(Math.PI / 2);
      const engineMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x00f2fe),
      });
      const leftEngine = new THREE.Mesh(engineGeo, engineMat);
      leftEngine.position.set(-1.4, -0.45, -0.2);
      gliderGroup.add(leftEngine);

      const rightEngine = new THREE.Mesh(engineGeo, engineMat);
      rightEngine.position.set(1.4, -0.45, -0.2);
      gliderGroup.add(rightEngine);

      // 4. Luminous Nose Headlight & Cockpit Beacon
      const glowGeo = new THREE.SphereGeometry(0.75, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(0, 0, 3.8);
      gliderGroup.add(glowMesh);

      globeGroup.add(gliderGroup);
      beaconDisposables.push(
        fuselageGeo,
        fuselageMat,
        noseGeo,
        wingGeo,
        wingMat,
        engineGeo,
        engineMat,
        glowGeo,
        glowMat,
      );

      // C. Animated Trailing Particle Comet Tail
      const trailLength = arc.trailLength;
      const trailPositions = new Float32Array(trailLength * 3);
      const trailColors = new Float32Array(trailLength * 3);

      for (let i = 0; i < trailLength; i++) {
        const ratio = i / trailLength;
        const color = startC.clone().lerp(endC, ratio);
        trailColors[i * 3] = color.r;
        trailColors[i * 3 + 1] = color.g;
        trailColors[i * 3 + 2] = color.b;
      }

      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(trailPositions, 3),
      );
      trailGeo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));

      const trailMat = new THREE.PointsMaterial({
        size: 2.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const packetTrail = new THREE.Points(trailGeo, trailMat);
      globeGroup.add(packetTrail);
      beaconDisposables.push(trailGeo, trailMat);

      arcObjects.push({
        curve,
        tubeMesh,
        packetMesh: gliderGroup,
        packetTrail,
        trailPositions,
        trailLength,
        progress: Math.random(),
        speed: arc.speed,
      });
    });

    // --- 10. Mouse & Touch Interaction & Controls ---
    const DEFAULT_ROT_X = -0.22;
    let dragRotY = 0;
    let dragRotX = DEFAULT_ROT_X;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    let idleTimeoutId: NodeJS.Timeout | null = null;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        dragRotY += deltaX * 0.0035;
        dragRotX = Math.max(-0.44, Math.min(0.04, dragRotX + deltaY * 0.003));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Raycast for hover detection on nodes
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        nodeHitTargets.map((n) => n.mesh),
      );

      if (intersects.length > 0 && intersects[0]) {
        const hit = nodeHitTargets.find(
          (n) => n.mesh === intersects[0]?.object,
        );
        if (hit) {
          if (hoveredNodeRef.current?.id !== hit.node.id) {
            hoveredNodeRef.current = hit.node;
            setHoveredNode(hit.node);
          }
          container.style.cursor = "pointer";
          return;
        }
      }

      if (hoveredNodeRef.current !== null) {
        hoveredNodeRef.current = null;
        setHoveredNode(null);
      }
      container.style.cursor = isDragging ? "grabbing" : "grab";
    };

    const onMouseUp = () => {
      isDragging = false;
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      // Smoothly re-center towards Bangladesh after 3.2s of idle
      idleTimeoutId = setTimeout(() => {
        if (!isDragging) autoRotate = true;
      }, 3200);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0 && e.touches[0]) {
        isDragging = true;
        autoRotate = false;
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0 && e.touches[0]) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        dragRotY += deltaX * 0.0035;
        dragRotX = Math.max(-0.44, Math.min(0.04, dragRotX + deltaY * 0.003));

        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        if (!isDragging) autoRotate = true;
      }, 3200);
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        nodeHitTargets.map((n) => n.mesh),
      );

      if (intersects.length > 0 && intersects[0]) {
        const hit = nodeHitTargets.find(
          (n) => n.mesh === intersects[0]?.object,
        );
        if (hit && hit.node.url) {
          routerRef.current.push(hit.node.url);
        }
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("click", onClick);

    // --- 11. Animation Loop ---
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // A. Ambient slow sway centered on Bangladesh (Math.PI)
      // Keeps Dhaka Hub prominently centered and "upside" while providing dynamic 3D presence
      const time = performance.now() * 0.001;
      if (autoRotate) {
        if (Math.abs(dragRotY) > 0.001) {
          dragRotY = THREE.MathUtils.lerp(dragRotY, 0, 0.035);
        }
        if (Math.abs(dragRotX - DEFAULT_ROT_X) > 0.001) {
          dragRotX = THREE.MathUtils.lerp(dragRotX, DEFAULT_ROT_X, 0.035);
        }
        const ambientSway = Math.sin(time * 0.3) * 0.1;
        globeGroup.rotation.y = Math.PI + dragRotY + ambientSway;
        globeGroup.rotation.x = dragRotX + Math.cos(time * 0.25) * 0.01;
      } else {
        globeGroup.rotation.y = Math.PI + dragRotY;
        globeGroup.rotation.x = dragRotX;
      }

      // B. Slow atmospheric cloud drift relative to Earth surface
      cloudsMesh.rotation.y += 0.00032;

      // C. Rotate cosmic dust particle field slowly
      dustParticles.rotation.y -= 0.0004;
      dustParticles.rotation.x += 0.00015;

      // D. Animate 3D Holographic Beacons: Serene Drift, Slow Spin & Relaxed Sonar Waves
      beaconObjects.forEach((b, idx) => {
        // Slow, gentle vertical levitation
        const bob = Math.sin(time * 1.2 + idx * 0.9) * 0.22;
        const currentTip = b.tipPos.clone().addScaledVector(b.normal, bob);

        b.diamond.position.copy(currentTip);
        b.innerCore.position.copy(currentTip);
        b.gimbalRing.position.copy(currentTip);
        b.hitTarget.position.copy(currentTip);
        b.badgeSprite.position.copy(currentTip).addScaledVector(b.normal, 2.5);

        // Smooth, relaxed rotation without rapid glinting
        b.diamond.rotation.y += 0.006;
        b.gimbalRing.rotation.x += 0.007;
        b.gimbalRing.rotation.y += 0.005;

        // Hover scale and glow reaction
        const isHovered =
          hoveredNodeRef.current?.id === b.node.id ||
          activeDestRef.current === b.node.id;
        const targetScaleMult = isHovered ? 1.28 : 1.0;
        b.badgeSprite.scale.lerp(
          b.baseScale.clone().multiplyScalar(targetScaleMult),
          0.12,
        );
        const dMat = b.diamond.material as THREE.MeshPhysicalMaterial;
        dMat.emissiveIntensity = THREE.MathUtils.lerp(
          dMat.emissiveIntensity,
          isHovered ? 2.5 : 1.4,
          0.15,
        );

        // Animate slow, graceful radar sonar ripples with smooth sinusoidal falloff
        b.rippleRings.forEach((r) => {
          r.phase = (r.phase + r.speed) % 1.0;
          const s = 1.0 + r.phase * (r.maxScale - 1.0);
          r.mesh.scale.set(s, s, s);
          const rMat = r.mesh.material as THREE.MeshBasicMaterial;
          const fade = Math.sin((1.0 - r.phase) * Math.PI * 0.5);
          rMat.opacity = Math.max(0, fade * (b.node.isOrigin ? 0.65 : 0.5));
        });
      });

      // E. Animate supersonic student flight gliders traveling across arcs from Dhaka
      arcObjects.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1.0;
        const currentPos = arc.curve.getPoint(arc.progress);
        const tangent = arc.curve.getTangent(arc.progress);

        arc.packetMesh.position.copy(currentPos);
        arc.packetMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          tangent,
        );

        // Update trailing comet tail
        const positions = arc.trailPositions;
        for (let i = 0; i < arc.trailLength; i++) {
          const trailT = Math.max(0, arc.progress - i * 0.011);
          const p = arc.curve.getPoint(trailT);
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        }
        const trailPosAttr = arc.packetTrail.geometry.getAttribute("position");
        if (trailPosAttr) {
          trailPosAttr.needsUpdate = true;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- 12. Handle Window Resize ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1000;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // --- 13. Comprehensive Cleanup on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("click", onClick);

      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();

      loadedTextures.forEach((tex) => tex.dispose());
      beaconDisposables.forEach((d) => d.dispose());
    };
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center justify-center select-none">
      {/* Soft Ambient Horizon Aura (Purely floating, no borders or bounding boxes) */}
      <div
        className="pointer-events-none absolute top-[44%] left-1/2 -z-10 h-[240px] w-[72%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255, 140, 40, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Three.js WebGL Canvas Container: Purely floating underneath texts and hero */}
      <div
        ref={containerRef}
        className="relative flex h-[360px] w-full cursor-grab items-center justify-center [mask-image:linear-gradient(to_bottom,black_78%,transparent_100%)] active:cursor-grabbing sm:h-[420px] md:h-[470px] lg:h-[500px]"
      />

      {/* Active Node Floating Academic Intel Card (Unified Light Frosted Glass) */}
      {hoveredNode && (
        <div className="animate-fade-in pointer-events-none absolute top-4 left-1/2 z-30 w-[92%] max-w-[360px] -translate-x-1/2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 text-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
            {/* Header: Indicator, Destination Name, Intake tag */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shadow-sm"
                  style={{
                    backgroundColor: hoveredNode.color,
                    boxShadow: `0 0 10px ${hoveredNode.color}`,
                  }}
                />
                <span className="font-display text-xs font-black tracking-wide text-slate-900 uppercase">
                  {hoveredNode.name}
                </span>
              </div>
              {hoveredNode.intake && (
                <span className="rounded-full border border-orange-200/90 bg-orange-50 px-2 py-0.5 font-mono text-[0.65rem] font-bold text-orange-700">
                  {hoveredNode.intake}
                </span>
              )}
            </div>

            {/* Scholarship Callout */}
            {hoveredNode.scholarship && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-2">
                <span className="mt-0.5 text-xs text-amber-600">🎓</span>
                <div>
                  <span className="font-display block text-[0.66rem] font-bold tracking-wider text-amber-800 uppercase">
                    Scholarship Coverage
                  </span>
                  <span className="text-[0.7rem] leading-tight font-medium text-slate-700">
                    {hoveredNode.scholarship}
                  </span>
                </div>
              </div>
            )}

            {/* Top In-Demand Programs */}
            {hoveredNode.topPrograms && (
              <div className="mt-2">
                <span className="font-mono text-[0.62rem] font-semibold tracking-wider text-slate-500 uppercase">
                  Featured Programs:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {hoveredNode.topPrograms.map((prog, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[0.64rem] font-medium text-slate-700"
                    >
                      {prog}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Footer */}
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[0.66rem]">
              <span className="flex items-center gap-1 font-mono font-semibold text-emerald-700">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" />
                {hoveredNode.visaRate || "98.5% Visa Rate"}
              </span>
              {hoveredNode.url && (
                <span className="font-mono font-bold text-orange-600">
                  Explore Programs →
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Destination Legend Bar positioned cleanly across the bottom */}
      <div
        className="pointer-events-auto relative z-20 -mt-6 flex w-full flex-wrap justify-center gap-2 px-2 pb-2 sm:-mt-8"
        role="navigation"
        aria-label="Connected destinations"
      >
        {DESTINATION_NODES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              if (d.url) router.push(d.url);
            }}
            onMouseEnter={() => setActiveDest(d.id)}
            onMouseLeave={() => setActiveDest(null)}
            className={`group inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 ${
              activeDest === d.id
                ? "scale-105 border-orange-400 bg-orange-50/90 text-orange-950 shadow-md ring-2 ring-orange-400/30"
                : "border-slate-200/85 bg-white/90 text-slate-700 shadow-2xs hover:border-orange-300 hover:bg-orange-50/60 hover:text-orange-950 hover:shadow-xs"
            }`}
          >
            <span
              className="size-2 rounded-full shadow-sm"
              style={{
                backgroundColor: d.color,
                boxShadow: `0 0 8px ${d.color}66`,
              }}
            />
            <span className="font-display tracking-wide">
              🎓 {d.country}
            </span>
            <span className="font-mono text-[0.68rem] text-slate-400 transition-colors group-hover:text-orange-600">
              {d.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
