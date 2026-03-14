# PROMPT — Refonte Design "Bibliothèque Zen" v3

> **Mode d'emploi** : Copiez-collez ce prompt dans Claude Chat en joignant votre fichier `index.html` en pièce jointe.

---

```
Tu es un designer/développeur senior spécialisé UX zen et minimaliste. Tu dois transformer le design de cette application Scalyo pour créer une expérience studieuse, apaisante et ultra-lisible — comme travailler dans une belle bibliothèque ancienne baignée de lumière naturelle.

L'inspiration est un croisement entre :
- Le design de Notion (clean, studieux, fonctionnel, grille propre)
- L'ambiance "Nomadic Tribe" (tons parchemin, bleus poudrés, verts sauge, palette terreuse zen)
- La sérénité d'une bibliothèque avec du beau papier, de la lumière chaude, du bois

Tu dois aussi :
1. T'assurer que le KANBAN est bien accessible et fonctionnel (bouton visible dans le sidebar)
2. Rendre le SIDEBAR SCROLLABLE — logo en haut et avatar/settings en bas FIXES, items de navigation au milieu scrollent avec la souris

La landing page (LoginScreen) et l'application doivent partager la MÊME direction artistique.

═══════════════════════════════════════════════════════
RÈGLES NON NÉGOCIABLES
═══════════════════════════════════════════════════════

- Retourne le fichier COMPLET à la fin
- NE MODIFIE AUCUNE logique métier, aucune fonction, aucun appel Supabase/Stripe/Anthropic
- NE SUPPRIME aucun composant ou fonctionnalité
- NE CHANGE PAS les noms de variables JS, fonctions, composants React
- Tu modifies UNIQUEMENT : les couleurs, ombres, gradients, animations, polices, bordures, arrondis, opacités, ET la structure du sidebar (scrollable) et la vérification du Kanban
- Chaque modification doit être cohérente entre mode DARK et mode LIGHT
- Le résultat doit être accessible (contraste WCAG AA) et HYPER LISIBLE

═══════════════════════════════════════════════════════
⚠️ PARTIE 0 — RECHERCHER-REMPLACER GLOBAL (CRITIQUE)
═══════════════════════════════════════════════════════

AVANT de toucher quoi que ce soit d'autre, exécute ces remplacements dans TOUT le fichier.

### 0.1 — TEXTE DES BOUTONS (⚠️ CAUSE D'ILLISIBILITÉ)

`color: "#070D1A"` apparaît **24 fois**. C'est l'ancienne couleur de fond sombre utilisée comme texte de boutons.
**REMPLACE** : `color: "#070D1A"` → `color: "#FFFFFF"` — PARTOUT, les 24 occurrences.
Ce sont tous des textes de boutons sur fond gradient/sombre → doivent être blancs.

Aussi : `Spinner` avec `color: "#070D1A"` → `color: "#FFFFFF"`.

### 0.2 — BLEU NÉON (#0EA5E9 — 22 occurrences)

**REMPLACE** dans les template literals :
`#0EA5E9` → `${C.blue}`

Le but : AUCUN `#0EA5E9` ne reste dans le fichier.

### 0.3 — TEAL NÉON DANS LE CSS (rgba(18,205,184,...) — 18 occurrences)

Dans le `<style>` CSS :
- `rgba(18,205,184,` → `rgba(123,155,175,` (bleu poudré)
- `#12CDB8` → `#7B9BAF` (bleu poudré)

### 0.4 — SURFACES CSS (rgba blanc → rgba noir doux)

Dans le `<style>` CSS :
- `rgba(255,255,255,0.03)` → `rgba(45,42,38,0.03)`
- `rgba(255,255,255,0.04)` → `rgba(45,42,38,0.03)`
- `rgba(255,255,255,0.05)` → `rgba(45,42,38,0.04)`
- `rgba(255,255,255,0.06)` → `rgba(45,42,38,0.05)`
- `rgba(255,255,255,0.08)` → `rgba(45,42,38,0.07)`
- `rgba(255,255,255,0.09)` → `rgba(45,42,38,0.08)`
- `rgba(255,255,255,0.1)` → `rgba(45,42,38,0.08)`
- `rgba(255,255,255,0.18)` → `rgba(45,42,38,0.14)`
- `rgba(232,237,245,0.5)` → `rgba(45,42,38,0.40)`
- `rgba(232,237,245,0.7)` → `rgba(45,42,38,0.50)`
- `rgba(232,237,245,0.75)` → `rgba(45,42,38,0.55)`
- `rgba(232,237,245,0.85)` → `rgba(45,42,38,0.70)`

