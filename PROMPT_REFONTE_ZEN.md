# PROMPT v5 — Refonte Beige Minimaliste (Notion-like)

> Copie-colle ce prompt dans Claude Chat avec ton `index.html` en pièce jointe.

---

```
Tu es un designer/développeur senior. Tu dois transformer le design de cette app Scalyo.

DIRECTION ARTISTIQUE :
- Style Notion : ultra clean, minimaliste, studieux, aéré
- Fond BEIGE PARCHEMIN #FAF7F2 PARTOUT (landing page + app) — PAS blanc, PAS noir
- Cartes en blanc #FFFFFF sur fond beige
- Texte charbon chaud #2D2A26 — lisible mais doux
- Accent : bleu poudré mat #7B9BAF — PAS de néon, PAS de cyan, PAS de teal vif
- Vert sauge #7D9B8A, terre cuite #C4796E, ambre sable #C4A24E
- Ombres chaudes teintées brun, ultra-subtiles
- Arrondis doux 12-20px
- Police Inter (pas DM Sans)
- ZÉRO couleur néon/fluo/vive dans TOUT le fichier

⚠️ RÈGLES ABSOLUES :
1. Retourne le fichier COMPLET (pas d'extrait)
2. NE MODIFIE AUCUNE logique métier, fonction, appel Supabase/Stripe/Anthropic
3. NE SUPPRIME aucun composant
4. Tu changes UNIQUEMENT : couleurs, polices, ombres, bordures, arrondis, opacités
5. ZÉRO texte invisible ou illisible — contraste WCAG AA minimum

═══════════════════════════════════════════
ÉTAPE 1 — REMPLACEMENTS GLOBAUX (FAIS-LES EN PREMIER)
═══════════════════════════════════════════

Fais ces find/replace dans TOUT le fichier, dans l'ordre :

1.1 — TEXTE BOUTONS (⚠️ CRITIQUE — 24 occurrences)
   CHERCHE : color: "#070D1A"
   REMPLACE : color: "#FFFFFF"
   → Ce sont des textes de boutons sur gradient. Le texte DOIT être blanc.

1.2 — BLEU NÉON (22 occurrences)
   CHERCHE : #0EA5E9
   REMPLACE : dans les template literals → ${C.blue}
              dans le CSS → #6B8FAD
   → ZÉRO #0EA5E9 dans le fichier final.

1.3 — VERT NÉON (9 occurrences)
   CHERCHE : #10B981 → remplace par ${C.green}
   CHERCHE : #059669 → remplace par #6A8F7C

1.4 — FOND SOMBRE BODY (dans CSS ligne 20)
   CHERCHE : background:#070D1A
   REMPLACE : background:#FAF7F2

1.5 — TEXTE BODY (dans CSS ligne 20)
   CHERCHE : color:#E8EDF5
   REMPLACE : color:#2D2A26

1.6 — POLICES (20 occurrences)
   CHERCHE : 'DM Sans' → REMPLACE : 'Inter'  (3 occ.)
   CHERCHE : 'DM Mono' → REMPLACE : 'JetBrains Mono'  (17 occ.)

   Remplace aussi le <link> Google Fonts (ligne ~9) par :
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

1.7 — OVERLAY MODAL
   CHERCHE : rgba(7,13,26,0.9) → REMPLACE : rgba(45,42,38,0.50)
   CHERCHE : rgba(7,13,26,0.6) → REMPLACE : rgba(45,42,38,0.40)

1.8 — THÈME PAR DÉFAUT (ligne ~7882)
   CHERCHE : "scalyo_theme")||"dark"
   REMPLACE : "scalyo_theme")||"light"
   (et aussi le catch: return "dark" → return "light")

═══════════════════════════════════════════
ÉTAPE 2 — REMPLACE TOUT LE CSS (<style>)
═══════════════════════════════════════════

Remplace TOUT ce qui est entre <style> et </style> par exactement ceci :

*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#FAF7F2;font-family:'Inter',sans-serif;color:#2D2A26;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(45,42,38,0.12);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(45,42,38,0.22)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .3s ease;letter-spacing:-.2px}
.btn-primary{background:linear-gradient(135deg,#7B9BAF,#6B8FAD);color:#fff;box-shadow:0 2px 8px rgba(123,155,175,0.15)}
.btn-primary:hover{transform:translateY(-0.5px);box-shadow:0 4px 14px rgba(123,155,175,0.20)}
.btn-secondary{background:rgba(45,42,38,0.04);color:rgba(45,42,38,0.65);border:1px solid rgba(45,42,38,0.10)}
.btn-secondary:hover{background:rgba(45,42,38,0.07);border-color:rgba(45,42,38,0.16)}
.btn-danger{background:rgba(196,121,110,0.06);color:#C4796E;border:1px solid rgba(196,121,110,0.16)}
.btn-danger:hover{background:rgba(196,121,110,0.12)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:10px}
.csm-filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;padding:0 2px}
.csm-chip{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(45,42,38,0.10);background:rgba(45,42,38,0.03);color:rgba(45,42,38,0.50);transition:all .25s ease}
.csm-chip:hover{background:rgba(123,155,175,0.06);border-color:rgba(123,155,175,0.18);color:#7B9BAF}
.csm-chip.active{background:rgba(123,155,175,0.08);border-color:rgba(123,155,175,0.25);color:#7B9BAF;font-weight:700}
.chat-input{flex:1;background:rgba(45,42,38,0.03);border:1px solid rgba(45,42,38,0.10);border-radius:14px;padding:12px 16px;color:#2D2A26;font-size:13px;font-family:inherit;resize:none}
.chat-input:focus{outline:none;border-color:rgba(123,155,175,0.35);background:#FFFFFF}
.chat-send-btn{background:linear-gradient(135deg,#7B9BAF,#6B8FAD);border:none;border-radius:14px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(123,155,175,0.14);transition:all .3s ease;flex-shrink:0}
.chat-send-btn:hover{transform:scale(1.03);box-shadow:0 4px 14px rgba(123,155,175,0.20)}
.chat-send-btn:disabled{opacity:.35;transform:none;cursor:not-allowed}
.api-banner{padding:14px 18px;background:rgba(196,162,78,0.05);border:1px solid rgba(196,162,78,0.15);border-radius:14px;margin:12px 18px;display:flex;gap:12px;font-size:13px;align-items:flex-start}
.tip-card{background:rgba(45,42,38,0.02);border:1px solid rgba(45,42,38,0.07);border-radius:16px;padding:16px 18px;margin-bottom:8px;cursor:pointer;transition:all .3s ease}
.tip-card:hover{background:rgba(123,155,175,0.03);border-color:rgba(123,155,175,0.14)}
.tip-card.open{border-color:rgba(123,155,175,0.20);background:rgba(123,155,175,0.03)}
.quick-chip{padding:7px 14px;border-radius:20px;font-size:12px;cursor:pointer;background:rgba(45,42,38,0.03);border:1px solid rgba(45,42,38,0.10);color:rgba(45,42,38,0.50);transition:all .25s ease;font-weight:500}
.quick-chip:hover{background:rgba(123,155,175,0.06);border-color:rgba(123,155,175,0.18);color:#7B9BAF}
.toggle-switch{position:relative;width:46px;height:26px;display:inline-block;flex-shrink:0}
.toggle-switch input{display:none}
.toggle-slider{position:absolute;inset:0;border-radius:26px;background:rgba(45,42,38,0.10);cursor:pointer;transition:.3s}
.toggle-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 3px rgba(45,42,38,0.12)}
input:checked+.toggle-slider{background:#7B9BAF}
input:checked+.toggle-slider::before{transform:translateX(20px)}
.nav-btn{transition:all .25s ease;border-radius:12px;cursor:pointer}
.nav-btn:hover{background:rgba(45,42,38,0.04)!important}
.row-item{transition:background .2s ease;cursor:pointer}
.row-item:hover{background:rgba(123,155,175,0.03)!important}
.card-lift{transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}
.card-lift:hover{transform:translateY(-1px);border-color:rgba(123,155,175,0.14)!important;box-shadow:0 4px 14px rgba(45,42,38,0.05)}
.btn-base{transition:all .3s ease;cursor:pointer;border:none;font-family:'Inter',sans-serif;font-weight:600;outline:none}
.btn-base:hover:not(:disabled){transform:translateY(-0.5px);filter:brightness(1.03)}
.btn-base:active:not(:disabled){transform:translateY(0);filter:brightness(0.97)}
.btn-base:disabled{opacity:.35;cursor:not-allowed;transform:none!important;filter:none!important}
.fade-in{animation:fadeIn .4s ease forwards}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInR{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.pulse{animation:pulse 2.5s infinite}
.spin{animation:spin .7s linear infinite}
input,select,textarea{outline:none;font-family:'Inter',sans-serif;-webkit-appearance:none;appearance:none}
input:focus,select:focus,textarea:focus{border-color:rgba(123,155,175,0.35)!important;box-shadow:0 0 0 3px rgba(123,155,175,0.06)!important}
.modal-overlay{position:fixed;inset:0;background:rgba(45,42,38,0.50);backdrop-filter:blur(16px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease}
.modal-box{background:#FFFFFF;border:1px solid rgba(45,42,38,0.08);border-radius:22px;width:100%;animation:slideUp .35s ease;max-height:90vh;overflow-y:auto;box-shadow:0 12px 40px rgba(45,42,38,0.08)}
.side-panel{animation:slideInR .3s ease}
.tab-bar{display:flex;gap:4px;background:rgba(45,42,38,0.04);border-radius:14px;padding:4px}
.tab-item{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s ease;color:rgba(45,42,38,0.40);white-space:nowrap}
.tab-item.active{background:#FFFFFF;color:#2D2A26;box-shadow:0 1px 3px rgba(45,42,38,0.06)}
.tab-item:hover:not(.active){color:#2D2A26;background:rgba(45,42,38,0.03)}
.skeleton{background:linear-gradient(90deg,rgba(45,42,38,0.03) 25%,rgba(45,42,38,0.06) 50%,rgba(45,42,38,0.03) 75%);background-size:200% 100%;animation:shimmer 2s ease-in-out infinite;border-radius:10px}
nav::-webkit-scrollbar{width:3px}
nav::-webkit-scrollbar-track{background:transparent}
nav::-webkit-scrollbar-thumb{background:rgba(45,42,38,0.08);border-radius:3px}
nav::-webkit-scrollbar-thumb:hover{background:rgba(45,42,38,0.14)}

═══════════════════════════════════════════
ÉTAPE 3 — PALETTES JS (remplace les objets existants)
═══════════════════════════════════════════

### 3.1 — Remplace l'objet C (lignes ~111-140) par :

const C = {
  bg: "#1C1A17",
  bg1: "#252320",
  bg2: "#2D2B27",
  bg3: "#35332E",
  surface: "rgba(250,247,242,0.04)",
  surfaceHi: "rgba(250,247,242,0.06)",
  border: "rgba(250,247,242,0.08)",
  borderHi: "rgba(250,247,242,0.14)",
  teal: "#9BB8CC",
  tealBg: "rgba(155,184,204,0.08)",
  tealBorder: "rgba(155,184,204,0.20)",
  tealGlow: "rgba(155,184,204,0.08)",
  red: "#D4958A",
  redBg: "rgba(212,149,138,0.08)",
  redBorder: "rgba(212,149,138,0.18)",
  amber: "#D4BA6E",
  amberBg: "rgba(212,186,110,0.08)",
  amberBorder: "rgba(212,186,110,0.20)",
  green: "#9BB8A8",
  greenBg: "rgba(155,184,168,0.08)",
  greenBorder: "rgba(155,184,168,0.20)",
  purple: "#B8A8D4",
  purpleBg: "rgba(184,168,212,0.08)",
  blue: "#8BA8C4",
  blueBg: "rgba(139,168,196,0.07)",
  text: "#E8E4DC",
  muted: "rgba(232,228,220,0.50)",
  faint: "rgba(232,228,220,0.14)"
};

### 3.2 — C_DARK reste inchangé :
const C_DARK = Object.assign({},C);

### 3.3 — Remplace l'objet C_LIGHT (lignes ~143-154) par :

const C_LIGHT = {
  bg: "#FAF7F2",
  bg1: "#FFFFFF",
  bg2: "#F3EFE8",
  bg3: "#ECE7DF",
  surface: "rgba(45,42,38,0.03)",
  surfaceHi: "rgba(45,42,38,0.05)",
  border: "rgba(45,42,38,0.10)",
  borderHi: "rgba(45,42,38,0.16)",
  teal: "#7B9BAF",
  tealBg: "rgba(123,155,175,0.07)",
  tealBorder: "rgba(123,155,175,0.20)",
  tealGlow: "rgba(123,155,175,0.08)",
  red: "#C4796E",
  redBg: "rgba(196,121,110,0.06)",
  redBorder: "rgba(196,121,110,0.18)",
  amber: "#C4A24E",
  amberBg: "rgba(196,162,78,0.06)",
  amberBorder: "rgba(196,162,78,0.18)",
  green: "#7D9B8A",
  greenBg: "rgba(125,155,138,0.06)",
  greenBorder: "rgba(125,155,138,0.18)",
  purple: "#9B8FB8",
  purpleBg: "rgba(155,143,184,0.07)",
  blue: "#6B8FAD",
  blueBg: "rgba(107,143,173,0.07)",
  text: "#2D2A26",
  muted: "rgba(45,42,38,0.50)",
  faint: "rgba(45,42,38,0.14)"
};

### 3.4 — Remplace la fonction handleTheme (ligne ~8005) par :

const handleTheme = t => {
  try{localStorage.setItem("scalyo_theme",t);}catch(e){}
  Object.assign(C, t==="light"?C_LIGHT:C_DARK);
  document.body.style.background = t==="light"?"#FAF7F2":"#1C1A17";
  document.body.style.color = t==="light"?"#2D2A26":"#E8E4DC";
  document.getElementById("root").style.background = t==="light"?"#FAF7F2":"#1C1A17";
  setTheme(t);
};

═══════════════════════════════════════════
ÉTAPE 4 — LOGINSCREEN (⚠️ MÊME FOND BEIGE QUE L'APP)
═══════════════════════════════════════════

La landing page DOIT avoir le MÊME fond beige #FAF7F2 que l'app. PAS de section noire, PAS de header sombre.

### 4.1 — Fond principal (ligne ~835)
REMPLACE le background du div principal de LoginScreen par :
   background: C.bg
(C'est TOUT. Pas de radial-gradient, pas de gradient noir. Juste le fond beige uni.)

### 4.2 — Logo ⚡ (ligne ~853)
   background: `linear-gradient(135deg,${C.teal},${C.blue})`
   boxShadow: `0 2px 8px ${C.tealGlow}`

### 4.3 — Form card (ligne ~896)
   boxShadow: "0 4px 20px rgba(45,42,38,0.06)"
(PAS "0 48px 120px rgba(0,0,0,0.55)" — c'est BEAUCOUP trop fort)

### 4.4 — Bouton submit login (ligne ~1043)
   background: `linear-gradient(135deg,${C.teal},${C.blue})`
   color: "#FFFFFF"     ← BLANC (pas #070D1A !)
   boxShadow: "0 2px 8px rgba(123,155,175,0.14)"

### 4.5 — Bouton submit signup (même style que login)
   background: `linear-gradient(135deg,${C.teal},${C.blue})`
   color: "#FFFFFF"
   boxShadow: "0 2px 8px rgba(123,155,175,0.14)"

### 4.6 — Tous les Spinner avec color: "#070D1A"
   REMPLACE par : color: "#FFFFFF"

═══════════════════════════════════════════
ÉTAPE 5 — OMBRES JS INLINE (dans le reste du fichier)
═══════════════════════════════════════════

Remplace TOUTES les ombres noires par des ombres brun chaud subtiles :

- "0 48px 120px rgba(0,0,0,0.55)" → "0 4px 20px rgba(45,42,38,0.06)"
- "0 10px 36px ${C.tealGlow}" → "0 3px 12px ${C.tealGlow}"
- "0 6px 24px ${C.tealGlow}" → "0 2px 8px ${C.tealGlow}"
- "0 4px 14px rgba(16,185,129,0.3)" → "0 2px 8px rgba(125,155,138,0.14)"
- "1px 0 12px rgba(0,0,0,0.12)" → "1px 0 6px rgba(45,42,38,0.03)"
- "0 1px 4px rgba(0,0,0,0.3)" → "0 1px 3px rgba(45,42,38,0.08)"
- "0 2px 6px rgba(0,0,0,0.25)" → "0 1px 3px rgba(45,42,38,0.08)"
- "0 2px 6px rgba(0,0,0,0.3)" → "0 1px 3px rgba(45,42,38,0.08)"

═══════════════════════════════════════════
ÉTAPE 6 — VÉRIFICATION FINALE
═══════════════════════════════════════════

Avant de retourner le fichier, vérifie avec CTRL+F :

□ #070D1A → 0 occurrence dans tout le fichier
□ #0EA5E9 → 0 occurrence
□ #0C1525 → 0 occurrence
□ #131E35 → 0 occurrence
□ #F0F4F8 → 0 occurrence
□ #1E293B → 0 occurrence
□ DM Sans → 0 occurrence
□ DM Mono → 0 occurrence
□ rgba(7,13,26 → 0 occurrence
□ rgba(18,205,184 → 0 occurrence dans le CSS (peut rester dans C_DARK en JS)

Vérifie aussi :
□ Le fond de la page est beige #FAF7F2 (PAS blanc #FFFFFF, PAS noir)
□ Le LoginScreen a le MÊME fond beige que l'app
□ AUCUNE section n'a un fond noir ou sombre en mode light
□ Tous les textes sont lisibles (charbon #2D2A26 sur beige #FAF7F2)
□ Les boutons ont du texte BLANC #FFFFFF sur gradient bleu poudré
□ AUCUNE couleur néon/cyan/teal vif nulle part
□ Le switch dark/light fonctionne (dark = #1C1A17, light = #FAF7F2)
□ Le sidebar scrolle (overflowY: auto sur la zone nav)
□ Le Kanban est accessible depuis le sidebar

Si tu trouves une seule couleur néon, un seul fond noir en mode light, ou un seul texte illisible → CORRIGE-LE avant de retourner le fichier.

Retourne le fichier COMPLET.
```
