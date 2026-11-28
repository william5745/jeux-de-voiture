// 🚁 Hélicoptère de course — survole le circuit
import * as THREE from 'three';

export default {
  icon: '🚁',
  name: 'Hélicoptère',
  params: { color: '#d8342c', height: 15, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.4, metalness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.6 });
    // fuselage
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), bodyMat);
    body.scale.set(1, 0.8, 2.2);
    g.add(body);
    // cockpit (bulle vitrée)
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x81d4fa, roughness: 0.1, metalness: 0.8 })
    );
    cockpit.position.set(0, 0.2, 1.6);
    cockpit.scale.set(1, 0.7, 1);
    g.add(cockpit);
    // rotor principal
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 0.5), darkMat);
    rotor.position.y = 1.5;
    g.add(rotor);
    const rotor2 = rotor.clone();
    rotor2.rotation.y = Math.PI / 2;
    g.add(rotor2);
    // mât
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8), darkMat);
    mast.position.y = 1.1;
    g.add(mast);
    // rotor de queue
    const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.3), darkMat);
    tailRotor.position.set(0.6, 0.5, -3);
    g.add(tailRotor);
    // queue
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.15, 2.5, 8), bodyMat);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0.3, -2.5);
    g.add(tail);
    g.position.y = p.height;
    g.scale.setScalar(p.scale);
    return g;
  }
};
