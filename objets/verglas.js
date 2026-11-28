// 🧊 Plaque de verglas — zone glissante (perte d'adhérence)
import * as THREE from 'three';

export default {
  icon: '🧊',
  name: 'Plaque de verglas',
  params: { width: 8, length: 6, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(p.width, p.length),
      new THREE.MeshStandardMaterial({
        color: 0xb3e5fc,
        emissive: 0x4fc3f7,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.75,
        roughness: 0.05,
        metalness: 0.1
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.04;
    g.add(m);
    // reflets
    const shineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.05
    });
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(p.width * 0.2, p.length * 0.6), shineMat);
      s.rotation.x = -Math.PI / 2;
      s.position.set((i - 1) * p.width * 0.3, 0.05, 0);
      s.rotation.z = 0.3;
      g.add(s);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
