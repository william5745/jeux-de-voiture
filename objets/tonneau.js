// 🛢️ Tonneau d'huile — obstacle qui fait déraper le kart
import * as THREE from 'three';

export default {
  icon: '🛢️',
  name: 'Tonneau d\'huile',
  params: { color: '#8d6e63', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.5, metalness: 0.3 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6, metalness: 0.4 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.6, 12), bodyMat);
    body.position.y = 0.8;
    g.add(body);
    // cerclages métalliques
    [-0.5, 0.5].forEach(y => {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.12, 12), bandMat);
      band.position.y = 0.8 + y;
      g.add(band);
    });
    // tache d'huile au sol
    const spill = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 })
    );
    spill.rotation.x = -Math.PI / 2;
    spill.position.y = 0.02;
    g.add(spill);
    g.scale.setScalar(p.scale);
    return g;
  }
};
