// 🦅 Oiseau — traverse le ciel
import * as THREE from 'three';

export default {
  icon: '🦅',
  name: 'Oiseau',
  params: { color: '#5d4037', height: 18, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.8 });
    // corps
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), mat);
    body.scale.set(1, 0.8, 1.6);
    g.add(body);
    // tête
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), mat);
    head.position.set(0, 0.25, 0.7);
    g.add(head);
    // bec
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.35, 6),
      new THREE.MeshStandardMaterial({ color: 0xffa000 })
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.25, 1.0);
    g.add(beak);
    // ailes
    const wingGeo = new THREE.PlaneGeometry(1.8, 0.7);
    const wingL = new THREE.Mesh(wingGeo, mat);
    wingL.position.set(-1.0, 0.1, 0);
    wingL.rotation.z = 0.3;
    g.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, mat);
    wingR.position.set(1.0, 0.1, 0);
    wingR.rotation.z = -0.3;
    g.add(wingR);
    // queue
    const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), mat);
    tail.position.set(0, 0, -0.8);
    tail.rotation.x = -0.3;
    g.add(tail);
    g.position.y = p.height;
    g.scale.setScalar(p.scale);
    return g;
  }
};
