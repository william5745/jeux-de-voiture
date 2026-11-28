// ⏱️ Panneau chronomètre géant — affiche les temps au bord de piste
import * as THREE from 'three';

export default {
  icon: '⏱️',
  name: 'Panneau chronomètre',
  params: { text: '00:00.000', bg: '#212121', fg: '#00e676', width: 14, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    // structure du panneau
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5, metalness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(p.width + 0.6, 3.6, 0.5), frameMat);
    frame.position.y = 5;
    g.add(frame);
    // écran LED
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 192;
    const ctx = c.getContext('2d');
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, 1024, 192);
    // effet de balayage LED (lignes horizontales sombres)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < 192; y += 4) ctx.fillRect(0, y, 1024, 2);
    ctx.fillStyle = p.fg;
    ctx.font = 'bold 110px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = p.fg; ctx.shadowBlur = 20;
    ctx.fillText(p.text, 512, 100);
    const tex = new THREE.CanvasTexture(c);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(p.width, 3),
      new THREE.MeshStandardMaterial({ map: tex, emissive: 0x004400, emissiveIntensity: 0.4 })
    );
    screen.position.set(0, 5, 0.3);
    g.add(screen);
    // pieds
    [-1, 1].forEach(s => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 3.5, 8),
        frameMat
      );
      leg.position.set(s * (p.width / 2 - 1), 1.75, -0.3);
      g.add(leg);
    });
    g.scale.setScalar(p.scale);
    return g;
  }
};
