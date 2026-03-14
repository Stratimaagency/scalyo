# PROMPT — Refonte "Bibliothèque Zen" v4 — PRODUCTION READY

> **Mode d'emploi** : Copiez-collez ce prompt dans Claude Chat en joignant votre fichier `index.html` en pièce jointe. Le résultat doit être prêt pour la production.

---

```
Tu es un designer/développeur senior spécialisé UX zen et minimaliste. Tu dois transformer le design de cette application Scalyo pour créer une expérience studieuse, apaisante et ultra-lisible — comme travailler dans une belle bibliothèque ancienne baignée de lumière naturelle.

L'inspiration est un croisement entre :
- Le design de Notion (clean, studieux, fonctionnel, grille propre)
- L'ambiance "Nomadic Tribe" (tons parchemin, bleus poudrés, verts sauge, palette terreuse zen)
- La sérénité d'une bibliothèque avec du beau papier, de la lumière chaude, du bois

IMPORTANT :
- La landing page (LoginScreen) et l'application DOIVENT avoir la MÊME direction artistique exacte
- Le résultat doit être PRÊT POUR LA PRODUCTION — zéro bug visuel, zéro texte illisible
- Tu dois aussi t'assurer que le KANBAN fonctionne et que le SIDEBAR scrolle correctement

═══════════════════════════════════════════════════════
RÈGLES NON NÉGOCIABLES
═══════════════════════════════════════════════════════

- Retourne le fichier COMPLET à la fin — pas d'extrait, le fichier ENTIER
- NE MODIFIE AUCUNE logique métier, aucune fonction, aucun appel Supabase/Stripe/Anthropic
- NE SUPPRIME aucun composant ou fonctionnalité
- NE CHANGE PAS les noms de variables JS, fonctions, composants React
- NE CHANGE PAS les IDs de navigation (dashboard, portfolio, kanban, roadmap, etc.)
- Tu modifies UNIQUEMENT : les couleurs, ombres, gradients, animations, polices, bordures, arrondis, opacités
- Chaque modification doit être cohérente entre mode DARK et mode LIGHT
- Le résultat doit être accessible (contraste WCAG AA) et HYPER LISIBLE
- AUCUN texte ne doit être invisible ou difficile à lire

═══════════════════════════════════════════════════════
⚠️⚠️⚠️ PARTIE 0 — RECHERCHER-REMPLACER GLOBAL ⚠️⚠️⚠️
(EXÉCUTE CES REMPLACEMENTS EN PREMIER, AVANT TOUT)
═══════════════════════════════════════════════════════

### 0.1 — TEXTE DES BOUTONS (⚠️ LE PLUS CRITIQUE)

`color: "#070D1A"` apparaît **24 fois** dans le fichier.
C'est l'ancienne couleur de fond sombre (#070D1A) utilisée comme couleur de texte sur les boutons gradient.
Maintenant que les gradients utilisent des couleurs poudrées, le texte doit être BLANC pour rester lisible.

CHERCHE : `color: "#070D1A"`
REMPLACE PAR : `color: "#FFFFFF"`
NOMBRE ATTENDU : **24 occurrences** — remplace-les TOUTES.

Cela inclut :
- Tous les boutons submit/action avec gradient (login, signup, sauvegarde, etc.)
- Tous les Spinner avec color: "#070D1A"
- Lignes concernées : 539, 1044, 1056, 1183, 1195, 1313, 1868, 2024, 2035, 2661, 2744, 2826, 3001, 3012, 3391, 3981, 4118, 6010, 7061, 7253, 7263, 7323, 7404, 7443

### 0.2 — BLEU NÉON HARDCODÉ (#0EA5E9 — 22 occurrences)

CHERCHE dans TOUT le fichier : `#0EA5E9`
REMPLACE PAR : `${C.blue}` (dans les template literals avec backticks)
Si c'est dans une string normale entre guillemets, utilise le mécanisme approprié.

Les 22 occurrences sont :
- 3x dans le CSS (btn-primary, chat-send-btn, toggle checked)
- 19x dans le JS inline (gradients de boutons, logo, sidebar logo)

Le but : **ZÉRO** `#0EA5E9` dans le fichier final.

### 0.3 — TEAL NÉON DANS LE CSS (#12CDB8 et rgba(18,205,184,...))

