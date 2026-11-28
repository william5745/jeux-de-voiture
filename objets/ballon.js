// 🎈 Ballon — obstacle aérien, éclate au contact
import * as THREE from 'three';

export default {
  icon: '🎈',
  name: 'Ballon',
  params: { color: '#e53935', height: 4, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.3 });
    const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 10), mat);
    balloon.position.y = p.height;
    balloon.scale.y = 1.15;
    g.add(balloon);
    // nœud
    const knot = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.4 })
    );
    knot.position.y = p.height - 0.9;
    knot.rotation.x = Math.PI;
    g.add(knot);
    // ficelle
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, p.height - 1, 4),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    string.position.y = (p.height - 1) / 2;
    g.add(string);
    g.scale.setScalar(p.scale);
    return g;
  }
};
