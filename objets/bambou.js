// 🎋 Bambou — ambiance asiatique
import * as THREE from 'three';

export default {
  icon: '🎋',
  name: 'Bambou',
  params: { color: '#7cb342', height: 6, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const stemMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.7 });
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.8 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, p.height, 8), stemMat);
    trunk.position.y = p.height / 2;
    g.add(trunk);
    // nœuds
    for (let i = 1; i < 5; i++) {
      const node = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8), nodeMat);
      node.position.y = (p.height / 5) * i;
      g.add(node);
    }
    // feuilles
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.8, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.2), leafMat);
      leaf.position.set(Math.cos(a) * 0.5, p.height - 0.5 - (i % 3) * 0.6, Math.sin(a) * 0.5);
      leaf.rotation.set(0.6, 0, a);
      g.add(leaf);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