### 0.5 — MODALS/TABS CSS

- `background:#0C1525` → `background:#FFFFFF`
- `background:#131E35` → `background:#FFFFFF`
- `color:#E8EDF5` → `color:#2D2A26`
- `rgba(7,13,26,0.9)` → `rgba(45,42,38,0.50)`
- `rgba(0,0,0,0.3)` → `rgba(45,42,38,0.06)`
- `rgba(0,0,0,0.25)` → `rgba(45,42,38,0.10)`

### 0.6 — DANGER CSS

- `rgba(240,76,91,0.1)` → `rgba(196,121,110,0.08)`
- `#F04C5B` → `#C4796E`
- `rgba(240,76,91,0.2)` → `rgba(196,121,110,0.18)`
- `rgba(240,76,91,0.18)` → `rgba(196,121,110,0.14)`

### 0.7 — POLICES

- `'DM Sans'` → `'Inter'` (partout CSS + JS)
- `'DM Mono'` → `'JetBrains Mono'` (partout)
- Remplacer le `<link>` Google Fonts par :
  `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>`

### 0.8 — VÉRIFICATION APRÈS REMPLACEMENTS

□ `#070D1A` → 0 occurrence
□ `#0EA5E9` → 0 occurrence
□ `#0C1525` → 0 occurrence
□ `#131E35` → 0 occurrence
□ `#F04C5B` → 0 occurrence dans le CSS
□ `DM Sans` → 0 occurrence
□ `DM Mono` → 0 occurrence

═══════════════════════════════════════════════════════
PARTIE 1 — PHILOSOPHIE "BIBLIOTHÈQUE ZEN"
═══════════════════════════════════════════════════════

L'objectif est de créer un environnement visuel qui évoque :
- La chaleur d'une bibliothèque universitaire ancienne, baignée de lumière naturelle
- Le toucher d'un beau papier épais couleur parchemin
- Le calme studieux — on se concentre, on apprend, on travaille sereinement
- La propreté fonctionnelle de Notion — tout est à sa place
- Des accents doux comme des signets en tissu (bleu poudré, vert sauge, terre cuite)

Principes :
1. FOND PARCHEMIN — #FAF7F2, comme du vieux papier chaud (PAS blanc pur, PAS gris froid)
2. TEXTE CHARBON CHAUD — #2D2A26, doux pour les yeux mais très lisible (PAS noir pur #000)
3. ACCENT BLEU POUDRÉ — #7B9BAF, comme un ciel d'hiver doux ou un cristal de quartz
4. COULEURS TERREUSES — Vert sauge, terre cuite, ambre sable, lavande — toutes désaturées
5. OMBRES CHAUDES — Teintées brun, ultra-diffuses, jamais noires
6. ARRONDIS DOUX — 12px à 20px, naturels pas géométriques
7. ESPACEMENT AÉRÉ — Comme les marges généreuses d'un beau livre
8. TRANSITIONS LENTES — 0.3s ease, comme tourner une page
9. HYPER LISIBLE — Contraste suffisant WCAG AA, taille de police 13px minimum, line-height 1.5+
10. ZÉRO NÉON — Aucune couleur fluo, tout est mat et poudré

═══════════════════════════════════════════════════════
PARTIE 2 — NOUVELLE PALETTE DE COULEURS
═══════════════════════════════════════════════════════

### Mode Clair (C_LIGHT) — THÈME PRINCIPAL PAR DÉFAUT

Remplace l'objet C_LIGHT existant :

