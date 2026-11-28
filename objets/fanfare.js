// 🎺 Fanfare / orchestre — près des tribunes
import * as THREE from 'three';

export default {
  icon: '🎺',
  name: 'Fanfare',
  params: { color: '#ffd700', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.25, metalness: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 });
    // pupitre ( lutrin )
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6), darkMat);
    stand.position.y = 0.6;
    g.add(stand);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), darkMat);
    desk.position.y = 1.25;
    desk.rotation.x = -0.3;
    g.add(desk);
    // trompette horizontale
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), goldMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 1.5, 0);
    g.add(tube);
    // pavillon (cloche)
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.06, 0.35, 12), goldMat);
    bell.rotation.z = -Math.PI / 2;
    bell.position.set(0.55, 1.5, 0);
    g.add(bell);
    // pistons
    for (let i = -1; i <= 1; i++) {
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6), goldMat);
      piston.position.set(-0.1 + i * 0.15, 1.62, 0);
      g.add(piston);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
