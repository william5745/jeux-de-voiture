// 🌵 Cactus — ambiance désert / canyon
import * as THREE from 'three';

export default {
  icon: '🌵',
  name: 'Cactus',
  params: { color: '#388e3c', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.9 });
    // tronc principal
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 3, 8), mat);
    trunk.position.y = 1.5;
    g.add(trunk);
    // bras gauche
    const armL = new THREE.Group();
    const armLv = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 8), mat);
    armLv.position.y = 0.45;
    const armLh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 8), mat);
    armLh.rotation.z = Math.PI / 2;
    armLh.position.set(-0.35, 0.9, 0);
    const armLt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.8, 8), mat);
    armLt.position.set(-0.7, 1.25, 0);
    armL.add(armLv, armLh, armLt);
    armL.position.y = 0.8;
    g.add(armL);
    // bras droit
    const armR = armL.clone();
    armR.scale.x = -1;
    armR.position.y = 1.2;
    g.add(armR);
    // fleur au sommet
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xff6f91, emissive: 0xd81b60, emissiveIntensity: 0.4 })
    );
    flower.position.y = 3.15;
    g.add(flower);
    g.scale.setScalar(p.scale);
    return g;
  }
};
