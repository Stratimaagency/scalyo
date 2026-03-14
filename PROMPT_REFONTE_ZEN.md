# PROMPT — Refonte Design "Warm & Calm" + Renommage Kanban

> **Mode d'emploi** : Copiez-collez ce prompt dans Claude Chat en joignant votre fichier `index.html` (ou `app.html`) en pièce jointe.

---

```
Tu es un designer/développeur senior spécialisé UX bien-être et accessibilité. Tu dois transformer le design de cette application Scalyo pour créer une expérience chaleureuse, lumineuse, apaisante et minimaliste — comme un espace de bien-être premium.

Tu dois aussi renommer "Task Board" en "Kanban" PARTOUT dans l'application.

La landing page (LoginScreen) et l'application doivent partager la MÊME direction artistique.

═══════════════════════════════════════════════════════
RÈGLES NON NÉGOCIABLES
═══════════════════════════════════════════════════════

- Retourne le fichier COMPLET à la fin
- NE MODIFIE AUCUNE logique métier, aucune fonction, aucun appel Supabase/Stripe/Anthropic
- NE SUPPRIME aucun composant ou fonctionnalité
- NE CHANGE PAS les noms de variables JS, fonctions, composants React
- Tu modifies UNIQUEMENT : les couleurs, ombres, gradients, animations, polices, bordures, arrondis, opacités, ET les labels/textes "Task Board" → "Kanban"
- Chaque modification doit être cohérente entre mode DARK et mode LIGHT
- Le résultat doit être accessible (contraste WCAG AA, lisible pour les daltoniens)

═══════════════════════════════════════════════════════
PARTIE 1 — RENOMMAGE "TASK BOARD" → "KANBAN"
═══════════════════════════════════════════════════════

Cherche et remplace TOUTES les occurrences de "Task Board" dans le fichier :

1. **Navigation (NAV_MANAGER et NAV_CSM)** : Si un objet a `label: "Task Board"`, remplace par `label: "Kanban"`. Garde le même `id` et la même `icon` (ou remplace l'icône par "📋" si elle ne colle pas).

2. **I18N (objet de traductions)** : Si une clé contient "Task Board" en français ou "Task Board" en anglais, remplace :
   - FR : "Task Board" → "Kanban"
   - EN : "Task Board" → "Kanban"
   - KR (si présent) : "Task Board" → "Kanban"

3. **Titres de composants** : Cherche dans tout le JSX les textes "Task Board" affichés à l'écran (dans des `<h2>`, `<span>`, etc.) et remplace par "Kanban".

4. **Vérification doublon** : S'assurer qu'il n'y a PAS deux entrées de navigation qui pointent vers le même écran. Si "Kanban" existe déjà quelque part, ne pas créer de doublon — garder une seule entrée.

5. **IDs de screen** : Si le `renderView()` utilise un case comme `case "taskboard":` ou `case "task_board":`, garde le même identifiant technique (ne change que le label affiché).

═══════════════════════════════════════════════════════
PARTIE 2 — PHILOSOPHIE DESIGN "WARM & CALM"
═══════════════════════════════════════════════════════

L'objectif est de créer un environnement visuel qui évoque :
- La chaleur d'un salon cosy avec lumière dorée
- La douceur d'un café haut de gamme
- Le calme d'un spa naturel
- Un produit SaaS premium, marketé, pas un outil de développeur

Principes :
1. COULEURS CHAUDES — Tons pêche, corail, terre cuite, or, crème (zéro néon, zéro bleu vif)
2. FOND LUMINEUX — Blanc cassé chaud, crème, lin naturel (pas de gris froid)
3. TRANSITIONS DOUCES — Animations lentes et fluides
4. ARRONDIS GÉNÉREUX — Plus de rondeur = plus de douceur
5. OMBRES DIFFUSES ET CHAUDES — Ombres teintées, jamais noires et dures
6. ESPACEMENT AÉRÉ — Respiration visuelle
7. ACCESSIBILITÉ — Chaque information colorée doit aussi avoir un indicateur non-couleur (icône, texte, forme)

═══════════════════════════════════════════════════════
PARTIE 3 — NOUVELLE PALETTE DE COULEURS
═══════════════════════════════════════════════════════

### Mode Clair (C_LIGHT) — THÈME PRINCIPAL

Remplace l'objet C_LIGHT par :

```js
const C_LIGHT = {
  bg: "#FFF8F2",              // Fond principal : crème pêche très clair
  bg1: "#FFFFFF",             // Fond cartes : blanc pur
  bg2: "#FFF0E6",             // Fond secondaire : pêche très pâle
  bg3: "#FFE8D6",             // Fond tertiaire : pêche clair
  surface: "rgba(180,120,60,0.04)",
  surfaceHi: "rgba(180,120,60,0.07)",
  border: "rgba(180,120,60,0.10)",        // Bordures terre chaude
  borderHi: "rgba(180,120,60,0.18)",
  teal: "#D2785A",            // ★ Accent principal : terre cuite / corail chaud (remplace le teal)
  tealBg: "rgba(210,120,90,0.08)",
  tealBorder: "rgba(210,120,90,0.22)",
  tealGlow: "rgba(210,120,90,0.10)",
  red: "#C4564A",             // Alerte : rouge brique doux
  redBg: "rgba(196,86,74,0.07)",
  redBorder: "rgba(196,86,74,0.20)",
  amber: "#C4923A",           // Vigilance : or ambré chaud
  amberBg: "rgba(196,146,58,0.07)",
  amberBorder: "rgba(196,146,58,0.22)",
  green: "#5A9E6F",           // Succès : vert sauge naturel
  greenBg: "rgba(90,158,111,0.07)",
  greenBorder: "rgba(90,158,111,0.20)",
  purple: "#9B7AB8",          // Plan Elite : lavande douce
  purpleBg: "rgba(155,122,184,0.08)",
  blue: "#7A9AB8",            // Plan Growth : bleu ardoise doux
  blueBg: "rgba(122,154,184,0.07)",
  text: "#3D2E22",            // Texte principal : brun chocolat chaud
  muted: "rgba(61,46,34,0.55)",           // Texte secondaire
  faint: "rgba(61,46,34,0.18)"            // Texte tertiaire
};
```

### Mode Sombre (C / C_DARK) — Thème nuit chaud

Remplace l'objet C (base/dark) par :

```js
const C = {
  bg: "#1C1714",              // Fond principal : brun très profond (pas noir, pas bleu)
  bg1: "#252019",             // Fond cartes : brun chaud
  bg2: "#2D2720",             // Fond secondaire
  bg3: "#353028",             // Fond tertiaire
  surface: "rgba(255,235,210,0.04)",
  surfaceHi: "rgba(255,235,210,0.07)",
  border: "rgba(255,235,210,0.08)",       // Bordures dorées très subtiles
  borderHi: "rgba(255,235,210,0.15)",
  teal: "#E8A07A",            // ★ Accent principal : pêche / corail doux (remplace le néon teal)
  tealBg: "rgba(232,160,122,0.10)",
  tealBorder: "rgba(232,160,122,0.22)",
  tealGlow: "rgba(232,160,122,0.08)",
  red: "#D4878F",             // Alerte : rose poudré (pas rouge agressif)
  redBg: "rgba(212,135,143,0.08)",
  redBorder: "rgba(212,135,143,0.18)",
  amber: "#D4B87A",           // Vigilance : or doux
  amberBg: "rgba(212,184,122,0.08)",
  amberBorder: "rgba(212,184,122,0.20)",
  green: "#8BBF9A",           // Succès : vert sauge clair
  greenBg: "rgba(139,191,154,0.08)",
  greenBorder: "rgba(139,191,154,0.20)",
  purple: "#B8A0D4",          // Plan Elite : lavande
  purpleBg: "rgba(184,160,212,0.08)",
  blue: "#9AB8D4",            // Plan Growth : bleu poudré
  blueBg: "rgba(154,184,212,0.07)",
  text: "#F0E6D8",            // Texte principal : crème chaud (pas blanc froid)
  muted: "rgba(240,230,216,0.50)",        // Texte secondaire
  faint: "rgba(240,230,216,0.18)"         // Texte tertiaire
};
```

═══════════════════════════════════════════════════════
PARTIE 4 — CSS GLOBAL (section <style>)
═══════════════════════════════════════════════════════

### 4.1 — Fond et police de base (ligne ~20)
```css
html,body,#root{height:100%;background:#FFF8F2;font-family:'Inter',sans-serif;color:#3D2E22;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
```
Note : On utilise le fond clair par DÉFAUT (l'app est "lumineuse" par nature). Le mode sombre reste disponible en option.

### 4.2 — Scrollbar chaude
```css
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(180,120,60,0.12);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:rgba(180,120,60,0.22)}
```

### 4.3 — Boutons
```css
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .3s ease;letter-spacing:-.2px}
.btn-primary{background:linear-gradient(135deg,#D2785A,#C4923A);color:#fff;box-shadow:0 4px 20px rgba(210,120,90,0.18)}
.btn-primary:hover{transform:translateY(-0.5px);box-shadow:0 6px 28px rgba(210,120,90,0.24)}
.btn-secondary{background:rgba(180,120,60,0.06);color:rgba(61,46,34,0.8);border:1px solid rgba(180,120,60,0.12)}
.btn-secondary:hover{background:rgba(180,120,60,0.10);border-color:rgba(180,120,60,0.20)}
.btn-danger{background:rgba(196,86,74,0.08);color:#C4564A;border:1px solid rgba(196,86,74,0.18)}
.btn-danger:hover{background:rgba(196,86,74,0.14)}
.btn-sm{padding:5px 12px;font-size:11.5px;border-radius:10px}
```

### 4.4 — Chips et filtres
```css
.csm-filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;padding:0 2px}
.csm-chip{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(180,120,60,0.10);background:rgba(180,120,60,0.04);color:rgba(61,46,34,0.6);transition:all .25s ease}
.csm-chip:hover{background:rgba(210,120,90,0.08);border-color:rgba(210,120,90,0.22);color:#D2785A}
.csm-chip.active{background:rgba(210,120,90,0.12);border-color:rgba(210,120,90,0.35);color:#D2785A;font-weight:700}
```

### 4.5 — Chat input
```css
.chat-input{flex:1;background:rgba(180,120,60,0.04);border:1px solid rgba(180,120,60,0.10);border-radius:14px;padding:11px 15px;color:#3D2E22;font-size:13px;font-family:inherit;resize:none}
.chat-input:focus{outline:none;border-color:rgba(210,120,90,0.35);background:rgba(210,120,90,0.04)}
.chat-send-btn{background:linear-gradient(135deg,#D2785A,#C4923A);border:none;border-radius:14px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;box-shadow:0 4px 20px rgba(210,120,90,0.14);transition:all .3s ease;flex-shrink:0}
.chat-send-btn:hover{transform:scale(1.03);box-shadow:0 6px 28px rgba(210,120,90,0.22)}
.chat-send-btn:disabled{opacity:.4;transform:none;cursor:not-allowed}
```

### 4.6 — Cartes et tips
```css
.api-banner{padding:14px 18px;background:rgba(196,146,58,0.07);border:1px solid rgba(196,146,58,0.20);border-radius:14px;margin:12px 18px;display:flex;gap:12px;font-size:13px;align-items:flex-start}
.tip-card{background:rgba(180,120,60,0.03);border:1px solid rgba(180,120,60,0.08);border-radius:16px;padding:16px 18px;margin-bottom:8px;cursor:pointer;transition:all .3s ease}
.tip-card:hover{background:rgba(210,120,90,0.05);border-color:rgba(210,120,90,0.18)}
.tip-card.open{border-color:rgba(210,120,90,0.25);background:rgba(210,120,90,0.04)}
.quick-chip{padding:7px 14px;border-radius:20px;font-size:12px;cursor:pointer;background:rgba(180,120,60,0.04);border:1px solid rgba(180,120,60,0.10);color:rgba(61,46,34,0.65);transition:all .25s ease;font-weight:500}
.quick-chip:hover{background:rgba(210,120,90,0.08);border-color:rgba(210,120,90,0.22);color:#D2785A}
```

### 4.7 — Toggle switch
```css
.toggle-switch{position:relative;width:46px;height:26px;display:inline-block;flex-shrink:0}
.toggle-switch input{display:none}
.toggle-slider{position:absolute;inset:0;border-radius:26px;background:rgba(180,120,60,0.12);cursor:pointer;transition:.3s}
.toggle-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 2px 8px rgba(180,120,60,0.15)}
input:checked+.toggle-slider{background:linear-gradient(135deg,#D2785A,#C4923A)}
input:checked+.toggle-slider::before{transform:translateX(20px)}
```

### 4.8 — Navigation et interactions
```css
.nav-btn{transition:all .25s ease;border-radius:12px;cursor:pointer}
.nav-btn:hover{background:rgba(180,120,60,0.06)!important}
.row-item{transition:background .2s ease;cursor:pointer}
.row-item:hover{background:rgba(210,120,90,0.04)!important}
.card-lift{transition:transform .35s ease,border-color .35s ease}
.card-lift:hover{transform:translateY(-1px);border-color:rgba(210,120,90,0.22)!important}
.btn-base{transition:all .3s ease;cursor:pointer;border:none;font-family:'Inter',sans-serif;font-weight:700;outline:none}
.btn-base:hover:not(:disabled){transform:translateY(-0.5px);filter:brightness(1.04)}
.btn-base:active:not(:disabled){transform:translateY(0);filter:brightness(0.96)}
.btn-base:disabled{opacity:.38;cursor:not-allowed;transform:none!important;filter:none!important}
```

### 4.9 — Animations (plus lentes et douces)
```css
.fade-in{animation:fadeIn .4s ease forwards}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInR{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.pulse{animation:pulse 2.5s infinite}
.spin{animation:spin .7s linear infinite}
```

### 4.10 — Inputs
```css
input,select,textarea{outline:none;font-family:'Inter',sans-serif;-webkit-appearance:none;appearance:none}
input:focus,select:focus,textarea:focus{border-color:rgba(210,120,90,0.40)!important;box-shadow:0 0 0 4px rgba(210,120,90,0.08)!important}
```

### 4.11 — Modals
```css
.modal-overlay{position:fixed;inset:0;background:rgba(61,46,34,0.50);backdrop-filter:blur(16px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .35s ease}
.modal-box{background:#FFFFFF;border:1px solid rgba(180,120,60,0.10);border-radius:24px;width:100%;animation:slideUp .4s ease;max-height:90vh;overflow-y:auto}
.side-panel{animation:slideInR .35s ease}
```

### 4.12 — Tabs
```css
.tab-bar{display:flex;gap:4px;background:rgba(180,120,60,0.04);border-radius:14px;padding:4px}
.tab-item{padding:7px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s ease;color:rgba(61,46,34,0.45);white-space:nowrap}
.tab-item.active{background:#FFFFFF;color:#3D2E22;box-shadow:0 1px 6px rgba(180,120,60,0.10)}
.tab-item:hover:not(.active){color:#3D2E22;background:rgba(180,120,60,0.05)}
```

### 4.13 — Skeleton loader
```css
.skeleton{background:linear-gradient(90deg,rgba(180,120,60,0.04) 25%,rgba(180,120,60,0.08) 50%,rgba(180,120,60,0.04) 75%);background-size:200% 100%;animation:shimmer 2.5s ease-in-out infinite;border-radius:10px}
```

═══════════════════════════════════════════════════════
PARTIE 5 — GRADIENTS DANS LE JAVASCRIPT
═══════════════════════════════════════════════════════

Remplace TOUS les gradients dans le code JS/JSX :

### 5.1 — Gradient principal (teal → blue) — environ 20+ occurrences
CHERCHE ces patterns et remplace-les TOUS :
- `linear-gradient(135deg,#12CDB8,#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.amber})`
- `linear-gradient(135deg,${C.teal},#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.amber})`

Cela donnera : terre cuite → or (mode clair) ou pêche → or (mode sombre). Chaud et premium.

### 5.2 — Gradient vert (succès/wellbeing) — 4 occurrences
- `linear-gradient(135deg,#10B981,#059669)` → `linear-gradient(135deg,${C.green},#4A8A5E)`

### 5.3 — Gradient teal → purple — quelques occurrences
- `linear-gradient(135deg,${C.teal},${C.purple})` → garder tel quel (les nouvelles couleurs C.teal et C.purple sont déjà chaudes)

### 5.4 — Radial gradient du LoginScreen
AVANT : `radial-gradient(ellipse 80% 55% at 50% -8%,rgba(18,205,184,0.13) 0%,transparent 62%)`
APRÈS : `radial-gradient(ellipse 90% 60% at 50% -5%,rgba(210,120,90,0.08) 0%,transparent 70%)`

═══════════════════════════════════════════════════════
PARTIE 6 — OMBRES CHAUDES ET DIFFUSES
═══════════════════════════════════════════════════════

Remplace TOUTES les box-shadow dans le code JS inline :

1. **Logo shadows** :
   - `0 10px 36px ${C.tealGlow}` → `0 8px 32px ${C.tealGlow}` (tealGlow est déjà doux)
   - `0 4px 16px ${C.tealGlow}` → garder tel quel

2. **Form card shadow (LoginScreen)** :
   - `0 48px 120px rgba(0,0,0,0.55)` → `0 24px 64px rgba(180,120,60,0.10)`

3. **Sidebar** :
   - `2px 0 16px rgba(0,0,0,0.2)` → `1px 0 12px rgba(180,120,60,0.06)`

4. **Card glow** :
   - `0 0 24px ${C.tealGlow}` → `0 0 32px ${C.tealGlow}`

5. **HealthBar glow** :
   - `0 0 8px ${c}44` → `0 0 12px ${c}22` (réduit de moitié)

6. **Boutons inline** :
   - `0 6px 24px ${C.tealGlow}` → `0 6px 28px ${C.tealGlow}`

═══════════════════════════════════════════════════════
PARTIE 7 — POLICE
═══════════════════════════════════════════════════════

### 7.1 — Remplacer le lien Google Fonts (ligne ~9)
AVANT :
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```
APRÈS :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

### 7.2 — Remplacer TOUTES les occurrences dans le code
- `'DM Sans'` → `'Inter'` (environ 4 occurrences)
- `'DM Mono'` → `'JetBrains Mono'` (environ 12 occurrences)
- `"DM Sans"` → `"Inter"` (si des guillemets doubles existent)
- `"DM Mono"` → `"JetBrains Mono"` (si des guillemets doubles existent)

═══════════════════════════════════════════════════════
PARTIE 8 — handleTheme (mise à jour)
═══════════════════════════════════════════════════════

Mettre à jour la fonction handleTheme pour utiliser les nouvelles couleurs de fond :

```js
const handleTheme = t => {
  try{localStorage.setItem("scalyo_theme",t);}catch(e){}
  Object.assign(C, t==="light"?C_LIGHT:C_DARK);
  document.body.style.background = t==="light"?"#FFF8F2":"#1C1714";
  document.body.style.color = t==="light"?"#3D2E22":"#F0E6D8";
  document.getElementById("root").style.background = t==="light"?"#FFF8F2":"#1C1714";
  setTheme(t);
};
```

IMPORTANT : Le thème par défaut doit être "light" (l'app est lumineuse par défaut).
Si le code initialise le thème avec `useState("dark")`, remplace par `useState("light")`.
Si `localStorage` retourne null, le défaut doit être "light".

═══════════════════════════════════════════════════════
PARTIE 9 — COULEURS HARDCODÉES DANS LE CSS
═══════════════════════════════════════════════════════

Certaines couleurs sont en dur dans le CSS (pas via les tokens JS). Remplace-les TOUTES :

| AVANT (CSS) | APRÈS (CSS) | Localisation |
|-------------|-------------|-------------|
| `#070D1A` | `#FFF8F2` | body background |
| `#E8EDF5` | `#3D2E22` | body text color |
| `#0C1525` | `#FFFFFF` | modal-box background |
| `#131E35` | `#FFFFFF` | tab-item.active background |
| `#12CDB8` | `#D2785A` | gradient start, chip hover |
| `#0EA5E9` | `#C4923A` | gradient end |
| `#F04C5B` | `#C4564A` | danger color |
| `rgba(18,205,184,...)` | `rgba(210,120,90,...)` | tous les rgba teal |
| `rgba(240,76,91,...)` | `rgba(196,86,74,...)` | tous les rgba red |
| `rgba(245,158,11,...)` | `rgba(196,146,58,...)` | tous les rgba amber |
| `rgba(255,255,255,0.04)` | `rgba(180,120,60,0.04)` | surfaces (mode clair par défaut) |
| `rgba(255,255,255,0.06)` | `rgba(180,120,60,0.06)` | surfaces hover |
| `rgba(255,255,255,0.08)` | `rgba(180,120,60,0.08)` | borders |
| `rgba(255,255,255,0.1)` | `rgba(180,120,60,0.10)` | borders hi |
| `rgba(232,237,245,...)` | `rgba(61,46,34,...)` | textes secondaires |

ATTENTION : Ces remplacements CSS concernent le thème CLAIR par défaut. Le thème sombre sera géré dynamiquement via les tokens JS (C_DARK) quand l'utilisateur switch.

═══════════════════════════════════════════════════════
PARTIE 10 — LANDING PAGE (LoginScreen) — MÊME DA
═══════════════════════════════════════════════════════

La landing page DOIT avoir la MÊME direction artistique que l'app :

1. **Background** : Même fond crème `#FFF8F2` avec un radial gradient chaud subtil :
   ```js
   background: `radial-gradient(ellipse 90% 60% at 50% -5%,rgba(210,120,90,0.08) 0%,transparent 70%),${C.bg}`
   ```

2. **Logo** : Gradient chaud au lieu de teal-blue :
   ```js
   background: `linear-gradient(135deg,${C.teal},${C.amber})`
   ```
   (C.teal = terre cuite, C.amber = or)

3. **Form card** :
   - Background : `C.bg1` (blanc en mode clair)
   - Border : `1px solid ${C.border}` (bordure chaude subtile)
   - Shadow : `0 24px 64px rgba(180,120,60,0.10)` (ombre chaude diffuse)
   - Border-radius : 24px

4. **Bouton submit** : Même gradient chaud que les btn-primary de l'app
   ```js
   background: `linear-gradient(135deg,${C.teal},${C.amber})`
   boxShadow: `0 6px 28px ${C.tealGlow}`
   ```

5. **Inputs** : Mêmes styles que les inputs de l'app (bordures chaudes, focus ring chaud)

6. **Titre "scalyo"** : Le "yo" en couleur `C.teal` (terre cuite/corail)

═══════════════════════════════════════════════════════
PARTIE 11 — ACCESSIBILITÉ DALTONIENS
═══════════════════════════════════════════════════════

CRITIQUE : Ne JAMAIS utiliser uniquement la couleur pour transmettre une information.

### 11.1 — Statuts de risque (RiskPill / HealthBar)
Chaque niveau de risque doit avoir : COULEUR + ICÔNE + TEXTE

| Niveau | Couleur | Icône à ajouter | Texte |
|--------|---------|-----------------|-------|
| Critique | Rouge brique `C.red` | ⚠️ (triangle warning) | "Critique" / "Critical" |
| Vigilance | Or ambré `C.amber` | 👁️ (oeil) ou ◆ (losange) | "Vigilance" / "Watch" |
| Sain | Vert sauge `C.green` | ✓ (checkmark) | "Sain" / "Healthy" |

Si le composant RiskPill affiche déjà du texte, c'est bon. Vérifie juste que l'icône est présente en plus de la couleur.

### 11.2 — HealthBar
La barre de progression doit avoir un label textuel visible (ex: "72%") en plus de la couleur.
Si ce n'est pas déjà le cas, ajoute le pourcentage à côté de la barre.

### 11.3 — Badges et indicateurs
- Le badge "critique" rouge dans le header : doit avoir un ⚠️ en plus du chiffre
- Le badge "en ligne" vert : doit avoir un ● dot ET le texte "En ligne"
- Les tags de statut : toujours icône + texte, jamais couleur seule

### 11.4 — Contraste minimum
Vérifie que le texte principal sur fond crème a un ratio de contraste d'au moins 4.5:1 (WCAG AA).
- `#3D2E22` sur `#FFF8F2` = ratio ~10:1 ✅
- `C.muted` (rgba 55% opacity) sur `#FFF8F2` = vérifie que c'est > 4.5:1
- `C.teal` (#D2785A) sur `#FFF8F2` = vérifie que c'est > 3:1 (minimum pour les éléments UI)

### 11.5 — Choix des couleurs daltonien-friendly
Les couleurs choisies dans cette palette sont volontairement distinctes pour les 3 types de daltonisme :
- **Protanopie/Deutéranopie** (rouge-vert) : Le rouge brique et le vert sauge sont suffisamment éloignés en luminosité
- **Tritanopie** (bleu-jaune) : Les tons terre cuite et or sont dans des gammes distinctes
- MAIS : on ne compte JAMAIS uniquement sur la couleur → toujours icône + texte en complément

═══════════════════════════════════════════════════════
PARTIE 12 — VÉRIFICATION OBLIGATOIRE
═══════════════════════════════════════════════════════

### A. Renommage vérifié
□ TOUTES les occurrences de "Task Board" remplacées par "Kanban"
□ Pas de doublon dans la navigation (un seul "Kanban")
□ I18N fr/en/kr mis à jour
□ Titre du composant mis à jour

### B. Design warm & calm appliqué
□ C (C_DARK) : toutes les couleurs remplacées par la palette chaude sombre
□ C_LIGHT : toutes les couleurs remplacées par la palette chaude claire
□ CSS : TOUTES les couleurs hardcodées mises à jour (voir tableau Partie 9)
□ TOUS les gradients `#12CDB8,#0EA5E9` remplacés
□ TOUS les gradients verts `#10B981,#059669` remplacés
□ TOUTES les box-shadow adoucies et chaudes
□ TOUTES les animations ralenties
□ Police Inter chargée et appliquée (remplace DM Sans)
□ Police JetBrains Mono chargée et appliquée (remplace DM Mono)
□ handleTheme utilise les nouvelles couleurs
□ Thème par défaut = "light" (lumineux par défaut)

### C. Landing page = Même DA
□ LoginScreen : même fond crème que l'app
□ LoginScreen : même gradient chaud sur le logo
□ LoginScreen : même ombre douce sur la form card
□ LoginScreen : même style de boutons et inputs
□ LoginScreen : cohérence visuelle totale avec l'app

### D. Accessibilité daltoniens
□ RiskPill : icône + texte en plus de la couleur
□ HealthBar : pourcentage textuel visible
□ Badges : icône + texte, pas couleur seule
□ Contraste WCAG AA vérifié pour texte principal
□ Aucune information transmise uniquement par la couleur

### E. Anti-régression — RIEN N'EST CASSÉ
□ LoginScreen : signIn, signUp, validation → FONCTIONNEL
□ Auth : onAuthStateChange, getSession, signOut → FONCTIONNEL
□ Sécurité : isolation company_id, auth_user_id → INTACT
□ DashboardView → FONCTIONNEL
□ PortfolioView : filtrage, CRUD → FONCTIONNEL
□ ImportModal → FONCTIONNEL
□ AddAccountModal, EditAccountPanel → FONCTIONNEL
□ WellbeingView → FONCTIONNEL
□ CoachIAView → FONCTIONNEL
□ KPIView → FONCTIONNEL
□ TipsView, ResourcesView, EmailStudioView → FONCTIONNEL
□ RoadmapView → FONCTIONNEL
□ UpgradeModal → FONCTIONNEL
□ SettingsView : thème, langue, API key → FONCTIONNEL
□ AccountTodoPanel → FONCTIONNEL
□ Kanban (ex Task Board) → FONCTIONNEL
□ Thème clair/sombre switch → FONCTIONNE avec nouvelles palettes
□ I18N fr/en → INTACT
□ Tous les atoms (Spinner, Loader, Avatar, Tag, etc.) → FONCTIONNEL
□ Toutes les fonctions utilitaires → INTACT
□ Aucun appel Supabase modifié
□ Aucun appel Stripe modifié
□ Aucun appel Anthropic modifié

### F. Couleurs néon éradiquées
□ AUCUNE couleur néon ne reste : #12CDB8, #0EA5E9, #F04C5B, #F59E0B, #34D399, #070D1A, #0C1525, #131E35
□ Toutes remplacées par des tons chauds

### G. Rapport final

| Élément | Statut |
|---------|--------|
| Renommage Kanban | ✅/❌ |
| Palette chaude dark | ✅/❌ |
| Palette chaude light | ✅/❌ |
| CSS hardcodé MAJ | ✅/❌ |
| Gradients chauds | ✅/❌ |
| Ombres douces | ✅/❌ |
| Animations lentes | ✅/❌ |
| Police Inter | ✅/❌ |
| Landing page même DA | ✅/❌ |
| Accessibilité daltoniens | ✅/❌ |
| handleTheme MAJ | ✅/❌ |
| Anti-régression | ✅/❌ |

Verdict : 🟢 WARM & READY / 🟠 PRESQUE / 🔴 PAS BON

Retourne-moi le fichier COMPLET.
```
