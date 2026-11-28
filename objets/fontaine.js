// 🌊 Fontaine / bassin — eau décorative (hors piste)
import * as THREE from 'three';

export default {
  icon: '⛲',
  name: 'Fontaine',
  params: { color: '#b0bec5', waterColor: '#4fc3f7', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.9 });
    // bassin circulaire
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.6, 16), stoneMat);
    basin.position.y = 0.3;
    g.add(basin);
    // eau
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(2.0, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.waterColor), transparent: true, opacity: 0.7,
        roughness: 0.1, metalness: 0.3, emissive: new THREE.Color(p.waterColor), emissiveIntensity: 0.2
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.55;
    g.add(water);
    // colonne centrale
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.8, 10), stoneMat);
    column.position.y = 1.5;
    g.add(column);
    // vasque supérieure
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.7, 0.3, 12), stoneMat);
    top.position.y = 2.5;
    g.add(top);
    // jet d'eau (cône émissif)
    const jet = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 1.2, 8, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xe1f5fe, transparent: true, opacity: 0.6,
        emissive: 0x81d4fa, emissiveIntensity: 0.5
      })
    );
    jet.position.y = 3.1;
    g.add(jet);
    g.scale.setScalar(p.scale);
    return g;
  }
};
