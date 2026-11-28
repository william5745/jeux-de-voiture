// 🗼 Tour de contrôle — alternative à la tour ACO
import * as THREE from 'three';

export default {
  icon: '🗼',
  name: 'Tour de contrôle',
  params: { color: '#eceff1', glassColor: '#263238', height: 22, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.glassColor), roughness: 0.15, metalness: 0.7
    });
    // fût conique
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 4, p.height - 6, 12), bodyMat);
    shaft.position.y = (p.height - 6) / 2;
    g.add(shaft);
    // cabine vitrée (partie haute élargie)
    const cabin = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.5, 6, 12), glassMat);
    cabin.position.y = p.height - 3;
    g.add(cabin);
    // toit de la cabine
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(5, 4.5, 1.2, 12), bodyMat);
    roof.position.y = p.height + 0.5;
    g.add(roof);
    // antennes
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 5, 6),
      new THREE.MeshStandardMaterial({ color: 0x9e9e9e, metalness: 0.7, roughness: 0.3 })
    );
    mast.position.y = p.height + 3.5;
    g.add(mast);
    // radar tournant
    const radar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 0.4), bodyMat);
    radar.position.y = p.height + 6.2;
    g.add(radar);
    g.scale.setScalar(p.scale);
    return g;
  }
};