```js
const C_LIGHT = {
  bg: "#FAF7F2",              // Fond : parchemin chaud (comme du vieux papier)
  bg1: "#FFFFFF",             // Cartes : blanc cassé
  bg2: "#F3EFE8",             // Fond secondaire : lin clair
  bg3: "#ECE7DF",             // Fond tertiaire : sable doux
  surface: "rgba(45,42,38,0.03)",
  surfaceHi: "rgba(45,42,38,0.05)",
  border: "rgba(45,42,38,0.10)",        // Bordures : brun chaud ultra-subtil
  borderHi: "rgba(45,42,38,0.16)",
  teal: "#7B9BAF",            // ★ Accent principal : bleu poudré (cristal/ciel d'hiver)
  tealBg: "rgba(123,155,175,0.08)",
  tealBorder: "rgba(123,155,175,0.22)",
  tealGlow: "rgba(123,155,175,0.10)",
  red: "#C4796E",             // Alerte : terre cuite douce
  redBg: "rgba(196,121,110,0.07)",
  redBorder: "rgba(196,121,110,0.20)",
  amber: "#C4A24E",           // Vigilance : ambre sable
  amberBg: "rgba(196,162,78,0.07)",
  amberBorder: "rgba(196,162,78,0.20)",
  green: "#7D9B8A",           // Succès : vert sauge
  greenBg: "rgba(125,155,138,0.07)",
  greenBorder: "rgba(125,155,138,0.20)",
  purple: "#9B8FB8",          // Accent 2 : lavande poudrée
  purpleBg: "rgba(155,143,184,0.07)",
  blue: "#6B8FAD",            // Accent 3 : bleu ardoise
  blueBg: "rgba(107,143,173,0.07)",
  text: "#2D2A26",            // Texte : charbon chaud (PAS noir pur)
  muted: "rgba(45,42,38,0.50)",         // Texte secondaire
  faint: "rgba(45,42,38,0.14)"          // Texte tertiaire
};
```

### Mode Sombre (C / C_DARK) — Thème nuit studieuse

Remplace l'objet C existant :

```js
const C = {
  bg: "#1C1A17",              // Fond : brun très sombre (PAS noir, PAS bleu marine)
  bg1: "#252320",             // Cartes : brun chaud sombre
  bg2: "#2D2B27",             // Fond secondaire
  bg3: "#35332E",             // Fond tertiaire
  surface: "rgba(250,247,242,0.04)",
  surfaceHi: "rgba(250,247,242,0.06)",
  border: "rgba(250,247,242,0.08)",
  borderHi: "rgba(250,247,242,0.14)",
  teal: "#9BB8CC",            // Accent : bleu poudré clair
  tealBg: "rgba(155,184,204,0.08)",
  tealBorder: "rgba(155,184,204,0.22)",
  tealGlow: "rgba(155,184,204,0.08)",
  red: "#D4958A",             // Alerte : terre cuite claire
  redBg: "rgba(212,149,138,0.08)",
  redBorder: "rgba(212,149,138,0.18)",
  amber: "#D4BA6E",           // Vigilance : ambre clair
  amberBg: "rgba(212,186,110,0.08)",
  amberBorder: "rgba(212,186,110,0.20)",
  green: "#9BB8A8",           // Succès : vert sauge clair
  greenBg: "rgba(155,184,168,0.08)",
  greenBorder: "rgba(155,184,168,0.20)",
  purple: "#B8A8D4",          // Accent 2 : lavande claire
  purpleBg: "rgba(184,168,212,0.08)",
  blue: "#8BA8C4",            // Accent 3 : bleu ardoise clair
  blueBg: "rgba(139,168,196,0.07)",
  text: "#E8E4DC",            // Texte : crème parcheminé
  muted: "rgba(232,228,220,0.50)",
  faint: "rgba(232,228,220,0.14)"
};
```

Ensuite `const C_DARK = Object.assign({},C);` reste inchangé.

═══════════════════════════════════════════════════════
PARTIE 3 — CSS COMPLET (remplace TOUT le <style>)
═══════════════════════════════════════════════════════

Remplace TOUT le contenu de la balise `<style>` (lignes ~18 à ~85) par ceci :