Dans la section `<style>` CSS (lignes ~18-85) :
- `#12CDB8` → `#7B9BAF` (bleu poudré)
- `rgba(18,205,184,0.3)` → `rgba(123,155,175,0.18)`
- `rgba(18,205,184,0.4)` → `rgba(123,155,175,0.24)`
- `rgba(18,205,184,0.28)` → `rgba(123,155,175,0.16)`
- `rgba(18,205,184,0.42)` → `rgba(123,155,175,0.22)`
- `rgba(18,205,184,0.1)` → `rgba(123,155,175,0.08)`
- `rgba(18,205,184,0.14)` → `rgba(123,155,175,0.10)`
- `rgba(18,205,184,0.25)` → `rgba(123,155,175,0.16)`
- `rgba(18,205,184,0.04)` → `rgba(123,155,175,0.04)`
- `rgba(18,205,184,0.05)` → `rgba(123,155,175,0.04)`
- `rgba(18,205,184,0.06)` → `rgba(123,155,175,0.05)`
- `rgba(18,205,184,0.08)` → `rgba(123,155,175,0.06)`
- `rgba(18,205,184,0.2)` → `rgba(123,155,175,0.14)`
- `rgba(18,205,184,0.35)` → `rgba(123,155,175,0.25)`
- `rgba(18,205,184,0.5)` → `rgba(123,155,175,0.35)`
- `rgba(18,205,184,0.13)` → `rgba(123,155,175,0.06)` (radial gradient LoginScreen)

### 0.4 — SURFACES ET BORDURES CSS (rgba blanc → rgba brun chaud)

Dans la section `<style>` CSS :
- `rgba(255,255,255,0.03)` → `rgba(45,42,38,0.03)`
- `rgba(255,255,255,0.04)` → `rgba(45,42,38,0.03)`
- `rgba(255,255,255,0.05)` → `rgba(45,42,38,0.04)`
- `rgba(255,255,255,0.06)` → `rgba(45,42,38,0.05)`
- `rgba(255,255,255,0.07)` → `rgba(45,42,38,0.05)`
- `rgba(255,255,255,0.08)` → `rgba(45,42,38,0.07)`
- `rgba(255,255,255,0.09)` → `rgba(45,42,38,0.08)`
- `rgba(255,255,255,0.1)` → `rgba(45,42,38,0.08)`
- `rgba(255,255,255,0.15)` → `rgba(45,42,38,0.12)`
- `rgba(255,255,255,0.18)` → `rgba(45,42,38,0.14)`

### 0.5 — TEXTES SECONDAIRES CSS

- `rgba(232,237,245,0.5)` → `rgba(45,42,38,0.40)` (tab-item text)
- `rgba(232,237,245,0.7)` → `rgba(45,42,38,0.50)` (chip text)
- `rgba(232,237,245,0.75)` → `rgba(45,42,38,0.55)` (quick-chip text)
- `rgba(232,237,245,0.85)` → `rgba(45,42,38,0.70)` (btn-secondary text)

### 0.6 — FONDS SOMBRES CSS

- `background:#070D1A` → `background:#FAF7F2` (body)
- `color:#E8EDF5` → `color:#2D2A26` (body text)
- `background:#0C1525` → `background:#FFFFFF` (modal-box)
- `background:#131E35` → `background:#FFFFFF` (tab-item.active)
- `color:#E8EDF5` → `color:#2D2A26` (tab-item.active text — SI PRESENT)
- `rgba(7,13,26,0.9)` → `rgba(45,42,38,0.50)` (modal overlay)
- `rgba(7,13,26,0.6)` → `rgba(45,42,38,0.40)` (autre overlay)

### 0.7 — DANGER/ROUGE CSS

- `#F04C5B` → `#C4796E` (terre cuite douce)
- `rgba(240,76,91,0.1)` → `rgba(196,121,110,0.08)`
- `rgba(240,76,91,0.07)` → `rgba(196,121,110,0.06)`
- `rgba(240,76,91,0.06)` → `rgba(196,121,110,0.05)`
- `rgba(240,76,91,0.2)` → `rgba(196,121,110,0.18)`
- `rgba(240,76,91,0.18)` → `rgba(196,121,110,0.14)`
- `rgba(240,76,91,0.22)` → `rgba(196,121,110,0.18)`

### 0.8 — OMBRES

