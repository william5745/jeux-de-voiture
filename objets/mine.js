// 💣 Mine — explosif, éjecte le kart en l'air
import * as THREE from 'three';

export default {
  icon: '💣',
  name: 'Mine',
  params: { color: '#263238', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.4, metalness: 0.6 });
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), bodyMat);
    body.position.y = 0.55;
    body.scale.y = 0.85;
    g.add(body);
    // picots
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 6), spikeMat);
      spike.position.set(Math.cos(a) * 0.55, 0.55, Math.sin(a) * 0.55);
      spike.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
      g.add(spike);
    }
    // mèche avec étincelle
    const fuse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6),
      new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    fuse.position.y = 1.0;
    fuse.rotation.z = 0.3;
    g.add(fuse);
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xff9800, emissiveIntensity: 2 })
    );
    spark.position.set(0.1, 1.2, 0);
    g.add(spark);
    g.scale.setScalar(p.scale);
    return g;
  }
};
