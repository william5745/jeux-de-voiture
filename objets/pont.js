// 🌉 Pont / passerelle — section de piste surélevée
import * as THREE from 'three';

export default {
  icon: '🌉',
  name: 'Pont',
  params: { color: '#8d6e63', width: 10, length: 20, height: 5, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    // tablier
    const deck = new THREE.Mesh(new THREE.BoxGeometry(p.width, 0.6, p.length), mat);
    deck.position.y = p.height;
    g.add(deck);
    // piles
    for (let i = -1; i <= 1; i++) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, p.height, 10), darkMat);
      pillar.position.set(i * (p.width / 3), p.height / 2, 0);
      g.add(pillar);
    }
    // garde-corps
    [-1, 1].forEach(s => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, p.length), darkMat);
      rail.position.set(s * (p.width / 2 - 0.1), p.height + 0.7, 0);
      g.add(rail);
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, p.length), mat);
      top.position.set(s * (p.width / 2 - 0.1), p.height + 1.15, 0);
      g.add(top);
    });
    // arche sous le pont
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(p.width / 2 - 0.5, 0.4, 8, 16, Math.PI),
      darkMat
    );
    arch.position.y = 0;
    arch.rotation.z = 0;
    g.add(arch);
    g.scale.setScalar(p.scale);
    return g;
  }
};