- `rgba(0,0,0,0.55)` → `rgba(45,42,38,0.08)` (LoginScreen card shadow)
- `rgba(0,0,0,0.3)` → `rgba(45,42,38,0.06)` (tab shadow, generic)
- `rgba(0,0,0,0.25)` → `rgba(45,42,38,0.10)` (toggle shadow)
- `rgba(0,0,0,0.12)` → `rgba(45,42,38,0.04)` (sidebar shadow)
- `rgba(0,0,0,0.18)` → `rgba(45,42,38,0.08)` (generic shadow)
- `rgba(0,0,0,0.09)` → `rgba(45,42,38,0.07)` (light theme border)

### 0.9 — GRADIENTS VERTS HARDCODÉS

- `#10B981` → `${C.green}` (4 occurrences — gradient start)
- `#059669` → `#6A8F7C` (5 occurrences — gradient end, vert sauge sombre)

### 0.10 — POLICES (20 occurrences total)

- `'DM Sans'` → `'Inter'` (**3 occurrences** — CSS body, btn-base, inputs)
- `'DM Mono'` → `'JetBrains Mono'` (**17 occurrences** — tout le code monospace)

Remplacer AUSSI le `<link>` Google Fonts (ligne ~9) :
AVANT : `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@...&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>`
APRÈS : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>`

### 0.11 — handleTheme (ligne ~8005-8012)

REMPLACE la fonction handleTheme par :
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

### 0.12 — THÈME PAR DÉFAUT

CHERCHE (ligne ~7882) : `localStorage.getItem("scalyo_theme")||"dark"`
REMPLACE PAR : `localStorage.getItem("scalyo_theme")||"light"`

CHERCHE aussi le catch : `return "dark"`
REMPLACE PAR : `return "light"`

### 0.13 — VÉRIFICATION FINALE DES REMPLACEMENTS

Fais CTRL+F dans le fichier terminé pour confirmer :
□ `#070D1A` → **0 occurrence** (ZÉRO dans tout le fichier)
□ `#0EA5E9` → **0 occurrence**
□ `#0C1525` → **0 occurrence**
□ `#131E35` → **0 occurrence**
□ `#F04C5B` → **0 occurrence** dans le CSS
□ `#12CDB8` → **0 occurrence** dans le CSS (peut rester dans C_DARK JS)
□ `DM Sans` → **0 occurrence**
□ `DM Mono` → **0 occurrence**
□ `#F0F4F8` → **0 occurrence** (ancien bg light)
□ `#1E293B` → **0 occurrence** (ancien text light)

═══════════════════════════════════════════════════════
PARTIE 1 — PHILOSOPHIE "BIBLIOTHÈQUE ZEN"
═══════════════════════════════════════════════════════

Principes visuels :
1. FOND PARCHEMIN — #FAF7F2, chaud comme du vieux papier (PAS blanc pur, PAS gris)
2. TEXTE CHARBON CHAUD — #2D2A26, doux mais très lisible (PAS noir pur #000)
3. ACCENT BLEU POUDRÉ — #7B9BAF, comme un ciel d'hiver doux
4. COULEURS TERREUSES — Vert sauge, terre cuite, ambre sable, lavande — toutes désaturées
5. OMBRES CHAUDES — Teintées brun rgba(45,42,38,...), ultra-diffuses, jamais noires
6. ARRONDIS DOUX — 12px à 20px
7. ESPACEMENT AÉRÉ — Marges généreuses comme un beau livre
8. TRANSITIONS LENTES — 0.3s ease
9. HYPER LISIBLE — Contraste WCAG AA minimum, police 13px min
10. ZÉRO NÉON — Tout est mat et poudré

═══════════════════════════════════════════════════════
PARTIE 2 — PALETTE DE COULEURS
═══════════════════════════════════════════════════════

### Mode Clair (C_LIGHT) — Remplace l'objet C_LIGHT existant

