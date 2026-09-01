import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SEZ_BOUNDS } from '../../data/geo-sez';
import { GeoProjection, sezProjection } from '../../utils/geoProjection';
import {
  featureHeight,
  lineCoords,
  loadLocalGeoJson,
  polygonRings,
  projectRing,
  roadWidth,
  type GeoJsonFeatureCollection,
  type MapMarkerInput,
} from './geo';

const GEO = {
  buildings: '/static/geo/sez-buildings.geojson',
  roads: '/static/geo/sez-roads.geojson',
  water: '/static/geo/sez-water.geojson',
  boundary: '/static/geo/sez-boundary.geojson',
};

export interface Sez3dMapOptions {
  host: HTMLElement;
  projection?: GeoProjection;
}

export interface LayerStats {
  buildings: number;
  roads: number;
  water: number;
}

export class Sez3dMap {
  readonly projection: GeoProjection;
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private root = new THREE.Group();
  private markerGroup = new THREE.Group();
  private markerMeshes = new Map<string, THREE.Object3D>();
  private raf = 0;
  private disposed = false;
  private resizeObs?: ResizeObserver;

  constructor(options: Sez3dMapOptions) {
    this.host = options.host;
    this.projection = options.projection ?? sezProjection;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdce8f2);
    this.scene.fog = new THREE.Fog(0xdce8f2, 1200, 12000);

