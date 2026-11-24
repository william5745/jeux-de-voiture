// Catalogue d'objets 3D partagé entre bibliotheque.html et editeur.html
// THREE est fourni globalement par la page (window.__THREE) pour éviter les problèmes d'importmap imbriqués
const THREE = window.__THREE;

export const library = {
  kart: {
    icon: '🏎️', name: 'Kart de course',
    params: { color: '#e53935', scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.35, metalness: 0.4 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.6 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 3.4), bodyMat);
      body.position.y = 0.6;
      const nose = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.9), bodyMat);
      nose.position.set(0, 0.45, 2);
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 0.3), darkMat);
      bumper.position.set(0, 0.35, 2.4);
      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 0.6), bodyMat);
      spoiler.position.set(0, 1.35, -1.75);
      const strutG = new THREE.BoxGeometry(0.15, 0.5, 0.15);
      [-0.7, 0.7].forEach(x => { const s = new THREE.Mesh(strutG, darkMat); s.position.set(x, 1.05, -1.7); g.add(s); });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.4), darkMat);
      seat.position.set(0, 0.95, -0.7);
      const driver = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffd9b3 }));
      driver.position.set(0, 1.4, -0.2);
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.25, metalness: 0.3 }));
      helmet.position.set(0, 1.47, -0.2);
      const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff8c9, emissive: 0xffee88, emissiveIntensity: 1.2 });
      [-0.6, 0.6].forEach(x => { const hl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lightMat); hl.position.set(x, 0.6, 2.42); g.add(hl); });
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xaa0000, emissiveIntensity: 0.8 });
      [-0.6, 0.6].forEach(x => { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.1), tailMat); tl.position.set(x, 0.65, -1.72); g.add(tl); });
      g.add(body, nose, bumper, spoiler, seat, driver, helmet);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
      const hubMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3 });
      [[-1, 1.1], [1, 1.1], [-1, -1.1], [1, -1.1]].forEach(([x, z]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 12), wheelMat);
        w.rotation.z = Math.PI / 2; w.position.set(x, 0.45, z); g.add(w);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 8), hubMat);
        hub.rotation.z = Math.PI / 2; hub.position.copy(w.position); g.add(hub);
      });
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  tree: {
    icon: '🌲', name: 'Arbre (pin)',
    params: { trunkColor: '#7a4a21', leafColor: '#2e7d32', scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(p.trunkColor) }));
      trunk.position.y = 1.5;
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5, 8), new THREE.MeshStandardMaterial({ color: new THREE.Color(p.leafColor) }));
      leaves.position.y = 5;
      g.add(trunk, leaves); g.scale.setScalar(p.scale);
      return g;
    }
  },
  bush: {
    icon: '🌿', name: 'Buisson',
    params: { color: '#388e3c', scale: 1 },
    build: p => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 1, flatShading: true }));
      b.scale.y = 0.7; b.position.y = 0.8; b.scale.x *= p.scale; b.scale.z *= p.scale;
      return b;
    }
  },
  flower: {
    icon: '🌸', name: 'Fleur',
    params: { color: '#ff6f91', scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
      stem.position.y = 0.25;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.8 }));
      head.position.y = 0.55;
      g.add(stem, head); g.scale.setScalar(p.scale);
      return g;
    }
  },
  barrier: {
    icon: '🚧', name: 'Barrière',
    params: { scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xd8342c, roughness: 0.7 });
      for (let i = 0; i < 4; i++) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.15), i % 2 ? stripeMat : mat);
        seg.position.set(i * 1.2 - 1.8, 0.4, 0); g.add(seg);
      }
      [-1.8, 1.8].forEach(x => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x555555 }));
        post.position.set(x, 0.4, -0.15); g.add(post);
      });
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  itembox: {
    icon: '❓', name: 'Boîte objet',
    params: { scale: 1 },
    build: p => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffb300'; ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 120, 120);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 80px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', 64, 70);
      const tex = new THREE.CanvasTexture(c);
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8),
        new THREE.MeshStandardMaterial({ map: tex, emissive: 0x664400 }));
      m.position.y = 0.9; m.scale.setScalar(p.scale);
      return m;
    }
  },
  boost: {
    icon: '⚡', name: 'Zone de boost',
    params: { width: 8, length: 5 },
    build: p => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(p.width, p.length),
        new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x0088aa, transparent: true, opacity: 0.7 }));
      m.rotation.x = -Math.PI / 2; m.position.y = 0.05;
      return m;
    }
  },
  arch: {
    icon: '🎪', name: 'Arche de départ',
    params: { color: '#d8342c', width: 12 },
    build: p => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.5 });
      const postG = new THREE.CylinderGeometry(0.5, 0.5, 9, 10);
      [-1, 1].forEach(s => { const post = new THREE.Mesh(postG, mat); post.position.set(s * (p.width / 2), 4.5, 0); g.add(post); });
      const banner = new THREE.Mesh(new THREE.BoxGeometry(p.width + 1.2, 1.6, 0.4), mat);
      banner.position.y = 8.5; g.add(banner);
      return g;
    }
  },
  wall: {
    icon: '🧱', name: 'Mur de sécurité',
    params: { color: '#e8e8e8', height: 3, length: 10, scale: 1 },
    build: p => {
      const g = new THREE.Mesh(
        new THREE.BoxGeometry(p.length, p.height, 0.5),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.9 })
      );
      g.position.y = p.height / 2;
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  sign: {
    icon: '🪧', name: 'Panneau publicitaire',
    params: { text: '24 HEURES DU MANS', bg: '#b3121f', fg: '#ffffff', width: 11, scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const c = document.createElement('canvas'); c.width = 512; c.height = 96;
      const ctx = c.getContext('2d');
      ctx.fillStyle = p.bg; ctx.fillRect(0, 0, 512, 96);
      ctx.fillStyle = p.fg; ctx.font = 'bold 42px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.text, 256, 52);
      const tex = new THREE.CanvasTexture(c);
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(p.width, 2),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide })
      );
      panel.position.y = 5.6;
      const postG = new THREE.CylinderGeometry(0.15, 0.15, 5.6, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
      [-p.width/2 + 0.5, p.width/2 - 0.5].forEach(x => {
        const post = new THREE.Mesh(postG, postMat);
        post.position.set(x, 2.8, -0.2); g.add(post);
      });
      g.add(panel);
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  pitbox: {
    icon: '🅿️', name: 'Box de stand',
    params: { color: '#555555', lineColor: '#ffffff', width: 4, length: 5 },
    build: p => {
      const g = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.PlaneGeometry(p.width, p.length),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.8 })
      );
      box.rotation.x = -Math.PI / 2; box.position.y = 0.05;
      g.add(box);
      const lineMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.lineColor), roughness: 0.5 });
      const mkLine = (w, l, x, z) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), lineMat);
        m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); g.add(m);
      };
      mkLine(p.width + 0.2, 0.2, 0, -p.length/2);
      mkLine(p.width + 0.2, 0.2, 0, p.length/2);
      mkLine(0.2, p.length + 0.2, -p.width/2, 0);
      mkLine(0.2, p.length + 0.2, p.width/2, 0);
      // texte P
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = p.color; ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 90px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('P', 64, 70);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), roughness: 0.9 }));
      label.rotation.x = -Math.PI / 2; label.position.y = 0.07;
      g.add(label);
      return g;
    }
  },
  pitsign: {
    icon: '🚩', name: 'Panneau Arrêt au stand',
    params: { text: 'ARRÊT AU STAND', bg: '#d8342c', fg: '#ffffff', width: 16, scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = p.bg; ctx.fillRect(0, 0, 1024, 128);
      ctx.strokeStyle = p.fg; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 1018, 122);
      ctx.fillStyle = p.fg; ctx.font = 'bold 72px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.text, 512, 68);
      const tex = new THREE.CanvasTexture(c);
      const banner = new THREE.Mesh(
        new THREE.BoxGeometry(p.width, 2, 0.4),
        new THREE.MeshStandardMaterial({ map: tex, emissive: 0x441111, emissiveIntensity: 0.3 })
      );
      banner.position.y = 5; g.add(banner);
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 5, 8),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.bg), roughness: 0.5 })
      );
      post.position.set(0, 2.5, -1.5); g.add(post);
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  shell: {
    icon: '🐢', name: 'Carapace',
    params: { color: '#2e7d32', scale: 1 },
    build: p => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 10, 8),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.4 })
      );
      m.position.y = 0.8; m.scale.setScalar(p.scale);
      return m;
    }
  },
  mushroom: {
    icon: '🍄', name: 'Champignon',
    params: { capColor: '#e53935', stemColor: '#fff8e1', scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.stemColor), roughness: 0.7 })
      );
      stem.position.y = 0.3;
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.capColor), roughness: 0.4 })
      );
      cap.position.y = 0.55;
      g.add(stem, cap); g.scale.setScalar(p.scale);
      return g;
    }
  },
  star: {
    icon: '⭐', name: 'Étoile',
    params: { color: '#ffd700', scale: 1 },
    build: p => {
      const shape = new THREE.Shape();
      const spikes = 5, outer = 0.8, inner = 0.35;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false });
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.color), emissive: new THREE.Color(p.color), emissiveIntensity: 0.5, roughness: 0.3
      }));
      m.position.y = 0.8; m.scale.setScalar(p.scale);
      return m;
    }
  },
  mechanic: {
    icon: '👨‍🔧', name: 'Mécanicien',
    params: { color: '#ff6f00', skinColor: '#ffd9b3', scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.7 })
      );
      body.position.y = 0.55;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.skinColor), roughness: 0.7 })
      );
      head.position.y = 1.1;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      cap.position.y = 1.24;
      const armL = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.1),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.7 })
      );
      armL.position.set(-0.32, 0.65, 0); armL.rotation.z = 0.6;
      const armR = armL.clone(); armR.position.x = 0.32; armR.rotation.z = -0.6;
      g.add(body, head, cap, armL, armR);
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  pit: {
    icon: '🏗️', name: 'Bâtiment des stands',
    params: { color: '#90a4ae', roofColor: '#37474f', length: 30, scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.8 });
      const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.roofColor), roughness: 0.6 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(p.length, 7, 10), bodyMat);
      body.position.y = 3.5; g.add(body);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(p.length + 0.5, 0.4, 10.8), roofMat);
      roof.position.y = 7.2; g.add(roof);
      // portes de stand
      for (let i = 0; i < 6; i++) {
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(3, 4, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.5 })
        );
        door.position.set(-p.length/2 + 3 + i * (p.length - 6) / 5, 2, -5.1);
        g.add(door);
      }
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  cloud: {
    icon: '☁️', name: 'Nuage',
    params: { scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
      for (let j = 0; j < 4; j++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(3 + j * 1.5, 7, 6), mat);
        s.position.set(j * 4 - 6, j * 0.4, j * 0.5);
        g.add(s);
      }
      g.scale.setScalar(p.scale); g.position.y = 5;
      return g;
    }
  },
  mountain: {
    icon: '⛰️', name: 'Montagne',
    params: { color: '#7d9b76', height: 30, scale: 1 },
    build: p => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(20 * p.scale, p.height, 5),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 1, flatShading: true }));
      m.position.y = p.height / 2;
      return m;
    }
  },
  stand: {
    icon: '👥', name: 'Tribune',
    params: { color: '#9e9e9e', rows: 5, scale: 1 },
    build: p => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.9 });
      for (let r = 0; r < p.rows; r++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 1.3), mat);
        step.position.set(0, 0.25 + r * 0.5, -r * 1.3); g.add(step);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.25, p.rows * 1.1 + 1.6),
        new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 }));
      roof.position.set(0, 0.5 + p.rows * 0.5, -p.rows * 0.65); g.add(roof);
      g.scale.setScalar(p.scale);
      return g;
    }
  },
  aco: {
    icon: '🏢', name: 'Tour ACO',
    params: { scale: 1 },
    build: p => {
      // textures procédurales (identiques à celles du jeu)
      const acoGlassTexture = () => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        const x = c.getContext('2d');
        const grad = x.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#a8cbe9'); grad.addColorStop(0.55, '#5d87b8'); grad.addColorStop(1, '#33547e');
        x.fillStyle = grad; x.fillRect(0, 0, 512, 256);
        x.fillStyle = 'rgba(245,245,245,0.9)';
        for (let col = 0; col <= 16; col++) x.fillRect(col * 32 - 2, 0, 4, 256);
        x.fillRect(0, 124, 512, 5);
        x.fillStyle = 'rgba(255,255,255,0.20)';
        for (let i = 0; i < 5; i++) x.fillRect(i * 110 + 18, 8, 30, 240);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1);
        return t;
      };
      const acoBannerTexture = (text, bg, fg) => {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 64;
        const x = c.getContext('2d');
        x.fillStyle = bg; x.fillRect(0, 0, 1024, 64);
        x.fillStyle = fg; x.font = 'bold 36px Arial';
        x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(text, 512, 34);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1);
        return t;
      };
      const acoAnnexTexture = () => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 128;
        const x = c.getContext('2d');
        x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, 256, 128);
        x.fillStyle = '#2c4a6e';
        for (let r = 0; r < 2; r++)
          for (let col = 0; col < 6; col++)
            x.fillRect(14 + col * 40, 16 + r * 52, 28, 36);
        return new THREE.CanvasTexture(c);
      };

      const R = 7; // rayon de la tour
      const glassMat = new THREE.MeshStandardMaterial({ map: acoGlassTexture(), roughness: 0.25, metalness: 0.35 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.75 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.55 });
      const b = new THREE.Group();

      // socle / rez-de-chaussée
      const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 3, 28), whiteMat);
      base.position.y = 1.5; base.castShadow = true; base.receiveShadow = true;
      b.add(base);
      const door = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x16324f, roughness: 0.2, metalness: 0.6 })
      );
      door.position.set(0, 1.3, -R - 0.05);
      b.add(door);

      // fût en verre (étages de la tour de contrôle)
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(R, R, 19, 28),
        [glassMat, whiteMat, whiteMat]
      );
      shaft.position.y = 3 + 9.5; shaft.castShadow = true; shaft.receiveShadow = true;
      b.add(shaft);

      // bandeaux publicitaires autour de chaque niveau
      const banners = [
        [5.2,  'AUTOMOBILE CLUB DE L\'OUEST', '#0d3b8f', '#ffd400'],
        [9.6,  '24 HEURES DU MANS',            '#ffd400', '#0d3b8f'],
        [14.0, 'AUTOMOBILE CLUB DE L\'OUEST', '#0d3b8f', '#ffd400'],
        [18.4, 'ENDURANCE • 24H LE MANS',      '#ffd400', '#0d3b8f'],
        [21.6, 'ACO • AUTOMOBILE CLUB DE L\'OUEST', '#0d3b8f', '#ffffff']
      ];
      for (const [y, text, bg, fg] of banners) {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(R + 0.25, R + 0.25, 2.1, 28, 1, true),
          new THREE.MeshStandardMaterial({ map: acoBannerTexture(text, bg, fg), side: THREE.DoubleSide, roughness: 0.6 })
        );
        band.position.y = y;
        b.add(band);
      }

      // grand toit plat en porte-à-faux
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(10.2, 10.2, 0.7, 32), darkMat);
      roof.position.y = 22.35; roof.castShadow = true;
      b.add(roof);
      const parapet = new THREE.Mesh(new THREE.CylinderGeometry(10.25, 10.25, 0.9, 32, 1, true), darkMat);
      parapet.position.y = 22.9;
      b.add(parapet);
      // antenne + gyrophare rouge au sommet
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 4.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x9e9e9e, metalness: 0.7, roughness: 0.3 })
      );
      mast.position.y = 25;
      b.add(mast);
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xcc0000, emissiveIntensity: 1.4 })
      );
      beacon.position.y = 27.4;
      b.add(beacon);

      // bâtiment annexe blanc avec enseigne 24H
      const annex = new THREE.Mesh(
        new THREE.BoxGeometry(17, 7, 9),
        new THREE.MeshStandardMaterial({ map: acoAnnexTexture(), roughness: 0.7 })
      );
      annex.position.set(13, 3.5, 2);
      annex.castShadow = true; annex.receiveShadow = true;
      b.add(annex);
      const annexRoof = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.4, 9.6), darkMat);
      annexRoof.position.set(13, 7.2, 2);
      annexRoof.castShadow = true;
      b.add(annexRoof);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 1.8),
        new THREE.MeshStandardMaterial({ map: acoBannerTexture('24 HEURES DU MANS', '#b3121f', '#ffffff'), roughness: 0.6 })
      );
      sign.position.set(13, 6.2, -2.56);
      b.add(sign);

      b.scale.setScalar(p.scale);
      return b;
    }
  },
};