```js
const C_LIGHT = {
  bg: "#FAF7F2",              // Parchemin chaud
  bg1: "#FFFFFF",             // Cartes : blanc cassé
  bg2: "#F3EFE8",             // Lin clair
  bg3: "#ECE7DF",             // Sable doux
  surface: "rgba(45,42,38,0.03)",
  surfaceHi: "rgba(45,42,38,0.05)",
  border: "rgba(45,42,38,0.10)",
  borderHi: "rgba(45,42,38,0.16)",
  teal: "#7B9BAF",            // Bleu poudré
  tealBg: "rgba(123,155,175,0.08)",
  tealBorder: "rgba(123,155,175,0.22)",
  tealGlow: "rgba(123,155,175,0.10)",
  red: "#C4796E",             // Terre cuite
  redBg: "rgba(196,121,110,0.07)",
  redBorder: "rgba(196,121,110,0.20)",
  amber: "#C4A24E",           // Ambre sable
  amberBg: "rgba(196,162,78,0.07)",
  amberBorder: "rgba(196,162,78,0.20)",
  green: "#7D9B8A",           // Vert sauge
  greenBg: "rgba(125,155,138,0.07)",
  greenBorder: "rgba(125,155,138,0.20)",
  purple: "#9B8FB8",          // Lavande poudrée
  purpleBg: "rgba(155,143,184,0.07)",
  blue: "#6B8FAD",            // Bleu ardoise
  blueBg: "rgba(107,143,173,0.07)",
  text: "#2D2A26",            // Charbon chaud
  muted: "rgba(45,42,38,0.50)",
  faint: "rgba(45,42,38,0.14)"
};
```

### Mode Sombre (C / C_DARK) — Remplace l'objet C existant (lignes ~111-140)

```js
const C = {
  bg: "#1C1A17",              // Brun très sombre
  bg1: "#252320",             // Brun chaud
  bg2: "#2D2B27",
  bg3: "#35332E",
  surface: "rgba(250,247,242,0.04)",
  surfaceHi: "rgba(250,247,242,0.06)",
  border: "rgba(250,247,242,0.08)",
  borderHi: "rgba(250,247,242,0.14)",
  teal: "#9BB8CC",            // Bleu poudré clair
  tealBg: "rgba(155,184,204,0.08)",
  tealBorder: "rgba(155,184,204,0.22)",
  tealGlow: "rgba(155,184,204,0.08)",
  red: "#D4958A",             // Terre cuite claire
  redBg: "rgba(212,149,138,0.08)",
  redBorder: "rgba(212,149,138,0.18)",
  amber: "#D4BA6E",           // Ambre clair
  amberBg: "rgba(212,186,110,0.08)",
  amberBorder: "rgba(212,186,110,0.20)",
  green: "#9BB8A8",           // Vert sauge clair
  greenBg: "rgba(155,184,168,0.08)",
  greenBorder: "rgba(155,184,168,0.20)",
  purple: "#B8A8D4",          // Lavande claire
  purpleBg: "rgba(184,168,212,0.08)",
  blue: "#8BA8C4",            // Bleu ardoise clair
  blueBg: "rgba(139,168,196,0.07)",
  text: "#E8E4DC",            // Crème parcheminé
  muted: "rgba(232,228,220,0.50)",
  faint: "rgba(232,228,220,0.14)"
};
```

`const C_DARK = Object.assign({},C);` reste INCHANGÉ.

═══════════════════════════════════════════════════════
PARTIE 3 — CSS COMPLET (remplace TOUT le <style>)
═══════════════════════════════════════════════════════

Remplace TOUT le contenu entre `<style>` et `</style>` (lignes ~18 à ~85) par :

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
PARTIE 4 — GRADIENTS JS
═══════════════════════════════════════════════════════