    const { clientWidth: w, clientHeight: h } = this.host;
    this.camera = new THREE.PerspectiveCamera(48, Math.max(w, 1) / Math.max(h, 1), 1, 50000);
    this.camera.position.set(280, 420, 480);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(Math.max(w, 1), Math.max(h, 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.host.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minDistance = 80;
    this.controls.maxDistance = 28000;
    this.controls.target.set(0, 0, 0);

    this.scene.add(this.root);
    this.root.add(this.markerGroup);
    this.addLights();
    this.addGround();

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(this.host);
    this.loop();
  }

  async loadLocalLayers(): Promise<LayerStats> {
    const [buildings, roads, water, boundary] = await Promise.all([
      loadLocalGeoJson(GEO.buildings),
      loadLocalGeoJson(GEO.roads),
      loadLocalGeoJson(GEO.water),
      loadLocalGeoJson(GEO.boundary),
    ]);
    this.root.add(this.buildBoundary(boundary));
    this.root.add(this.buildWater(water));
    this.root.add(this.buildRoads(roads));
    this.root.add(this.buildBuildings(buildings));
    this.fitToBounds();
    return {
      buildings: buildings.features.length,
      roads: roads.features.length,
      water: water.features.length,
    };
  }

  setMarkers(markers: MapMarkerInput[]): void {
    const keep = new Set(markers.map((m) => m.id));
    for (const [id, obj] of this.markerMeshes) {
      if (!keep.has(id)) {
        this.markerGroup.remove(obj);
        this.disposeObject(obj);
        this.markerMeshes.delete(id);
      }
    }
    for (const m of markers) {
      const pos = this.projection.toLocal(m.lng, m.lat, 0);
      let obj = this.markerMeshes.get(m.id);
      if (!obj) {
        obj = m.kind === 'rider' ? this.createRiderMarker() : this.createOrderMarker();
        obj.name = m.id;
        this.markerGroup.add(obj);
        this.markerMeshes.set(m.id, obj);
      }
      obj.position.set(pos.x, 0, pos.z);
      if (m.kind === 'rider' && typeof m.heading === 'number') {
        obj.rotation.y = THREE.MathUtils.degToRad(-m.heading);
      }
    }
  }

  /** Manual drop for demo / dispatch UI */
  upsertMarker(marker: MapMarkerInput): void {
    const next = this.listMarkers().filter((m) => m.id !== marker.id);
    next.push(marker);
    this.setMarkers(next);
  }

  focusLngLat(lng: number, lat: number, height = 260): void {
    const p = this.projection.toLocal(lng, lat);
    this.controls.target.set(p.x, 0, p.z);
    this.camera.position.set(p.x + height * 0.55, height, p.z + height * 0.7);
    this.controls.update();
  }

  /** Ground point under orbit target (for dropping markers). */
  getFocusLngLat(): { lng: number; lat: number } {
    return this.projection.toLngLat(this.controls.target.x, this.controls.target.z);
  }

  /** Snapshot current markers (lng/lat) for merge updates. */
  listMarkers(): MapMarkerInput[] {
    const out: MapMarkerInput[] = [];
    for (const [id, obj] of this.markerMeshes) {
      const ll = this.projection.toLngLat(obj.position.x, obj.position.z);
      out.push({
        id,
        lng: ll.lng,
        lat: ll.lat,
        kind: id.startsWith('order-') ? 'order' : 'rider',
        heading: THREE.MathUtils.radToDeg(-obj.rotation.y),
      });
    }
    return out;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs?.disconnect();
    this.controls.dispose();
    this.disposeObject(this.scene);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize(): void {
    const w = Math.max(this.host.clientWidth, 1);
    const h = Math.max(this.host.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private addLights(): void {
    const hemi = new THREE.HemisphereLight(0xf0f6ff, 0xb7c4b0, 1.05);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(420, 680, 180);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 50;
    sun.shadow.camera.far = 2200;
    sun.shadow.camera.left = -900;
    sun.shadow.camera.right = 900;
    sun.shadow.camera.top = 900;
    sun.shadow.camera.bottom = -900;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  }

  private addGround(): void {
    const sw = this.projection.toLocal(SEZ_BOUNDS.minLng, SEZ_BOUNDS.minLat);
    const ne = this.projection.toLocal(SEZ_BOUNDS.maxLng, SEZ_BOUNDS.maxLat);
    const width = Math.abs(ne.x - sw.x) * 1.35;
    const depth = Math.abs(ne.z - sw.z) * 1.35;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({ color: 0xc9d6c0, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.4;
    this.root.add(ground);

    const grid = new THREE.GridHelper(Math.max(width, depth), 40, 0xb8c4b0, 0xd2dcc8);
    grid.position.y = -0.35;
    const mat = grid.material as THREE.Material | THREE.Material[];
    if (Array.isArray(mat)) mat.forEach((m) => { m.transparent = true; m.opacity = 0.35; });
    else {
      mat.transparent = true;
      mat.opacity = 0.35;
    }
    this.root.add(grid);
  }

  /** KML 配送范围：仅描边（与 Earth 中透明填充一致），不铺大色块 */
  private buildBoundary(fc: GeoJsonFeatureCollection): THREE.Group {
    const group = new THREE.Group();
    group.name = 'boundary';
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2dc0fb });

    for (const feature of fc.features) {
      for (const ring of polygonRings(feature.geometry)) {
        if (ring.length < 2) continue;
        const linePts = ring.map(([lng, lat]) => {
          const p = this.projection.toLocal(lng, lat);
          return new THREE.Vector3(p.x, 1.2, p.z);
        });
        const lineGeom = new THREE.BufferGeometry().setFromPoints(linePts);
        const line = new THREE.Line(lineGeom, lineMat);
        line.userData = {
          id: feature.properties?.id ?? feature.id,
          kind: 'service-boundary',
        };
        group.add(line);
      }
    }
    return group;
  }

  private buildBuildings(fc: GeoJsonFeatureCollection): THREE.Group {
    const group = new THREE.Group();
    group.name = 'buildings';
    const fill = new THREE.MeshStandardMaterial({
      color: 0xf4f6f8,
      roughness: 0.78,
      metalness: 0.04,
    });
    // Shared materials — avoid thousands of material clones
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xd0d5db, transparent: true, opacity: 0.55 });

    for (const feature of fc.features) {
      const rings = polygonRings(feature.geometry);
      if (!rings.length) continue;
      const height = featureHeight(feature.properties, 12);
      const shapePts = projectRing(this.projection, rings[0]);
      if (shapePts.length < 3) continue;
      const shape = new THREE.Shape();
      shape.moveTo(shapePts[0].x, shapePts[0].y);
      for (let i = 1; i < shapePts.length; i += 1) shape.lineTo(shapePts[i].x, shapePts[i].y);
      shape.closePath();

      for (let h = 1; h < rings.length; h += 1) {
        const holePts = projectRing(this.projection, rings[h]);
        if (holePts.length < 3) continue;
        const hole = new THREE.Path();
        hole.moveTo(holePts[0].x, holePts[0].y);
        for (let i = 1; i < holePts.length; i += 1) hole.lineTo(holePts[i].x, holePts[i].y);
        hole.closePath();
        shape.holes.push(hole);
      }

      const geom = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false,
        curveSegments: 1,
      });
      geom.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geom, fill);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        id: feature.properties?.id,
        name: feature.properties?.name,
        height,
        kind: 'building',
      };
      group.add(mesh);

