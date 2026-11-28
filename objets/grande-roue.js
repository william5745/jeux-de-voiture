// 🎡 Grande roue — décor arrière-plan
import * as THREE from 'three';

export default {
  icon: '🎡',
  name: 'Grande roue',
  params: { color: '#ab47bc', radius: 12, scale: 1 },
  build: p => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.5, metalness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7 });
    // roue
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(p.radius, 0.25, 8, 32), mat);
    wheel.position.y = p.radius + 2;
    g.add(wheel);
    // rayons
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, p.radius * 2, 6),
        darkMat
      );
      spoke.position.y = p.radius + 2;
      spoke.rotation.z = a;
      g.add(spoke);
    }
    // nacelles
    const cabinColors = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#fb8c00', '#8e24aa'];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.2, 1.4),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(cabinColors[i % 6]), roughness: 0.4 })
      );
      cabin.position.set(Math.cos(a) * p.radius, p.radius + 2 + Math.sin(a) * p.radius, 0);
      g.add(cabin);
    }
    // pieds
    [-1, 1].forEach(s => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, p.radius * 2 + 2, 8), darkMat);
      leg.position.set(s * p.radius * 0.4, (p.radius + 2) / 2, 0);
      leg.rotation.z = s * -0.25;
      g.add(leg);
    });
    // moyeu
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 12), mat);
    hub.rotation.x = Math.PI / 2;
    hub.position.y = p.radius + 2;
    g.add(hub);
    g.scale.setScalar(p.scale);
    return g;
  }
};
