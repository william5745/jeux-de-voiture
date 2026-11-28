// 🔥 Flamme — obstacle de zone, dégâts au contact
import * as THREE from 'three';

export default {
  icon: '🔥',
  name: 'Flamme',
  params: { color: '#ff5722', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const outerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.color), emissive: new THREE.Color(p.color),
      emissiveIntensity: 1.5, transparent: true, opacity: 0.9, roughness: 0.3
    });
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffeb3b, emissive: 0xffc107, emissiveIntensity: 2.2, transparent: true, opacity: 0.95
    });
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 8), outerMat);
    outer.position.y = 1.1;
    g.add(outer);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 8), innerMat);
    inner.position.y = 0.7;
    g.add(inner);
    // base (brasero)
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 0.3, 10),
      new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6, metalness: 0.5 })
    );
    base.position.y = 0.15;
    g.add(base);
    g.scale.setScalar(p.scale);
    return g;
  }
};
