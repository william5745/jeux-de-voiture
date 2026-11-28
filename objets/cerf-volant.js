// 🪁 Cerf-volant — vole au-dessus du circuit
import * as THREE from 'three';

export default {
  icon: '🪁',
  name: 'Cerf-volant',
  params: { color: '#ff7043', height: 12, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.color), roughness: 0.6, side: THREE.DoubleSide
    });
    // losange
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.2);
    shape.lineTo(0.9, 0);
    shape.lineTo(0, -1.2);
    shape.lineTo(-0.9, 0);
    shape.closePath();
    const kite = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      mat
    );
    kite.position.y = p.height;
    g.add(kite);
    // croix de structure
    const crossMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.06), crossMat);
    vBar.position.y = p.height;
    g.add(vBar);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), crossMat);
    hBar.position.y = p.height;
    g.add(hBar);
    // queue avec nœuds
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xffee58, side: THREE.DoubleSide });
    for (let i = 0; i < 4; i++) {
      const bow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), tailMat);
      bow.position.set(Math.sin(i * 0.8) * 0.3, p.height - 1.5 - i * 0.6, 0);
      bow.rotation.z = i * 0.5;
      g.add(bow);
    }
    g.scale.setScalar(p.scale);
    return g;
  }
};
