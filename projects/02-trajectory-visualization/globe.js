// 3D orbit view: Earth lit by the real Sun direction, every orbit drawn in the
// inertial (TEME) frame, scaled in Earth radii. Scene axes: x = ECI x, y = ECI z (north), z = -ECI y.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const RE = 6378.137;
export const REGIME_HEX = { LEO: '#1f9fb5', HEO: '#c97a3a', GEO: '#8a78e6', MEO: '#1f9fb5' };
const toScene = p => new THREE.Vector3(p.x / RE, p.z / RE, -p.y / RE);
const PRESETS = { leo: 4.6, geo: 17, deep: 78 };

const earthVertex = `
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const earthFragment = `
uniform sampler2D map;
uniform vec3 sunDir;
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  vec3 color = texture2D(map, vUv).rgb;
  float d = dot(normalize(vNormalW), normalize(sunDir));
  float day = smoothstep(-0.10, 0.18, d);
  vec3 night = color * 0.34;
  vec3 lit = color * (0.92 + 0.45 * max(d, 0.0));
  vec3 twilight = vec3(0.86, 0.48, 0.24) * 0.10 * (1.0 - abs(d) * 6.0);
  gl_FragColor = vec4(mix(night, lit, day) + max(twilight, 0.0), 1.0);
}`;
const atmosphereVertex = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const atmosphereFragment = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
  gl_FragColor = vec4(0.36, 0.76, 0.88, 1.0) * intensity;
}`;

function glowTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.22, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.36, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

