// 🏰 Château — ambiance médiévale
import * as THREE from 'three';

export default {
  icon: '🏰',
  name: 'Château',
  params: { color: '#9e9e9e', scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.95, flatShading: true });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.7 });
    // corps principal
    const body = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 8), stoneMat);
    body.position.y = 4;
    g.add(body);
    // toit
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3, 4), roofMat);
    roof.position.y = 9.5;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    // 4 tours d'angle
    [-1, 1].forEach(sx => {
      [-1, 1].forEach(sz => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 11, 8), stoneMat);
        tower.position.set(sx * 4.5, 5.5, sz * 3.5);
        g.add(tower);
        const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.5, 8), roofMat);
        towerRoof.position.set(sx * 4.5, 12.2, sz * 3.5);
        g.add(towerRoof);
        // drapeau sur chaque tour
        const flag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xd8342c, side: THREE.DoubleSide })
        );
        flag.position.set(sx * 4.5 + 0.4, 14, sz * 3.5);
        g.add(flag);
      });
    });
    // porte d'entrée
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(2, 3.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 })
    );
    door.position.set(0, 1.75, 4.1);
    g.add(door);
    // fenêtres
    const winMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.3, metalness: 0.5 });
    for (let i = -1; i <= 1; i++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.2), winMat);
      win.position.set(i * 3, 5, 4.05);
      g.add(win);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
