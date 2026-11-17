"use client";

import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import styles from "./hero-globe.module.css";

type GlobeDestination = {
  id: string;
  country: string;
  countryBn: string;
  city: string;
  cityBn: string;
  code: string;
  lat: number;
  lng: number;
  offset: [number, number];
  description: string;
  descriptionBn: string;
};

// Only destinations with an existing destination page appear on the globe.
const DESTINATIONS: GlobeDestination[] = [
  {
    id: "china",
    country: "China",
    countryBn: "চীন",
    city: "Beijing",
    cityBn: "বেইজিং",
    code: "CN",
    lat: 39.9042,
    lng: 116.4074,
    offset: [-42, -48],
    description:
      "Discover opportunities in medicine, engineering and technology.",
    descriptionBn:
      "মেডিসিন, ইঞ্জিনিয়ারিং ও প্রযুক্তিতে উচ্চশিক্ষার সুযোগ খুঁজুন।",
  },
  {
    id: "malaysia",
    country: "Malaysia",
    countryBn: "মালয়েশিয়া",
    city: "Kuala Lumpur",
    cityBn: "কুয়ালালামপুর",
    code: "MY",
    lat: 3.139,
    lng: 101.6869,
    offset: [65, 30],
    description: "Explore a global education in the heart of Southeast Asia.",
    descriptionBn:
      "দক্ষিণ-পূর্ব এশিয়ার প্রাণকেন্দ্রে আন্তর্জাতিক শিক্ষার সুযোগ জানুন।",
  },
  {
    id: "south-korea",
    country: "South Korea",
    countryBn: "দক্ষিণ কোরিয়া",
    city: "Seoul",
    cityBn: "সিউল",
    code: "KR",
    lat: 37.5665,
    lng: 126.978,
    offset: [75, -14],
    description: "Find your path in innovation, research and Korean culture.",
    descriptionBn: "উদ্ভাবন, গবেষণা ও কোরিয়ান সংস্কৃতিতে আপনার পথ খুঁজে নিন।",
  },
  {
    id: "india",
    country: "India",
    countryBn: "ভারত",
    city: "New Delhi",
    cityBn: "নয়াদিল্লি",
    code: "IN",
    lat: 28.6139,
    lng: 77.209,
    offset: [-70, -12],
    description: "A world of academic possibilities, closer to home.",
    descriptionBn: "ঘরের কাছেই উচ্চশিক্ষার বিস্তৃত সম্ভাবনা খুঁজে নিন।",
  },
];
const ORIGIN = {
  id: "dhaka",
  lat: 23.8103,
  lng: 90.4125,
  offset: [-18, 49] as [number, number],
};
const NODES = [ORIGIN, ...DESTINATIONS];
const RADIUS = 3;

type CountryFeature = {
  properties: { id: string; name: string };
  geometry:
    | { type: "Polygon"; coordinates: [number, number][][] }
    | { type: "MultiPolygon"; coordinates: [number, number][][][] };
};