Après la PARTIE 0 (qui a remplacé #0EA5E9 par ${C.blue}), vérifie que TOUS les gradients inline sont maintenant :
- `linear-gradient(135deg,${C.teal},${C.blue})` — gradient principal (bleu poudré → bleu ardoise)
- `linear-gradient(135deg,${C.green},#6A8F7C)` — gradient vert (sauge)

═══════════════════════════════════════════════════════
PARTIE 5 — OMBRES JS INLINE
═══════════════════════════════════════════════════════

1. Logo ⚡ : `0 10px 36px ${C.tealGlow}` → `0 4px 14px ${C.tealGlow}`
2. Logo LoginScreen : `0 4px 16px ${C.tealGlow}` → `0 2px 10px ${C.tealGlow}`
3. Form card LoginScreen : `0 48px 120px rgba(0,0,0,0.55)` → `0 6px 28px rgba(45,42,38,0.08)`
4. Sidebar : `1px 0 12px rgba(0,0,0,0.12)` → `1px 0 8px rgba(45,42,38,0.04)`
5. Card glow : `0 0 24px ${C.tealGlow}` → `0 0 14px ${C.tealGlow}`
6. HealthBar : `0 0 8px ${c}44` → `0 0 6px ${c}22`
7. Boutons : `0 6px 24px ${C.tealGlow}` → `0 2px 10px ${C.tealGlow}`
8. Bouton submit : `0 6px 24px ${C.tealGlow}` → `0 2px 10px rgba(123,155,175,0.16)`
9. Green btn shadow : `0 4px 14px rgba(16,185,129,0.3)` → `0 2px 10px rgba(125,155,138,0.16)`

═══════════════════════════════════════════════════════
PARTIE 6 — LANDING PAGE (LoginScreen) — MÊME DA QUE L'APP
═══════════════════════════════════════════════════════

⚠️ La LoginScreen DOIT avoir EXACTEMENT la même D.A. que l'application.

### 6.1 — Fond principal (ligne ~835)
```js
background: `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(123,155,175,0.06) 0%,transparent 60%),${C.bg}`
```
= Parchemin + lueur bleu poudré subtile

### 6.2 — Logo ⚡ (ligne ~853)
```js
background: `linear-gradient(135deg,${C.teal},${C.blue})`,
borderRadius: 14,
boxShadow: `0 2px 10px ${C.tealGlow}`
```

### 6.3 — Titre "scalyo" (ligne ~867)
```js
color: C.text   // → #2D2A26 en light (charbon chaud, TRÈS LISIBLE sur parchemin)
```
Le "yo" : `color: C.teal` // → #7B9BAF (bleu poudré)

### 6.4 — Tagline (ligne ~873)
```js
color: C.muted   // → rgba(45,42,38,0.50) — LISIBLE sur parchemin
```

### 6.5 — Sélecteur de langue (ligne ~884)
```js
background: lang === l ? C.tealBg : C.surface,
border: `1px solid ${lang === l ? C.tealBorder : C.border}`,
color: lang === l ? C.teal : C.muted
```

### 6.6 — Form card (ligne ~890)
```js
background: C.bg1,                     // blanc
border: `1px solid ${C.border}`,       // bordure sable
borderRadius: 22,
boxShadow: "0 6px 28px rgba(45,42,38,0.08)",  // ombre chaude douce
padding: 36
```

### 6.7 — Titres dans la card (lignes ~926, ~1058)
```js
color: C.text,    // #2D2A26 — LISIBLE
fontSize: 20,
fontWeight: 800   // ou 900
```

### 6.8 — Sous-titres (lignes ~934, ~1066)
```js
color: C.muted,   // gris chaud LISIBLE
fontSize: 13
```

### 6.9 — Labels des inputs (lignes ~953, ~1000)
```js
color: C.muted,
fontSize: 11,
fontWeight: 700,
textTransform: "uppercase"
```

### 6.10 — Champs input (lignes ~971, ~1110)
```js
background: C.surface,           // lin très clair
border: `1px solid ${C.border}`, // bordure visible
color: C.text,                   // texte LISIBLE
borderRadius: 10,
padding: "11px 14px",
fontSize: 14
```

### 6.11 — Bouton show/hide password (ligne ~987)
```js
color: C.muted   // LISIBLE
```

### 6.12 — Sélecteur de rôle Manager/CSM (ligne ~1020)
```js
background: role === v ? C.tealBg : C.surface,
border: `1px solid ${role === v ? C.tealBorder : C.border}`,
color: role === v ? C.teal : C.muted
```

### 6.13 — Message d'erreur (ligne ~1026)
```js
background: C.redBg,
border: `1px solid ${C.redBorder}`,
color: C.red   // terre cuite LISIBLE
```

### 6.14 — Message de succès/info (ligne ~916)
```js
background: C.greenBg,
border: `1px solid ${C.greenBorder}`,
color: C.green   // vert sauge LISIBLE
```

### 6.15 — Bouton submit LOGIN (ligne ~1038-1046)
```js
width: "100%",
padding: "14px",
borderRadius: 12,
fontSize: 15,
fontWeight: 700,
background: `linear-gradient(135deg,${C.teal},${C.blue})`,
color: "#FFFFFF",                    // ⚠️ BLANC — PAS #070D1A !!!
boxShadow: "0 2px 10px rgba(123,155,175,0.16)"
```

