// 💡 Éclairage public — lampadaire de bord de piste
import * as THREE from 'three';

export default {
  icon: '💡',
  name: 'Éclairage public',
  params: { poleColor: '#455a64', lightColor: '#fff9c4', height: 7, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.poleColor), roughness: 0.5, metalness: 0.7 });
    // mât
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, p.height, 8), poleMat);
    pole.position.y = p.height / 2;
    g.add(pole);
    // crosse (bras courbé vers la piste)
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6), poleMat);
    arm.rotation.z = Math.PI / 2 - 0.4;
    arm.position.set(0.6, p.height - 0.2, 0);
    g.add(arm);
    // lanterne
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 10, 8),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.lightColor),
        emissive: new THREE.Color(p.lightColor),
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.9
      })
    );
    lamp.position.set(1.25, p.height - 0.5, 0);
    g.add(lamp);
    // chapeau de la lanterne
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.3, 8),
      poleMat
    );
    cap.position.set(1.25, p.height - 0.15, 0);
    g.add(cap);
    // base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 10), poleMat);
    base.position.y = 0.2;
    g.add(base);
    g.scale.setScalar(p.scale);
    return g;
  }
};
