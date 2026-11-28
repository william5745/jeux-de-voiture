// 🌴 Palmier — ambiance bord de mer / tropiques
import * as THREE from 'three';

export default {
  icon: '🌴',
  name: 'Palmier',
  params: { trunkColor: '#8d6e63', leafColor: '#43a047', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    // tronc courbé (segments inclinés)
    const trunkMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.trunkColor), roughness: 0.9 });
    let y = 0, x = 0;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.22 - i * 0.03, 0.28 - i * 0.03, 1.1, 7), trunkMat);
      x += 0.15 * i;
      y += 0.5;
      seg.position.set(x, y, 0);
      seg.rotation.z = -0.25;
      g.add(seg);
    }
    // palmes (feuilles courbées)
    const leafMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.leafColor), roughness: 0.8, side: THREE.DoubleSide });
    const topX = x, topY = y + 0.5;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.8), leafMat);
      leaf.position.set(topX + Math.cos(a) * 1.0, topY + 0.2, Math.sin(a) * 1.0);
      leaf.rotation.set(Math.PI / 2 - 0.5, 0, a + Math.PI / 2);
      leaf.translateY(1.2);
      g.add(leaf);
    }
    // noix de coco
    const cocoMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
    [-0.2, 0.2].forEach(dx => {
      const coco = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), cocoMat);
      coco.position.set(topX + dx, topY - 0.15, 0);
      g.add(coco);
    });
    g.scale.setScalar(p.scale);
    return g;
  }
};