```css
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#FAF7F2;font-family:'Inter',sans-serif;color:#2D2A26;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(45,42,38,0.12);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(45,42,38,0.22)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .3s ease;letter-spacing:-.2px}
.btn-primary{background:linear-gradient(135deg,#7B9BAF,#6B8FAD);color:#fff;box-shadow:0 2px 10px rgba(123,155,175,0.18)}
.btn-primary:hover{transform:translateY(-0.5px);box-shadow:0 4px 18px rgba(123,155,175,0.24)}
.btn-secondary{background:rgba(45,42,38,0.04);color:rgba(45,42,38,0.70);border:1px solid rgba(45,42,38,0.10)}
.btn-secondary:hover{background:rgba(45,42,38,0.07);border-color:rgba(45,42,38,0.16)}
.btn-danger{background:rgba(196,121,110,0.08);color:#C4796E;border:1px solid rgba(196,121,110,0.18)}
.btn-danger:hover{background:rgba(196,121,110,0.14)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:10px}
.csm-filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;padding:0 2px}
.csm-chip{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(45,42,38,0.10);background:rgba(45,42,38,0.03);color:rgba(45,42,38,0.55);transition:all .25s ease}
.csm-chip:hover{background:rgba(123,155,175,0.08);border-color:rgba(123,155,175,0.22);color:#7B9BAF}
.csm-chip.active{background:rgba(123,155,175,0.10);border-color:rgba(123,155,175,0.30);color:#7B9BAF;font-weight:700}
.chat-input{flex:1;background:rgba(45,42,38,0.03);border:1px solid rgba(45,42,38,0.10);border-radius:14px;padding:12px 16px;color:#2D2A26;font-size:13px;font-family:inherit;resize:none}
.chat-input:focus{outline:none;border-color:rgba(123,155,175,0.40);background:#FFFFFF}
.chat-send-btn{background:linear-gradient(135deg,#7B9BAF,#6B8FAD);border:none;border-radius:14px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;box-shadow:0 2px 10px rgba(123,155,175,0.16);transition:all .3s ease;flex-shrink:0}
.chat-send-btn:hover{transform:scale(1.03);box-shadow:0 4px 18px rgba(123,155,175,0.22)}
.chat-send-btn:disabled{opacity:.35;transform:none;cursor:not-allowed}
.api-banner{padding:14px 18px;background:rgba(196,162,78,0.06);border:1px solid rgba(196,162,78,0.18);border-radius:14px;margin:12px 18px;display:flex;gap:12px;font-size:13px;align-items:flex-start}
.tip-card{background:rgba(45,42,38,0.02);border:1px solid rgba(45,42,38,0.07);border-radius:16px;padding:16px 18px;margin-bottom:8px;cursor:pointer;transition:all .3s ease}
.tip-card:hover{background:rgba(123,155,175,0.04);border-color:rgba(123,155,175,0.18)}
.tip-card.open{border-color:rgba(123,155,175,0.25);background:rgba(123,155,175,0.04)}
.quick-chip{padding:7px 14px;border-radius:20px;font-size:12px;cursor:pointer;background:rgba(45,42,38,0.03);border:1px solid rgba(45,42,38,0.10);color:rgba(45,42,38,0.55);transition:all .25s ease;font-weight:500}
.quick-chip:hover{background:rgba(123,155,175,0.08);border-color:rgba(123,155,175,0.22);color:#7B9BAF}
.toggle-switch{position:relative;width:46px;height:26px;display:inline-block;flex-shrink:0}
.toggle-switch input{display:none}
.toggle-slider{position:absolute;inset:0;border-radius:26px;background:rgba(45,42,38,0.12);cursor:pointer;transition:.3s}
.toggle-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 4px rgba(45,42,38,0.15)}
input:checked+.toggle-slider{background:#7B9BAF}
input:checked+.toggle-slider::before{transform:translateX(20px)}
.nav-btn{transition:all .25s ease;border-radius:12px;cursor:pointer}
.nav-btn:hover{background:rgba(45,42,38,0.04)!important}
.row-item{transition:background .2s ease;cursor:pointer}
.row-item:hover{background:rgba(123,155,175,0.04)!important}
.card-lift{transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}
.card-lift:hover{transform:translateY(-1px);border-color:rgba(123,155,175,0.18)!important;box-shadow:0 4px 18px rgba(45,42,38,0.06)}
.btn-base{transition:all .3s ease;cursor:pointer;border:none;font-family:'Inter',sans-serif;font-weight:600;outline:none}
.btn-base:hover:not(:disabled){transform:translateY(-0.5px);filter:brightness(1.04)}
.btn-base:active:not(:disabled){transform:translateY(0);filter:brightness(0.96)}
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
input:focus,select:focus,textarea:focus{border-color:rgba(123,155,175,0.45)!important;box-shadow:0 0 0 3px rgba(123,155,175,0.08)!important}
.modal-overlay{position:fixed;inset:0;background:rgba(45,42,38,0.50);backdrop-filter:blur(16px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease}
.modal-box{background:#FFFFFF;border:1px solid rgba(45,42,38,0.08);border-radius:22px;width:100%;animation:slideUp .35s ease;max-height:90vh;overflow-y:auto;box-shadow:0 16px 48px rgba(45,42,38,0.10)}
.side-panel{animation:slideInR .3s ease}
.tab-bar{display:flex;gap:4px;background:rgba(45,42,38,0.04);border-radius:14px;padding:4px}
.tab-item{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s ease;color:rgba(45,42,38,0.40);white-space:nowrap}
.tab-item.active{background:#FFFFFF;color:#2D2A26;box-shadow:0 1px 4px rgba(45,42,38,0.08)}
.tab-item:hover:not(.active){color:#2D2A26;background:rgba(45,42,38,0.04)}
.skeleton{background:linear-gradient(90deg,rgba(45,42,38,0.03) 25%,rgba(45,42,38,0.06) 50%,rgba(45,42,38,0.03) 75%);background-size:200% 100%;animation:shimmer 2s ease-in-out infinite;border-radius:10px}
nav::-webkit-scrollbar{width:3px}
nav::-webkit-scrollbar-track{background:transparent}
nav::-webkit-scrollbar-thumb{background:rgba(45,42,38,0.10);border-radius:3px}
nav::-webkit-scrollbar-thumb:hover{background:rgba(45,42,38,0.18)}
```

