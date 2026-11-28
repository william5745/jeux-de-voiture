// 🪨 Rochers — obstacle statique décoratif
import * as THREE from 'three';

export default {
  icon: '🪨',
  name: 'Rochers',
  params: { color: '#9e9e9e', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 1, flatShading: true });
    const sizes = [[1.2, 0.9, 1.0, 0, 0.45, 0], [0.8, 0.6, 0.7, 0.9, 0.3, 0.3], [0.6, 0.5, 0.55, -0.8, 0.25, -0.2]];
    for (const [w, h, d, x, y, z] of sizes) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), mat);
      rock.scale.set(w, h, d);
      rock.position.set(x, y, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      g.add(rock);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
