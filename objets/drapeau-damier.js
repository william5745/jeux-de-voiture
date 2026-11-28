// 🏳️ Drapeau à damier — animation départ/arrivée
import * as THREE from 'three';

export default {
  icon: '🏳️',
  name: 'Drapeau à damier',
  params: { color1: '#ffffff', color2: '#212121', width: 2, height: 1.3, poleHeight: 4, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    // mât
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, p.poleHeight, 8),
      new THREE.MeshStandardMaterial({ color: 0xbdbdbd, metalness: 0.7, roughness: 0.3 })
    );
    pole.position.y = p.poleHeight / 2;
    g.add(pole);
    // drapeau à damier via texture canvas
    const c = document.createElement('canvas');
    c.width = 128; c.height = 80;
    const ctx = c.getContext('2d');
    const cols = 8, rows = 5, cw = 128 / cols, ch = 80 / rows;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = (r + col) % 2 === 0 ? p.color1 : p.color2;
        ctx.fillRect(col * cw, r * ch, cw, ch);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(p.width, p.height),
      new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6 })
    );
    flag.position.set(p.width / 2 + 0.06, p.poleHeight - p.height / 2, 0);
    g.add(flag);
    g.scale.setScalar(p.scale);
    return g;
  }
};