### 6.16 — Spinner dans le bouton (ligne ~1056)
```js
color: "#FFFFFF"   // ⚠️ BLANC — PAS #070D1A !!!
```

### 6.17 — Bouton submit SIGNUP (ligne ~1178-1184)
Même style exactement que 6.15 — gradient bleu poudré, texte BLANC.

### 6.18 — Footer textes (CGU, sécurité, etc.)
```js
color: C.muted   // gris chaud LISIBLE
```

═══════════════════════════════════════════════════════
PARTIE 7 — SIDEBAR
═══════════════════════════════════════════════════════

Le sidebar est DÉJÀ bien structuré avec 3 zones. VÉRIFIE simplement :

### 7.1 — Container sidebar (ligne ~8170)
```js
background: C.bg1,   // blanc en light
boxShadow: "1px 0 8px rgba(45,42,38,0.04)",   // ombre chaude ultra-douce
borderRight: `1px solid ${C.border}`,
overflow: "hidden"   // DOIT être présent
```

### 7.2 — Logo gradient (ligne ~8195)
```js
background: `linear-gradient(135deg,${C.teal},${C.blue})`   // PAS #0EA5E9 !!
boxShadow: `0 4px 14px ${C.tealGlow}`
```

### 7.3 — Zone nav (ligne ~8219)
```js
flex: 1,
overflowY: "auto",    // DOIT être présent — permet le scroll
overflowX: "hidden"   // DOIT être présent
```

### 7.4 — Nav items actifs (ligne ~8245)
```js
background: active ? C.tealBg : "transparent",
border: `1px solid ${active ? C.tealBorder : "transparent"}`,
color: active ? C.teal : C.muted
```

### 7.5 — Zone basse — Settings/Avatar
- Bordure : `borderTop: '1px solid ${C.border}'`
- Textes : C.muted, C.faint (tous dynamiques, OK)

═══════════════════════════════════════════════════════
PARTIE 8 — KANBAN
═══════════════════════════════════════════════════════

Le Kanban est DÉJÀ bien implémenté avec tokens dynamiques. VÉRIFIE :

### 8.1 — Accessible depuis le sidebar
□ "Kanban" (📋) dans NAV_MANAGER (ligne ~7800) — DÉJÀ PRÉSENT
□ "Kanban" (📋) dans NAV_CSM (ligne ~7841) — DÉJÀ PRÉSENT
□ case "kanban" dans renderView() (ligne ~8146) — DÉJÀ PRÉSENT

### 8.2 — Boutons "+" visibles
□ Bouton "+" dans chaque colonne (ligne ~7687) — DÉJÀ PRÉSENT
□ Bouton dashed dans l'état vide (ligne ~7777) — DÉJÀ PRÉSENT

### 8.3 — Colonnes avec tokens
□ "À faire" → C.blue (ligne ~7653) — DÉJÀ DYNAMIQUE
□ "En cours" → C.amber (ligne ~7654) — DÉJÀ DYNAMIQUE
□ "Terminé" → C.green (ligne ~7655) — DÉJÀ DYNAMIQUE

### 8.4 — Drag & drop
□ draggable: true (ligne ~7725) — DÉJÀ PRÉSENT
□ onDragStart, onDragOver, onDrop — DÉJÀ IMPLÉMENTÉS

Rien à changer dans le Kanban, il utilise déjà les tokens C.xxx partout.

═══════════════════════════════════════════════════════
PARTIE 9 — VÉRIFICATION PRODUCTION
═══════════════════════════════════════════════════════

### A. ZÉRO COULEUR MORTE
□ `#070D1A` → 0 occ. (vérif CTRL+F)
□ `#0EA5E9` → 0 occ.
□ `#0C1525` → 0 occ.
□ `#131E35` → 0 occ.
□ `#F04C5B` → 0 occ. dans CSS
□ `#12CDB8` → 0 occ. dans CSS
□ `#F0F4F8` → 0 occ.
□ `#1E293B` → 0 occ.
□ `DM Sans` → 0 occ.
□ `DM Mono` → 0 occ.

### B. LISIBILITÉ PARFAITE
□ #2D2A26 sur #FAF7F2 → ratio ~12:1 ✅
□ C.muted sur #FAF7F2 → ratio ~5:1 ✅
□ C.teal #7B9BAF sur #FAF7F2 → ratio ~3.5:1 ✅
□ C.red #C4796E sur blanc → ratio ~3.5:1 ✅
□ Texte boutons #FFFFFF sur gradient → ratio ~5:1 ✅
□ AUCUN texte illisible ou invisible