      // Edges only for taller buildings to keep FPS
      if (height >= 14) {
        group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, 30), edgeMat));
      }
    }
    return group;
  }

  private buildRoads(fc: GeoJsonFeatureCollection): THREE.Group {
    const group = new THREE.Group();
    group.name = 'roads';
    for (const feature of fc.features) {
      const width = roadWidth(feature.properties);
      for (const line of lineCoords(feature.geometry)) {
        if (line.length < 2) continue;
        const pts = line.map(([lng, lat]) => {
          const p = this.projection.toLocal(lng, lat);
          return new THREE.Vector3(p.x, 0.15, p.z);
        });
        const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
        const geom = new THREE.TubeGeometry(curve, Math.max(12, pts.length * 8), width / 2, 5, false);
        const mesh = new THREE.Mesh(
          geom,
          new THREE.MeshStandardMaterial({ color: 0x5c6570, roughness: 0.92, metalness: 0.05 }),
        );
        mesh.receiveShadow = true;
        group.add(mesh);
        // center line
        const center = new THREE.TubeGeometry(curve, Math.max(12, pts.length * 8), 0.18, 3, false);
        group.add(new THREE.Mesh(center, new THREE.MeshBasicMaterial({ color: 0xf2c14e })));
      }
    }
    return group;
  }

  private buildWater(fc: GeoJsonFeatureCollection): THREE.Group {
    const group = new THREE.Group();
    group.name = 'water';
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4ea0c8,
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    for (const feature of fc.features) {
      for (const ring of polygonRings(feature.geometry)) {
        const pts = projectRing(this.projection, ring);
        if (pts.length < 3) continue;
        const shape = new THREE.Shape();
        shape.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i += 1) shape.lineTo(pts[i].x, pts[i].y);
        shape.closePath();
        const geom = new THREE.ShapeGeometry(shape);
        geom.rotateX(-Math.PI / 2);
        const mesh = new THREE.Mesh(geom, mat.clone());
        mesh.position.y = -0.1;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    }
    return group;
  }

  private createRiderMarker(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45 }),
    );
    body.position.y = 6;
    body.castShadow = true;
    g.add(body);
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(5.5, 24),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.2;
    g.add(halo);
    return g;
  }

  private createOrderMarker(): THREE.Group {
    const g = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 }),
    );
    box.position.y = 4;
    box.castShadow = true;
    g.add(box);
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xb45309 }),
    );
    pin.position.y = 1.5;
    g.add(pin);
    return g;
  }

  private fitToBounds(): void {
    const sw = this.projection.toLocal(SEZ_BOUNDS.minLng, SEZ_BOUNDS.minLat);
    const ne = this.projection.toLocal(SEZ_BOUNDS.maxLng, SEZ_BOUNDS.maxLat);
    const cx = (sw.x + ne.x) / 2;
    const cz = (sw.z + ne.z) / 2;
    this.controls.target.set(cx, 0, cz);
    this.camera.position.set(cx + 220, 380, cz + 360);
    this.controls.update();
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (!mat) return;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    });
  }
}