function coordinates(lat: number, lng: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

const globeVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const earthFragmentShader = `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D oceanMap;
  uniform sampler2D countryMap;
  uniform sampler2D heightMap;
  uniform sampler2D cloudMap;
  uniform float cloudOffset;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    // Surface relief follows the geographic height map, including at the poles.
    float elevation = texture2D(heightMap, vUv).r;
    vec3 surfaceGradient = cross(dFdy(vWorldPosition), normal) * dFdx(elevation)
      + cross(normal, dFdx(vWorldPosition)) * dFdy(elevation);
    normal = normalize(normal - surfaceGradient * 0.22);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float sunlight = dot(normal, sunDirection);
    float day = smoothstep(-0.18, 0.58, sunlight);
    vec3 surface = texture2D(dayMap, vUv).rgb;
    vec3 cities = texture2D(nightMap, vUv).rgb;
    vec3 color = surface * mix(0.075, 1.18, day);
    float cloudShadow = texture2D(cloudMap, vec2(fract(vUv.x + cloudOffset + 0.0015), vUv.y - 0.001)).r;
    color *= 1.0 - cloudShadow * day * 0.18;
    color += cities * vec3(1.0, 0.72, 0.38) * (1.0 - smoothstep(-0.1, 0.38, sunlight)) * 1.6;
    vec2 countries = texture2D(countryMap, vUv).rg;
    color = mix(color, vec3(0.22, 0.65, 0.77), countries.r * 0.11);
    color = mix(color, vec3(1.0, 0.48, 0.16), countries.g * 0.24);
    vec3 halfDirection = normalize(sunDirection + viewDirection);
    float specular = pow(max(dot(normal, halfDirection), 0.0), 65.0);
    color += vec3(0.8, 0.89, 1.0) * specular * texture2D(oceanMap, vUv).r * 0.32;
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
    color += vec3(0.04, 0.24, 0.46) * fresnel * day * 0.5;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 sunDirection;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.8);
    float warmth = pow(max(dot(normal, sunDirection), 0.0), 2.0);
    vec3 color = mix(vec3(0.22, 0.57, 1.0), vec3(1.0, 0.72, 0.4), warmth * 0.7);
    gl_FragColor = vec4(color, rim * 0.62);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function HeroGlobe({ locale = "en" }: { locale?: Locale }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef(
    new Map<string, HTMLButtonElement | HTMLDivElement>(),
  );
  const leaderRefs = useRef(new Map<string, SVGPathElement>());
  const [selected, setSelected] = useState("malaysia");
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const selectedRef = useRef(selected);
  const pausedRef = useRef(paused);
  const resetRef = useRef<(() => void) | null>(null);
  const zoomRef = useRef<((factor: number) => void) | null>(null);
  const focusRef = useRef<((id: string) => void) | null>(null);
  const bn = locale === "bn";
  const tagline = bn ? "সম্ভাবনার এক পৃথিবী" : "A world of possibilities";
  const destination =
    DESTINATIONS.find((item) => item.id === selected) ?? DESTINATIONS[1]!;
  const selectDestination = (id: string) => {
    setSelected(id);
    focusRef.current?.(id);
  };

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const stage = stageRef.current;
    const container = canvasRef.current;
    if (!stage || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setStatus("fallback");
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    const globe = new THREE.Group();
    globe.position.y = -1.6;
    globe.rotation.set(-0.2, Math.PI, 0);
    scene.add(globe);
    const sunDirection = new THREE.Vector3(-1.1, 0.8, 1.2).normalize();
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    let disposed = false;
    let textureFailed = false;
    const loader = new THREE.TextureLoader();
    const texture = (path: string, color = false) => {
      const map = loader.load(
        path,
        (loaded) => {
          if (disposed) {
            loaded.dispose();
            return;
          }
          if (path.includes("blue_marble") && !textureFailed)
            setStatus("ready");
        },
        undefined,
        () => {
          if (!disposed && path.includes("blue_marble")) {
            textureFailed = true;
            setStatus("fallback");
          }
        },
      );
      if (color) map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      textures.push(map);
      return map;
    };
    const sphere = new THREE.SphereGeometry(RADIUS, 80, 64);
    geometries.push(sphere);
    const countryCanvas = document.createElement("canvas");
    countryCanvas.width = 4096;
    countryCanvas.height = 2048;
    const countryContext = countryCanvas.getContext("2d");
    const countryMap = new THREE.CanvasTexture(countryCanvas);
    textures.push(countryMap);
    const cloudMap = texture("/textures/earth/earth_clouds.jpg");
    cloudMap.wrapS = THREE.RepeatWrapping;
    const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: globeVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        dayMap: {
          value: texture("/textures/earth/earth_blue_marble.jpg", true),
        },
        nightMap: { value: texture("/textures/earth/earth_lights.png", true) },
        oceanMap: { value: texture("/textures/earth/earth_specular.jpg") },
        heightMap: { value: texture("/textures/earth/earth_topology.png") },
        cloudMap: { value: cloudMap },
        cloudOffset: { value: 0 },
        countryMap: { value: countryMap },
        sunDirection: { value: sunDirection },
      },
    });
    materials.push(earthMaterial);
    globe.add(new THREE.Mesh(sphere, earthMaterial));

    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xeaf4ff,
      alphaMap: cloudMap,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(sphere, cloudMaterial);
    clouds.scale.setScalar(1.012);
    globe.add(clouds);
    materials.push(cloudMaterial);
    const sunlight = new THREE.DirectionalLight(0xfff4e6, 2.1);
    sunlight.position.copy(sunDirection).multiplyScalar(10);
    scene.add(sunlight, new THREE.AmbientLight(0x7b9dbd, 0.65));
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: globeVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: { sunDirection: { value: sunDirection } },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const atmosphere = new THREE.Mesh(sphere, atmosphereMaterial);
    atmosphere.scale.setScalar(1.022);
    globe.add(atmosphere);
    materials.push(atmosphereMaterial);

    // Real country polygons stay registered to the satellite texture as Earth turns.
    let countries: CountryFeature[] = [];
    let countrySelection = "";
    const countryBorders: { id: string; material: LineMaterial }[] = [];
    const updateCountries = () => {
      if (countrySelection === selectedRef.current || !countries.length) return;
      countrySelection = selectedRef.current;
      if (countryContext) {
        countryContext.fillStyle = "black";
        countryContext.fillRect(
          0,
          0,
          countryCanvas.width,
          countryCanvas.height,
        );
        countries.forEach((feature) => {
          countryContext.fillStyle =
            feature.properties.id === countrySelection ? "#ffff00" : "#ff0000";
          const polygons =
            feature.geometry.type === "Polygon"
              ? [feature.geometry.coordinates]
              : feature.geometry.coordinates;
          polygons.forEach((polygon) => {
            countryContext.beginPath();
            polygon.forEach((ring) => {
              ring.forEach(([lng, lat], index) => {
                const x = ((lng + 180) / 360) * countryCanvas.width;
                const y = ((90 - lat) / 180) * countryCanvas.height;
                if (index === 0) countryContext.moveTo(x, y);
                else countryContext.lineTo(x, y);
              });
              countryContext.closePath();
            });
            countryContext.fill("evenodd");
          });
        });
        countryMap.needsUpdate = true;
      }
      countryBorders.forEach(({ id, material }) => {
        const active = id === countrySelection;
        material.color.set(active ? 0xffb36b : 0x83d5ed);
        material.linewidth = active ? 2.5 : 1.7;
        material.opacity = active ? 1 : 0.9;
      });
    };
    const countryRequest = new AbortController();
    void fetch("/data/globe-destinations.geojson", {
      signal: countryRequest.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Country boundaries unavailable");
        return response.json() as Promise<{ features: CountryFeature[] }>;
      })
      .then((data) => {
        if (disposed) return;
        countries = data.features;
        countries.forEach((feature) => {
          const points: THREE.Vector3[] = [];
          const polygons =
            feature.geometry.type === "Polygon"
              ? [feature.geometry.coordinates]
              : feature.geometry.coordinates;
          polygons.forEach((polygon) => {
            polygon.forEach((ring) => {
              for (let i = 1; i < ring.length; i++) {
                const [lng, lat] = ring[i - 1]!;
                const [nextLng, nextLat] = ring[i]!;
                // Subdivide long borders so line segments never cut into the sphere.
                const steps = Math.ceil(
                  Math.max(Math.abs(nextLng - lng), Math.abs(nextLat - lat)) /
                    0.5,
                );
                for (let step = 0; step < steps; step++) {
                  for (const t of [step / steps, (step + 1) / steps]) {
                    points.push(
                      coordinates(
                        THREE.MathUtils.lerp(lat, nextLat, t),
                        THREE.MathUtils.lerp(lng, nextLng, t),
                        RADIUS * 1.004,
                      ),
                    );
                  }
                }
              }
            });
          });
          // Screen-space widths keep country borders legible on phones and when zooming.
          const geometry = new LineSegmentsGeometry().setPositions(
            points.flatMap((point) => [point.x, point.y, point.z]),
          );
          const material = new LineMaterial({
            transparent: true,
            depthWrite: false,
            toneMapped: false,
          });
          const border = new LineSegments2(geometry, material);
          border.renderOrder = 2;
          globe.add(border);
          geometries.push(geometry);
          materials.push(material);
          countryBorders.push({ id: feature.properties.id, material });
        });
        updateCountries();
      })
      .catch((error: unknown) => {
        if (!disposed)
          console.warn("Unable to load globe country outlines", error);
      });

    // Fine cartographic lines give the satellite imagery a quietly technical finish.
    const gridPoints: THREE.Vector3[] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = -180; lng < 180; lng += 3) {
        gridPoints.push(
          coordinates(lat, lng, RADIUS * 1.003),
          coordinates(lat, lng + 3, RADIUS * 1.003),
        );
      }
    }
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -90; lat < 90; lat += 3) {
        gridPoints.push(
          coordinates(lat, lng, RADIUS * 1.003),
          coordinates(lat + 3, lng, RADIUS * 1.003),
        );
      }
    }
    const gridGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0xb6dbed,
      transparent: true,
      opacity: 0.035,
    });
    globe.add(new THREE.LineSegments(gridGeometry, gridMaterial));
    geometries.push(gridGeometry);
    materials.push(gridMaterial);

    const pinGeometry = new THREE.SphereGeometry(0.033, 12, 12);
    const ringGeometry = new THREE.RingGeometry(0.065, 0.079, 40);
    geometries.push(pinGeometry, ringGeometry);
    const beacons = NODES.map((node) => {
      const origin = node.id === "dhaka";
      const position = coordinates(node.lat, node.lng, RADIUS * 1.016);
      const normal = position.clone().normalize();
      const pinMaterial = new THREE.MeshBasicMaterial({
        color: origin ? 0xffa861 : 0xe5f5ff,
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.copy(position);
      globe.add(pin);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: origin ? 0xff934e : 0x9cd9fb,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(position);
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      globe.add(ring);
      materials.push(pinMaterial, ringMaterial);
      return { node, position, pin, ring, normal };
    });

    const start = coordinates(ORIGIN.lat, ORIGIN.lng, RADIUS * 1.022);
    const packetGeometry = new THREE.SphereGeometry(0.025, 10, 10);
    geometries.push(packetGeometry);
    const routes = DESTINATIONS.map((node, index) => {
      const end = coordinates(node.lat, node.lng, RADIUS * 1.022);
      const angle = start.angleTo(end);
      const points = Array.from({ length: 81 }, (_, i) => {
        const t = i / 80;
        // Spherical interpolation keeps even short routes above Earth's surface.
        const point = start
          .clone()
          .multiplyScalar(Math.sin((1 - t) * angle) / Math.sin(angle))
          .addScaledVector(end, Math.sin(t * angle) / Math.sin(angle))
          .normalize();
        return point.multiplyScalar(
          RADIUS * 1.022 + Math.sin(Math.PI * t) * (0.22 + angle * 0.6),
        );
      });
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 80, 0.009, 5, false);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffa261,
        transparent: true,
        opacity: 0.65,
      });
      globe.add(new THREE.Mesh(geometry, material));
      const packetMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff1ce,
        transparent: true,
      });
      const packet = new THREE.Mesh(packetGeometry, packetMaterial);
      globe.add(packet);
      const trailGeometry = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(24),
      );
      const trailMaterial = new THREE.LineBasicMaterial({
        color: 0xffe2b0,
        transparent: true,
        opacity: 0.8,
      });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      globe.add(trail);
      geometries.push(geometry, trailGeometry);
      materials.push(material, packetMaterial, trailMaterial);
      return {
        id: node.id,
        curve,
        material,
        packet,
        trail,
        trailMaterial,
        progress: index * 0.24,
      };
    });

    // An inclined orbit sits in real 3D space, so the Earth naturally occludes its far side.
    const orbit = new THREE.Group();
    orbit.position.copy(globe.position);
    orbit.rotation.set(1.05, 0.1, -0.3);
    scene.add(orbit);
    const orbitPoints = Array.from({ length: 181 }, (_, i) => {
      const angle = (i / 180) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * 3.52,
        Math.sin(angle) * 3.52,
        0,
      );
    });
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xca9a76,
      transparent: true,
      opacity: 0.24,
    });
    orbit.add(new THREE.LineLoop(orbitGeometry, orbitMaterial));
    geometries.push(orbitGeometry);
    materials.push(orbitMaterial);

    let width = 1;
    let height = 1;
    let zoom = 1;
    const resize = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      camera.aspect = width / height;
      camera.position.set(0, 0.15, width < 640 ? 10.1 : 7.8);
      camera.lookAt(0, -0.35, 0);
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);
    let inView = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
      },
      { rootMargin: "80px" },
    );
    intersectionObserver.observe(stage);

    const orientationFor = (id: string) => {
      const destination = DESTINATIONS.find((node) => node.id === id);
      return new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          -0.2,
          Math.PI - THREE.MathUtils.degToRad((destination?.lng ?? 90) - 90),
          0,
        ),
      );
    };
    const targetOrientation = orientationFor(selectedRef.current);
    globe.quaternion.copy(targetOrientation);
    let lastInteraction = -Infinity;
    const dragAxis = new THREE.Vector3();
    const dragRotation = new THREE.Quaternion();
    const spinAxis = new THREE.Vector3(0, 1, 0);
    const spinRotation = new THREE.Quaternion();
    const rotate = (dx: number, dy: number) => {
      const distance = Math.hypot(dx, dy);
      if (!distance) return;
      dragAxis
        .set(dy / distance, dx / distance, 0)
        .applyQuaternion(camera.quaternion);
      dragRotation.setFromAxisAngle(dragAxis, distance * 0.006);
      targetOrientation.premultiply(dragRotation).normalize();
      lastInteraction = performance.now();
    };
    const changeZoom = (factor: number) => {
      zoom = THREE.MathUtils.clamp(zoom * factor, 0.78, 1.4);
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      lastInteraction = performance.now();
    };
    zoomRef.current = changeZoom;
    focusRef.current = (id) => {
      targetOrientation.copy(orientationFor(id));
      lastInteraction = performance.now();
    };
    const pointers = new Map<number, { x: number; y: number }>();
    const pinchDistance = () => {
      const [first, second] = [...pointers.values()];
      return first && second
        ? Math.hypot(first.x - second.x, first.y - second.y)
        : 0;
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      lastInteraction = performance.now();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      container.setPointerCapture(event.pointerId);
      container.style.cursor = "grabbing";
    };
    const pointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const oldDistance = pinchDistance();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        rotate(event.clientX - previous.x, event.clientY - previous.y);
      } else if (oldDistance > 0) {
        changeZoom(pinchDistance() / oldDistance);
      }
    };
    const pointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      lastInteraction = performance.now();
      if (container.hasPointerCapture(event.pointerId))
        container.releasePointerCapture(event.pointerId);
      container.style.cursor = pointers.size ? "grabbing" : "grab";
    };
    resetRef.current = () => {
      targetOrientation.copy(orientationFor(selectedRef.current));
      zoom = 1;
      changeZoom(1);
    };
    const keyDown = (event: KeyboardEvent) => {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-24, 0],
        ArrowRight: [24, 0],
        ArrowUp: [0, -24],
        ArrowDown: [0, 24],
      };
      const movement = moves[event.key];
      if (movement) rotate(...movement);
      else if (event.key === "+" || event.key === "=") changeZoom(1.1);
      else if (event.key === "-" || event.key === "_") changeZoom(1 / 1.1);
      else if (event.key === "Home") resetRef.current?.();
      else return;
      event.preventDefault();
    };
    container.addEventListener("pointerdown", pointerDown);
    container.addEventListener("pointermove", pointerMove);
    container.addEventListener("pointerup", pointerUp);
    container.addEventListener("pointercancel", pointerUp);
    container.addEventListener("lostpointercapture", pointerUp);
    container.addEventListener("keydown", keyDown);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setStatus("fallback");
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    const worldPosition = new THREE.Vector3();
    const projected = new THREE.Vector3();
    const viewDirection = new THREE.Vector3();
    const worldNormal = new THREE.Vector3();
    const trailPoint = new THREE.Vector3();
    let frameId = 0;
    let previousTime = performance.now();
    let elapsed = 0;
    const render = (now: number) => {
      frameId = requestAnimationFrame(render);
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      if (!inView || document.hidden) return;
      const moving = !pausedRef.current && !reducedMotion;
      if (moving) elapsed += delta;
      if (moving && !pointers.size && now - lastInteraction > 6000) {
        // One gentle revolution in about five minutes, with time to inspect a destination.
        spinRotation.setFromAxisAngle(spinAxis, delta * 0.02);
        targetOrientation.multiply(spinRotation).normalize();
      }
      const smoothing = reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
      globe.quaternion.slerp(targetOrientation, pointers.size ? 1 : smoothing);
      clouds.rotation.y = elapsed * 0.008;
      earthMaterial.uniforms.cloudOffset!.value =
        -clouds.rotation.y / (Math.PI * 2);
      updateCountries();
      globe.updateMatrixWorld(true);

      beacons.forEach(({ node, position, pin, ring, normal }, index) => {
        const active = node.id === selectedRef.current || node.id === "dhaka";
        const pulse = moving
          ? 1 + (Math.sin(elapsed * 2 - index) * 0.5 + 0.5) * 0.8
          : 1.3;
        ring.scale.setScalar(active ? pulse : 1);
        ring.material.opacity = active ? 0.8 - (pulse - 1) * 0.5 : 0.35;
        pin.scale.setScalar(active ? 1.4 : 1);
        worldPosition.copy(position).applyMatrix4(globe.matrixWorld);
        worldNormal.copy(normal).transformDirection(globe.matrixWorld);
        viewDirection.copy(camera.position).sub(worldPosition).normalize();
        projected.copy(worldPosition).project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const visible =
          worldNormal.dot(viewDirection) > 0.08 && y > 20 && y < height - 22;
        const offsetScale = width < 640 ? 0.67 : 1;
        const labelX = THREE.MathUtils.clamp(
          x + node.offset[0] * offsetScale,
          width < 640 ? 38 : 70,
          width - (width < 640 ? 38 : 70),
        );
        const labelY = y + node.offset[1] * offsetScale;
        const label = labelRefs.current.get(node.id);
        const leader = leaderRefs.current.get(node.id);
        if (label) {
          label.style.transform = `translate3d(${labelX}px, ${labelY}px, 0) translate(-50%, -50%)`;
          label.style.opacity = visible ? "1" : "0";
          label.style.visibility = visible ? "visible" : "hidden";
        }
        if (leader) {
          leader.setAttribute("d", `M ${x} ${y} L ${labelX} ${labelY}`);
          leader.style.opacity = visible ? (active ? "0.65" : "0.3") : "0";
        }
      });
      routes.forEach((route) => {
        const active = route.id === selectedRef.current;
        route.material.opacity = THREE.MathUtils.lerp(
          route.material.opacity,
          active ? 0.95 : 0.18,
          smoothing,
        );
        route.material.color.set(active ? 0xffa364 : 0xb2daec);
        if (moving)
          route.progress =
            (route.progress + delta * (active ? 0.16 : 0.09)) % 1;
        route.curve.getPointAt(route.progress, route.packet.position);
        route.packet.scale.setScalar(active ? 1.5 : 0.7);
        route.packet.material.opacity = active ? 1 : 0.4;
        route.trailMaterial.opacity = active ? 0.95 : 0.12;
        const attribute = route.trail.geometry.getAttribute("position");
        for (let i = 0; i < attribute.count; i++) {
          route.curve.getPointAt(
            Math.max(0, route.progress - (i / (attribute.count - 1)) * 0.13),
            trailPoint,
          );
          attribute.setXYZ(i, trailPoint.x, trailPoint.y, trailPoint.z);
        }
        attribute.needsUpdate = true;
      });
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(render);
    return () => {
      disposed = true;
      countryRequest.abort();
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      container.removeEventListener("pointerdown", pointerDown);
      container.removeEventListener("pointermove", pointerMove);
      container.removeEventListener("pointerup", pointerUp);
      container.removeEventListener("pointercancel", pointerUp);
      container.removeEventListener("lostpointercapture", pointerUp);
      container.removeEventListener("keydown", keyDown);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((map) => map.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      resetRef.current = null;
      zoomRef.current = null;
      focusRef.current = null;
    };
  }, []);

  return (
    <div
      className={styles.explorer}
      role="group"
      aria-label={
        bn
          ? "বিশ্বজুড়ে উচ্চশিক্ষার গন্তব্য"
          : "Explore your study destinations"
      }
    >
      <div
        className={styles.stage}
        ref={stageRef}
        data-status={status}
        data-paused={paused}
      >
        <div className={styles.ambient} aria-hidden="true" />
        <div className={styles.orbitGraphic} aria-hidden="true" />
        <div className={styles.stageHeading}>
          <span className={styles.taglineSizer} aria-hidden="true">
            {tagline}
          </span>
          <span className={styles.typewriterText}>{tagline}</span>
        </div>
        {status !== "ready" && (
          <div
            className={styles.fallback}
            role="img"
            aria-label={bn ? "পৃথিবীর উপগ্রহচিত্র" : "Satellite view of Earth"}
          >
            <span className={styles.fallbackLabel}>
              {bn ? "ঢাকা থেকে বিশ্বজুড়ে" : "From Dhaka to the world"}
            </span>
          </div>
        )}
        <div
          ref={canvasRef}
          className={styles.canvas}
          style={{ opacity: status === "ready" ? 1 : 0 }}
          role="group"
          tabIndex={status === "ready" ? 0 : -1}
          aria-label={
            bn
              ? "পৃথিবী ঘোরাতে টানুন বা তীরচিহ্নের কী ব্যবহার করুন। জুম করতে প্লাস বা মাইনাস, রিসেট করতে হোম চাপুন।"
              : "Drag or use arrow keys to rotate Earth. Use plus or minus to zoom, and Home to reset."
          }
        />
        <svg
          className={styles.leaders}
          aria-hidden="true"
          width="100%"
          height="100%"
        >
          {NODES.map((node) => (
            <path
              key={node.id}
              ref={(element) => {
                if (element) leaderRefs.current.set(node.id, element);
                else leaderRefs.current.delete(node.id);
              }}
            />
          ))}
        </svg>
        <div
          className={styles.labels}
          style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        >
          <div
            className={`${styles.mapLabel} ${styles.originLabel}`}
            ref={(element) => {
              if (element) labelRefs.current.set("dhaka", element);
              else labelRefs.current.delete("dhaka");
            }}
          >
            <span className={styles.originDot} />
            <span>{bn ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}</span>
          </div>
          {DESTINATIONS.map((item) => (
            <button
              key={item.id}
              ref={(element) => {
                if (element) labelRefs.current.set(item.id, element);
                else labelRefs.current.delete(item.id);
              }}
              type="button"
              className={styles.mapLabel}
              data-active={selected === item.id}
              tabIndex={status === "ready" ? 0 : -1}
              aria-pressed={selected === item.id}
              aria-label={
                bn ? `${item.countryBn} দেখুন` : `Explore ${item.country}`
              }
              onClick={() => selectDestination(item.id)}
            >
              <span className={styles.labelCode}>{item.code}</span>
              <span className={styles.labelName}>
                {bn ? item.countryBn : item.country}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.originNote} aria-hidden="true">
          {bn
            ? "শুরু হোক এখান থেকেই।"
            : "Every great journey\nstarts somewhere."}
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => zoomRef.current?.(1.1)}
            aria-label={bn ? "পৃথিবী কাছে আনুন" : "Zoom in on globe"}
            title={bn ? "জুম ইন" : "Zoom in"}
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => zoomRef.current?.(1 / 1.1)}
            aria-label={bn ? "পৃথিবী দূরে নিন" : "Zoom out on globe"}
            title={bn ? "জুম আউট" : "Zoom out"}
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => resetRef.current?.()}
            aria-label={bn ? "পৃথিবীর দৃশ্য রিসেট করুন" : "Reset globe view"}
            title={bn ? "রিসেট" : "Reset view"}
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={
              bn
                ? paused
                  ? "অ্যানিমেশন চালু করুন"
                  : "অ্যানিমেশন থামান"
                : paused
                  ? "Play globe animation"
                  : "Pause globe animation"
            }
            aria-pressed={paused}
            title={
              bn ? "অ্যানিমেশন" : paused ? "Play animation" : "Pause animation"
            }
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
        <div className={styles.interactionHint}>
          <span className={styles.mouseGesture} aria-hidden="true">
            <span className={styles.mouseWheel} />
          </span>
          <span>{bn ? "যেকোনো দিকে ঘোরান" : "Drag in any direction"}</span>
        </div>
        <div className={styles.fade} aria-hidden="true" />
      </div>

      <div
        className={styles.destinationNav}
        aria-label={bn ? "একটি গন্তব্য বেছে নিন" : "Choose a destination"}
        role="group"
      >
        <span className={styles.navCaption}>
          {bn ? "আপনার পরবর্তী অধ্যায়" : "YOUR NEXT CHAPTER"}
        </span>
        {DESTINATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectDestination(item.id)}
            aria-pressed={selected === item.id}
            aria-controls="globe-destination-details"
            className={styles.destinationButton}
          >
            <span className={styles.countryCode}>{item.code}</span>
            {bn ? item.countryBn : item.country}
            <span className={styles.selectionDot} />
          </button>
        ))}
      </div>

      <div className={styles.routeCard} id="globe-destination-details">
        <div className={styles.routeIdentity} aria-hidden="true">
          <div>
            <span className={styles.routeOverline}>
              {bn ? "ঢাকা থেকে" : "FROM DHAKA TO"}
            </span>
            <span className={styles.routeCity}>
              {bn ? destination.cityBn : destination.city}
              <span>{destination.code}</span>
            </span>
          </div>
        </div>
        <div
          className={styles.routeDescription}
          aria-live="polite"
          aria-atomic="true"
        >
          <p>
            {bn
              ? `${destination.countryBn} পড়তে যান`
              : `Your future in ${destination.country}`}
          </p>
          <span>
            {bn ? destination.descriptionBn : destination.description}
          </span>
        </div>
        <Link
          className={styles.exploreLink}
          href={localizedHref(`/destinations/${destination.id}`, locale)}
        >
          {bn ? "গন্তব্য দেখুন" : "Explore destination"}
        </Link>
      </div>
    </div>
  );
}
