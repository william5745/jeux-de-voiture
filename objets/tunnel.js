// 🚇 Tunnel — section couverte avec éclairage
import * as THREE from 'three';

export default {
  icon: '🚇',
  name: 'Tunnel',
  params: { color: '#616161', width: 12, length: 25, height: 7, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.95, side: THREE.DoubleSide });
    // voûte (demi-cylindre)
    const vault = new THREE.Mesh(
      new THREE.CylinderGeometry(p.width / 2, p.width / 2, p.length, 16, 1, true, 0, Math.PI),
      mat
    );
    vault.rotation.z = Math.PI / 2;
    vault.rotation.y = Math.PI / 2;
    vault.position.y = p.height / 2;
    g.add(vault);
    // murs de culée aux extrémités
    [-1, 1].forEach(s => {
      const wall = new THREE.Mesh(
        new THREE.CylinderGeometry(p.width / 2, p.width / 2, 0.8, 16, 1, false, s > 0 ? Math.PI : 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.95 })
      );
      wall.rotation.z = Math.PI / 2;
      wall.rotation.y = Math.PI / 2;
      wall.position.set(s * (p.length / 2), p.height / 2, 0);
      g.add(wall);
    });
    // bandes lumineuses au plafond
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff9c4, emissive: 0xffee58, emissiveIntensity: 1.5 });
    for (let i = -1; i <= 1; i++) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(p.length - 2, 0.15, 0.6), lightMat);
      strip.position.set(0, p.height - 0.3, i * (p.width / 4));
      g.add(strip);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