═══════════════════════════════════════════════════════
PARTIE 4 — GRADIENTS JS (dans le JavaScript)
═══════════════════════════════════════════════════════

### 4.1 — Gradient principal — TOUTES les occurrences
- `linear-gradient(135deg,#12CDB8,#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.blue})`
- `linear-gradient(135deg,${C.teal},#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.blue})`

En mode clair ça donne : bleu poudré → bleu ardoise (doux et zen)

### 4.2 — Gradient vert
- `linear-gradient(135deg,#10B981,#059669)` → `linear-gradient(135deg,${C.green},#6A8F7C)`

### 4.3 — Radial gradient LoginScreen
AVANT : `radial-gradient(ellipse 80% 55% at 50% -8%,rgba(18,205,184,0.13) 0%,transparent 62%)`
APRÈS : `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(123,155,175,0.06) 0%,transparent 60%)`
(Lueur bleu poudré très subtile en haut)

═══════════════════════════════════════════════════════
PARTIE 5 — OMBRES CHAUDES ET DIFFUSES (JS inline)
═══════════════════════════════════════════════════════

1. Logo : `0 10px 36px ${C.tealGlow}` → `0 4px 14px ${C.tealGlow}`
2. Logo LoginScreen : `0 4px 16px ${C.tealGlow}` → `0 2px 10px ${C.tealGlow}`
3. Form card : `0 48px 120px rgba(0,0,0,0.55)` → `0 6px 28px rgba(45,42,38,0.08)`
4. Sidebar : `1px 0 12px rgba(0,0,0,0.12)` → `1px 0 8px rgba(45,42,38,0.04)`
5. Card glow : `0 0 24px ${C.tealGlow}` → `0 0 14px ${C.tealGlow}`
6. HealthBar : `0 0 8px ${c}44` → `0 0 6px ${c}22`
7. Boutons inline : `0 6px 24px ${C.tealGlow}` → `0 2px 10px ${C.tealGlow}`
8. Bouton submit : `0 6px 24px ${C.tealGlow}` → `0 2px 10px rgba(123,155,175,0.16)`

═══════════════════════════════════════════════════════
PARTIE 6 — handleTheme
═══════════════════════════════════════════════════════

```js
const handleTheme = t => {
  try{localStorage.setItem("scalyo_theme",t);}catch(e){}
  Object.assign(C, t==="light"?C_LIGHT:C_DARK);
  document.body.style.background = t==="light"?"#FAF7F2":"#1C1A17";
  document.body.style.color = t==="light"?"#2D2A26":"#E8E4DC";
  document.getElementById("root").style.background = t==="light"?"#FAF7F2":"#1C1A17";
  setTheme(t);
};
```

IMPORTANT :
- `useState("dark")` → `useState("light")`
- Si localStorage retourne null → "light"

═══════════════════════════════════════════════════════
PARTIE 7 — LANDING PAGE (LoginScreen)
═══════════════════════════════════════════════════════