export function createGlobe(container, { texture: textureCanvas, onSelect }) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.append(renderer.domElement);
    const labels = document.createElement('div');
    labels.className = 'globe-labels';
    container.append(labels);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 4000);
    camera.position.set(2.2, 1.7, 3.6);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.25;
    controls.maxDistance = 160;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;

    // Starfield
    const starPositions = [];
    for (let i = 0; i < 2400; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(900 + Math.random() * 400);
        starPositions.push(v.x, v.y, v.z);
    }
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3)),
        new THREE.PointsMaterial({ color: 0x9fb4d6, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.55 }));
    scene.add(stars);

    // Earth, rotated by GMST each frame so the texture tracks the real surface.
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: { map: { value: texture }, sunDir: { value: new THREE.Vector3(1, 0, 0) } },
        vertexShader: earthVertex, fragmentShader: earthFragment,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 64), earthMaterial);
    scene.add(earth);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 32), new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
    scene.add(atmosphere);

    // Equatorial plane reference ring at GEO radius
    const ringPoints = [];
    for (let i = 0; i <= 256; i++) {
        const a = i / 256 * Math.PI * 2;
        ringPoints.push(Math.cos(a) * 42164 / RE, 0, Math.sin(a) * 42164 / RE);
    }
    const ringMaterial = new LineMaterial({ color: 0x8390a5, linewidth: 1, transparent: true, opacity: 0.18, depthWrite: false });
    scene.add(new Line2(new LineGeometry().setPositions(ringPoints), ringMaterial));

    // Ground station marker, parented to the Earth so it rotates with it.
    const station = new THREE.Group();
    const stationDot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 8), new THREE.MeshBasicMaterial({ color: 0xeef2f7 }));
    const stationHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xeef2f7, transparent: true, opacity: 0.5, depthWrite: false }));
    stationHalo.scale.setScalar(0.09);
    station.add(stationDot, stationHalo);
    earth.add(station);

    const linkMaterial = new LineMaterial({ color: 0xeef2f7, linewidth: 1.2, transparent: true, opacity: 0.75, dashed: false });
    const link = new Line2(new LineGeometry().setPositions([0, 0, 0, 0, 0, 0]), linkMaterial);
    link.visible = false;
    scene.add(link);

    const glow = glowTexture();
    const objects = new Map();   // norad -> { orbit, sprite, label, sat }
    const materials = [linkMaterial, ringMaterial];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;
    let selectedId = null;
    let targetDistance = null;

    function ensure(sat) {
        if (objects.has(sat.norad)) return objects.get(sat.norad);
        const color = new THREE.Color(REGIME_HEX[sat.regime]);
        const material = new LineMaterial({ color, linewidth: 1.4, transparent: true, opacity: 0.5, depthWrite: false });
        materials.push(material);
        const orbit = new Line2(new LineGeometry(), material);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, sizeAttenuation: false }));
        sprite.scale.setScalar(0.034);
        sprite.userData.norad = sat.norad;
        const label = document.createElement('div');
        label.className = 'globe-label';
        label.textContent = sat.name;
        labels.append(label);
        scene.add(orbit, sprite);
        const entry = { orbit, sprite, label, sat, material };
        objects.set(sat.norad, entry);
        resize();
        return entry;
    }

    function resize() {
        const width = container.clientWidth, height = container.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Keep the horizontal field of view of a 16:10 frame on narrow, portrait screens.
        const halfH = Math.atan(Math.tan(19 * Math.PI / 180) * 1.6);
        camera.fov = camera.aspect < 1.6 ? Math.min(80, 2 * Math.atan(Math.tan(halfH) / camera.aspect) * 180 / Math.PI) : 38;
        camera.updateProjectionMatrix();
        for (const material of materials) material.resolution.set(width, height);
    }
    new ResizeObserver(resize).observe(container);

    function occluded(position) {
        // Hidden if the line of sight from the camera to the point passes through the Earth.
        const dir = position.clone().sub(camera.position);
        const dist = dir.length();
        dir.normalize();
        const b = camera.position.dot(dir);
        const c = camera.position.lengthSq() - 1;
        const disc = b * b - c;
        if (disc < 0) return false;
        const t = -b - Math.sqrt(disc);
        return t > 0 && t < dist;
    }

    function placeLabels() {
        const width = container.clientWidth, height = container.clientHeight;
        for (const [norad, entry] of objects) {
            const show = norad === selectedId || norad === hovered;
            const p = entry.sprite.position.clone();
            const hidden = !entry.sprite.visible || occluded(p);
            const projected = p.project(camera);
            const visible = show && !hidden && projected.z < 1;
            entry.label.hidden = !visible;
            entry.sprite.material.opacity = hidden ? 0.25 : 1;
            if (visible) {
                entry.label.style.transform = `translate(${(projected.x + 1) / 2 * width + 10}px, ${(1 - projected.y) / 2 * height - 22}px)`;
                entry.label.classList.toggle('is-selected', norad === selectedId);
            }
        }
    }

    renderer.domElement.addEventListener('pointermove', event => {
        const box = renderer.domElement.getBoundingClientRect();
        pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects([...objects.values()].map(o => o.sprite))[0];
        hovered = hit ? hit.object.userData.norad : null;
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
    });
    let downAt = null;
    renderer.domElement.addEventListener('pointerdown', event => { downAt = [event.clientX, event.clientY]; });
    renderer.domElement.addEventListener('pointerup', event => {
        if (downAt && Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]) < 5 && hovered) onSelect(hovered);
        downAt = null;
    });

    let running = true;
    new IntersectionObserver(([entry]) => { running = entry.isIntersecting; if (running) loop(); }).observe(container);
    function loop() {
        if (!running) return;
        if (targetDistance) {
            const d = camera.position.length();
            const next = d + (targetDistance - d) * 0.08;
            camera.position.setLength(next);
            if (Math.abs(next - targetDistance) < 0.01 * targetDistance) targetDistance = null;
        }
        controls.update();
        renderer.render(scene, camera);
        placeLabels();
        requestAnimationFrame(loop);
    }
    resize();
    loop();

    return {
        setPreset(name) { targetDistance = PRESETS[name]; },
        setOrbits(orbits, sats) {
            for (const sat of sats) {
                const positions = orbits.get(sat.norad) || [];
                const entry = ensure(sat);
                if (positions.length < 2) continue;
                const flat = [];
                for (const p of positions) { const v = toScene(p); flat.push(v.x, v.y, v.z); }
                entry.orbit.geometry.dispose();
                entry.orbit.geometry = new LineGeometry().setPositions(flat);
                entry.orbit.computeLineDistances();
            }
        },
        update({ sats, states, selected, gmst, sunUnit, stationInfo, inContact }) {
            selectedId = selected.norad;
            earth.rotation.y = gmst;
            earthMaterial.uniforms.sunDir.value.copy(toScene({ x: sunUnit.x * RE, y: sunUnit.y * RE, z: sunUnit.z * RE })).normalize();
            const lat = stationInfo.lat * Math.PI / 180, lon = stationInfo.lon * Math.PI / 180;
            station.position.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).multiplyScalar(1.002);
            for (const sat of sats) {
                const entry = ensure(sat);
                const s = states.get(sat.norad);
                entry.sprite.visible = Boolean(s);
                if (s) entry.sprite.position.copy(toScene(s.position));
                const isSelected = sat.norad === selectedId;
                entry.material.linewidth = isSelected ? 2.6 : 1.2;
                entry.material.opacity = isSelected ? 0.95 : 0.32;
                entry.sprite.scale.setScalar(isSelected ? 0.05 : 0.03);
            }
            const s = states.get(selected.norad);
            link.visible = Boolean(inContact && s);
            if (link.visible) {
                const ground = station.getWorldPosition(new THREE.Vector3());
                const sky = toScene(s.position);
                link.geometry.setPositions([ground.x, ground.y, ground.z, sky.x, sky.y, sky.z]);
            }
        },
    };
}