### C. COHÉRENCE APP = LANDING PAGE
□ Même fond parchemin #FAF7F2
□ Mêmes bordures rgba(45,42,38,0.10)
□ Mêmes ombres chaudes
□ Mêmes inputs avec bordures visibles
□ Même gradient bleu poudré sur boutons
□ Même police Inter
□ Même accent bleu poudré C.teal

### D. THÈME DARK FONCTIONNE
□ Switch light→dark : fond #1C1A17, texte #E8E4DC
□ Switch dark→light : fond #FAF7F2, texte #2D2A26
□ Tous les tokens C.xxx se mettent à jour
□ Pas de flash de couleur au switch

### E. SIDEBAR SCROLLABLE
□ Logo fixe en haut
□ Nav scrolle au milieu (overflowY: auto)
□ Settings/avatar fixes en bas
□ Sidebar container overflow: hidden

### F. KANBAN ACCESSIBLE
□ Item "Kanban" 📋 dans le sidebar
□ Clic navigue vers l'écran Kanban
□ Boutons "+" fonctionnels
□ Drag & drop fonctionnel

### G. ANTI-RÉGRESSION COMPLÈTE
□ LoginScreen : signIn fonctionne
□ LoginScreen : signUp fonctionne
□ LoginScreen : validation d'erreurs fonctionne
□ LoginScreen : sélecteur de langue fonctionne
□ Auth : onAuthStateChange OK
□ Auth : getSession OK
□ Auth : signOut OK
□ DashboardView → FONCTIONNE
□ PortfolioView → FONCTIONNE
□ ImportModal → FONCTIONNE
□ AddAccountModal → FONCTIONNE
□ EditAccountPanel → FONCTIONNE
□ WellbeingView → FONCTIONNE
□ CoachIAView → FONCTIONNE
□ KPIView → FONCTIONNE
□ TipsView → FONCTIONNE
□ ResourcesView → FONCTIONNE
□ EmailStudioView → FONCTIONNE
□ RoadmapView → FONCTIONNE
□ UpgradeModal → FONCTIONNE
□ SettingsView → FONCTIONNE (thème, langue, API key)
□ AccountTodoPanel → FONCTIONNE
□ KanbanView → FONCTIONNE
□ Thème clair/sombre switch → FONCTIONNE
□ I18N fr/en/kr → INTACT
□ Aucun appel Supabase modifié
□ Aucun appel Stripe modifié
□ Aucun appel Anthropic modifié
□ localStorage : screen, theme, lang, sidebar, kanban → INTACT
□ Spinner, Loader, Avatar, Tag → FONCTIONNENT
□ Toutes les fonctions utilitaires → INTACTES

### H. RAPPORT PRODUCTION

| Élément | Statut |
|---------|--------|
| #070D1A éradiqué (24+6 occ.) | ✅/❌ |
| #0EA5E9 éradiqué (22 occ.) | ✅/❌ |
| rgba(18,205,184,...) CSS (18 occ.) | ✅/❌ |
| rgba(255,255,255,...) CSS (30 occ.) | ✅/❌ |
| DM Sans/Mono (20 occ.) | ✅/❌ |
| CSS complet remplacé | ✅/❌ |
| Palette C_LIGHT parchemin | ✅/❌ |
| Palette C_DARK brun | ✅/❌ |
| handleTheme MAJ | ✅/❌ |
| Thème défaut = light | ✅/❌ |
| LoginScreen = même DA | ✅/❌ |
| LoginScreen LISIBLE | ✅/❌ |
| Sidebar scrollable | ✅/❌ |
| Kanban fonctionnel | ✅/❌ |
| Ombres chaudes | ✅/❌ |
| Gradients poudrés | ✅/❌ |
| Anti-régression | ✅/❌ |
| Prêt production | ✅/❌ |

Verdict : 🟢 ZEN & PRODUCTION-READY / 🟠 PRESQUE / 🔴 PAS BON

⚠️ Si le verdict est 🟠 ou 🔴, liste les problèmes restants et corrige-les AVANT de retourner le fichier.

Retourne-moi le fichier COMPLET.
```