### 7.1 — Fond
```js
background: `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(123,155,175,0.06) 0%,transparent 60%),${C.bg}`
```
= Parchemin chaud + lueur bleu poudré quasi-invisible en haut

### 7.2 — Logo ⚡
```js
background: `linear-gradient(135deg,${C.teal},${C.blue})`,
borderRadius: 14,
boxShadow: `0 2px 10px ${C.tealGlow}`
```

### 7.3 — Titre "scalyo"
```js
color: C.text    // #2D2A26 en light (charbon chaud, LISIBLE)
```
Le "yo" en `C.teal` (bleu poudré)

### 7.4 — Tagline sous le titre
```js
color: C.muted   // rgba(45,42,38,0.50) — gris chaud LISIBLE sur parchemin
```

### 7.5 — Sélecteur de langue
```js
background: lang === l ? C.tealBg : C.surface,
border: `1px solid ${lang === l ? C.tealBorder : C.border}`,
color: lang === l ? C.teal : C.muted
```

### 7.6 — Form card
```js
background: C.bg1,                    // blanc en light
border: `1px solid ${C.border}`,      // bordure sable subtile
borderRadius: 22,
boxShadow: "0 6px 28px rgba(45,42,38,0.08)",
padding: 36
```

### 7.7 — Tabs (Connexion / Créer un compte)
Les `.tab-bar` et `.tab-item` CSS s'appliquent automatiquement.

### 7.8 — Titres dans la card ("Bon retour 👋")
```js
color: C.text,    // #2D2A26 — LISIBLE
fontSize: 20,
fontWeight: 800
```

### 7.9 — Sous-titres ("Accédez à votre espace Scalyo")
```js
color: C.muted,   // gris chaud LISIBLE
fontSize: 13
```

### 7.10 — Labels des inputs
```js
color: C.muted,
fontSize: 11,
fontWeight: 700,
textTransform: "uppercase"
```

### 7.11 — Inputs
```js
background: C.surface,          // rgba(45,42,38,0.03) — fond lin très clair
border: `1px solid ${C.border}`, // rgba(45,42,38,0.10) — bordure visible
color: C.text,                   // #2D2A26 — texte LISIBLE
borderRadius: 12,
padding: "11px 14px",
fontSize: 14
```

### 7.12 — Bouton submit
```js
background: `linear-gradient(135deg,${C.teal},${C.blue})`,
color: "#FFFFFF",           // ⚠️ BLANC !! PAS #070D1A !!
borderRadius: 12,
boxShadow: "0 2px 10px rgba(123,155,175,0.16)",
fontSize: 15,
fontWeight: 700,
padding: "14px"
```

### 7.13 — Sélecteur de rôle (Manager / CSM)
```js
background: role === v ? C.tealBg : C.surface,
border: `1px solid ${role === v ? C.tealBorder : C.border}`,
color: role === v ? C.teal : C.muted
```

### 7.14 — Messages d'erreur
```js
background: C.redBg,
border: `1px solid ${C.redBorder}`,
color: C.red    // #C4796E — terre cuite LISIBLE sur fond blanc/parchemin
```

### 7.15 — Footer
```js
color: C.muted    // gris chaud LISIBLE
```

═══════════════════════════════════════════════════════
PARTIE 8 — SIDEBAR SCROLLABLE
═══════════════════════════════════════════════════════

Structure en 3 zones :

```
sidebar (flex column, height 100%, overflow: "hidden")
├── zone-haute (flexShrink: 0) → Logo ⚡ + "scalyo"
├── zone-milieu (flex: 1, overflowY: "auto", overflowX: "hidden") → <nav> items
└── zone-basse (flexShrink: 0, borderTop) → Settings + Avatar + Logout
```

VÉRIFIE :
1. `<nav>` a `overflowY: "auto"` et `overflowX: "hidden"`
2. Container sidebar a `overflow: "hidden"`
3. Logo NE scrolle PAS
4. Settings/avatar NE scrollent PAS
5. Items nav scrollent avec la molette

### Sidebar background
```js
background: C.bg1,   // blanc en light (contraste doux avec le parchemin)
boxShadow: "1px 0 8px rgba(45,42,38,0.04)"
```

═══════════════════════════════════════════════════════
PARTIE 9 — KANBAN FONCTIONNEL
═══════════════════════════════════════════════════════

VÉRIFIE ET CORRIGE :

### 9.1 — Navigation
- Item "Kanban" 📋 dans NAV_MANAGER et NAV_CSM
- Clic → setScreenPersist("kanban")
- renderView() → case "kanban" → KanbanView

### 9.2 — Boutons visibles
- Bouton "+" dans chaque colonne : fond C.tealBg, texte C.teal, border C.tealBorder
- Formulaire d'ajout fonctionnel
- Bouton "Enregistrer" visible

### 9.3 — Style Bibliothèque Zen
- Colonne "À faire" → accent C.blue (bleu ardoise)
- Colonne "En cours" → accent C.amber (ambre sable)
- Colonne "Terminé" → accent C.green (vert sauge)
- Cartes : fond C.bg1 (blanc), bordure C.border, border-radius 14px
- Badges priorité : Haute = C.red (terre cuite), Moyenne = C.amber (ambre), Basse = C.green (sauge)
- ⚠️ Texte boutons Kanban : AUCUN `color: "#070D1A"` → tout en `color: "#FFFFFF"`

═══════════════════════════════════════════════════════
PARTIE 10 — VÉRIFICATION FINALE
═══════════════════════════════════════════════════════

### A. Zéro couleur morte
□ `#070D1A` → 0 occurrence dans TOUT le fichier
□ `#0EA5E9` → 0 occurrence
□ `#0C1525` → 0 occurrence
□ `#131E35` → 0 occurrence
□ `#12CDB8` → 0 occurrence dans le CSS
□ `DM Sans` → 0 occurrence
□ `DM Mono` → 0 occurrence

### B. LISIBILITÉ (le plus important !)
□ Texte principal #2D2A26 sur fond parchemin #FAF7F2 → ratio ~12:1 ✅
□ Texte muted rgba(45,42,38,0.50) sur #FAF7F2 → ratio ~5:1 ✅
□ Accent #7B9BAF sur #FAF7F2 → ratio ~3.5:1 ✅ (éléments UI)
□ Texte boutons : #FFFFFF sur gradient bleu → ratio ~5:1 ✅
□ Erreurs #C4796E sur blanc → ratio ~3.5:1 ✅ (+ icône)
□ TOUT est lisible sans plisser les yeux

### C. Ambiance Bibliothèque Zen
□ Fond parchemin chaud #FAF7F2 (PAS blanc pur, PAS gris froid)
□ Accents bleu poudré + vert sauge + terre cuite (PAS néon)
□ Ombres chaudes teintées brun (PAS noires)
□ Arrondis doux 12-20px
□ Animations lentes 0.3s+

### D. Landing page
□ Fond parchemin + lueur bleu subtile
□ Card formulaire : blanc, bordure sable, ombre douce
□ Bouton : gradient bleu poudré, texte BLANC
□ Tout est LISIBLE
□ Même D.A. que l'app

### E. Sidebar scrollable
□ Logo fixe en haut
□ Nav scrolle au milieu
□ Settings/avatar fixes en bas

### F. Kanban
□ Accessible depuis le sidebar
□ Boutons "+" visibles
□ Cartes lisibles

### G. Anti-régression
□ Login/Signup fonctionnels
□ Toutes les vues fonctionnelles
□ Thème switch fonctionne (parchemin ↔ brun sombre)
□ I18N fr/en/kr intact
□ Aucun appel Supabase/Stripe/Anthropic modifié

### H. Rapport

| Élément | Statut |
|---------|--------|
| #070D1A éradiqué (24 occ.) | ✅/❌ |
| #0EA5E9 éradiqué (22 occ.) | ✅/❌ |
| CSS remplacé complet | ✅/❌ |
| Palette parchemin C_LIGHT | ✅/❌ |
| Palette brun C_DARK | ✅/❌ |
| Police Inter | ✅/❌ |
| LoginScreen LISIBLE | ✅/❌ |
| Ambiance zen studieuse | ✅/❌ |
| Sidebar scrollable | ✅/❌ |
| Kanban fonctionnel | ✅/❌ |
| handleTheme MAJ | ✅/❌ |
| Anti-régression | ✅/❌ |

Verdict : 🟢 ZEN & READY / 🟠 PRESQUE / 🔴 PAS BON

Retourne-moi le fichier COMPLET.
```
