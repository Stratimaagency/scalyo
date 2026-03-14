# PROMPT — Refonte Design "White & Playful" + Sidebar Scrollable + Kanban Fonctionnel

> **Mode d'emploi** : Copiez-collez ce prompt dans Claude Chat en joignant votre fichier `index.html` en pièce jointe.

---

```
Tu es un designer/développeur senior spécialisé UX moderne et minimaliste. Tu dois transformer le design de cette application Scalyo pour créer une expérience ultra-épurée, lumineuse et colorée — inspirée des portfolios design modernes (fond blanc immaculé, typographie colorée multicolore, espacement très aéré, ombres quasi-invisibles).

Tu dois aussi :
1. T'assurer que le KANBAN est bien accessible et fonctionnel (bouton visible dans le sidebar, navigation qui fonctionne)
2. Rendre le SIDEBAR SCROLLABLE — le menu de gauche monte et descend avec la souris (logo en haut et avatar/settings en bas restent FIXES, seuls les items de navigation au milieu scrollent)

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
- Le résultat doit être accessible (contraste WCAG AA)

═══════════════════════════════════════════════════════
PARTIE 1 — PHILOSOPHIE DESIGN "WHITE & PLAYFUL"
═══════════════════════════════════════════════════════

L'objectif est de créer un environnement visuel qui évoque :
- Un portfolio design moderne (fond blanc pur, beaucoup d'espace)
- Des accents multicolores joyeux (comme un "Welcome" écrit en plusieurs couleurs)
- La simplicité d'Apple / Linear / Notion
- Un produit SaaS premium, clean, pas un outil de développeur sombre

Principes :
1. FOND BLANC PUR — #FFFFFF ou #FAFAFA, pas de gris, pas de crème, BLANC
2. ACCENTS MULTICOLORES — Chaque section/fonctionnalité a sa propre couleur vive : vert émeraude, violet, orange, bleu, rose
3. TYPOGRAPHIE NETTE — Police Inter, titres en noir #111, sous-titres en gris doux #666
4. OMBRES QUASI-INVISIBLES — Ombres très légères et diffuses, presque transparentes
5. ARRONDIS GÉNÉREUX — 14px à 24px, jamais anguleux
6. ESPACEMENT TRÈS AÉRÉ — Padding généreux, gap 16-24px, respiration visuelle maximale
7. TRANSITIONS DOUCES — 0.3s ease, rien de brusque
8. ZÉRO NÉON — Pas de couleurs fluo (#12CDB8, #0EA5E9...), des couleurs vives mais naturelles

═══════════════════════════════════════════════════════
PARTIE 2 — NOUVELLE PALETTE DE COULEURS
═══════════════════════════════════════════════════════

### Mode Clair (C_LIGHT) — THÈME PRINCIPAL PAR DÉFAUT

```js
const C_LIGHT = {
  bg: "#FFFFFF",              // Fond principal : blanc pur
  bg1: "#FFFFFF",             // Fond cartes : blanc pur
  bg2: "#F7F7F8",             // Fond secondaire : gris ultra-clair
  bg3: "#F0F0F2",             // Fond tertiaire
  surface: "rgba(0,0,0,0.02)",
  surfaceHi: "rgba(0,0,0,0.04)",
  border: "rgba(0,0,0,0.08)",         // Bordures grises très subtiles
  borderHi: "rgba(0,0,0,0.14)",
  teal: "#10B981",            // ★ Accent principal : vert émeraude vif
  tealBg: "rgba(16,185,129,0.06)",
  tealBorder: "rgba(16,185,129,0.20)",
  tealGlow: "rgba(16,185,129,0.08)",
  red: "#EF4444",             // Alerte : rouge vif classique
  redBg: "rgba(239,68,68,0.06)",
  redBorder: "rgba(239,68,68,0.18)",
  amber: "#F59E0B",           // Vigilance : orange ambré
  amberBg: "rgba(245,158,11,0.06)",
  amberBorder: "rgba(245,158,11,0.18)",
  green: "#10B981",           // Succès : vert émeraude
  greenBg: "rgba(16,185,129,0.06)",
  greenBorder: "rgba(16,185,129,0.18)",
  purple: "#8B5CF6",          // Accent 2 : violet vif
  purpleBg: "rgba(139,92,246,0.06)",
  blue: "#3B82F6",            // Accent 3 : bleu vif
  blueBg: "rgba(59,130,246,0.06)",
  text: "#111111",            // Texte principal : noir quasi-pur
  muted: "rgba(0,0,0,0.45)",          // Texte secondaire : gris moyen
  faint: "rgba(0,0,0,0.10)"           // Texte tertiaire
};
```

### Mode Sombre (C / C_DARK) — Thème nuit neutre

```js
const C = {
  bg: "#0F0F0F",              // Fond principal : noir quasi-pur (pas bleu, pas marine)
  bg1: "#1A1A1A",             // Fond cartes : gris très sombre
  bg2: "#222222",             // Fond secondaire
  bg3: "#2A2A2A",             // Fond tertiaire
  surface: "rgba(255,255,255,0.04)",
  surfaceHi: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.15)",
  teal: "#34D399",            // ★ Accent principal : vert émeraude clair
  tealBg: "rgba(52,211,153,0.08)",
  tealBorder: "rgba(52,211,153,0.22)",
  tealGlow: "rgba(52,211,153,0.10)",
  red: "#F87171",             // Alerte : rouge clair
  redBg: "rgba(248,113,113,0.08)",
  redBorder: "rgba(248,113,113,0.18)",
  amber: "#FBBF24",           // Vigilance : jaune ambré clair
  amberBg: "rgba(251,191,36,0.08)",
  amberBorder: "rgba(251,191,36,0.20)",
  green: "#34D399",           // Succès : vert émeraude clair
  greenBg: "rgba(52,211,153,0.08)",
  greenBorder: "rgba(52,211,153,0.20)",
  purple: "#A78BFA",          // Accent 2 : violet clair
  purpleBg: "rgba(167,139,250,0.08)",
  blue: "#60A5FA",            // Accent 3 : bleu clair
  blueBg: "rgba(96,165,250,0.07)",
  text: "#F5F5F5",            // Texte principal : blanc cassé
  muted: "rgba(245,245,245,0.50)",
  faint: "rgba(245,245,245,0.15)"
};
```

═══════════════════════════════════════════════════════
PARTIE 3 — CSS GLOBAL (section <style>)
═══════════════════════════════════════════════════════

### 3.1 — Fond et police de base (remplace la ligne html,body,#root)
```css
html,body,#root{height:100%;background:#FFFFFF;font-family:'Inter',sans-serif;color:#111111;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
```
Le fond par DÉFAUT est blanc. Le thème par défaut est "light".

### 3.2 — Scrollbar fine et discrète
```css
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.10);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.20)}
```

### 3.3 — Boutons
```css
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .3s ease;letter-spacing:-.2px}
.btn-primary{background:#111111;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.btn-primary:hover{transform:translateY(-0.5px);box-shadow:0 4px 16px rgba(0,0,0,0.12)}
.btn-secondary{background:rgba(0,0,0,0.04);color:rgba(0,0,0,0.7);border:1px solid rgba(0,0,0,0.08)}
.btn-secondary:hover{background:rgba(0,0,0,0.07);border-color:rgba(0,0,0,0.14)}
.btn-danger{background:rgba(239,68,68,0.06);color:#EF4444;border:1px solid rgba(239,68,68,0.16)}
.btn-danger:hover{background:rgba(239,68,68,0.12)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:10px}
```

### 3.4 — Chips et filtres
```css
.csm-filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;padding:0 2px}
.csm-chip{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(0,0,0,0.08);background:rgba(0,0,0,0.02);color:rgba(0,0,0,0.5);transition:all .25s ease}
.csm-chip:hover{background:rgba(16,185,129,0.06);border-color:rgba(16,185,129,0.20);color:#10B981}
.csm-chip.active{background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.30);color:#10B981;font-weight:700}
```

### 3.5 — Chat input
```css
.chat-input{flex:1;background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:12px 16px;color:#111;font-size:13px;font-family:inherit;resize:none}
.chat-input:focus{outline:none;border-color:rgba(16,185,129,0.40);background:#fff}
.chat-send-btn{background:#111;border:none;border-radius:14px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:all .3s ease;flex-shrink:0}
.chat-send-btn:hover{transform:scale(1.03);box-shadow:0 4px 16px rgba(0,0,0,0.12)}
.chat-send-btn:disabled{opacity:.35;transform:none;cursor:not-allowed}
```

### 3.6 — Cartes et tips
```css
.api-banner{padding:14px 18px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.16);border-radius:14px;margin:12px 18px;display:flex;gap:12px;font-size:13px;align-items:flex-start}
.tip-card{background:rgba(0,0,0,0.01);border:1px solid rgba(0,0,0,0.06);border-radius:16px;padding:16px 18px;margin-bottom:8px;cursor:pointer;transition:all .3s ease}
.tip-card:hover{background:rgba(16,185,129,0.03);border-color:rgba(16,185,129,0.16)}
.tip-card.open{border-color:rgba(16,185,129,0.24);background:rgba(16,185,129,0.03)}
.quick-chip{padding:7px 14px;border-radius:20px;font-size:12px;cursor:pointer;background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.08);color:rgba(0,0,0,0.55);transition:all .25s ease;font-weight:500}
.quick-chip:hover{background:rgba(16,185,129,0.06);border-color:rgba(16,185,129,0.20);color:#10B981}
```

### 3.7 — Toggle switch
```css
.toggle-switch{position:relative;width:46px;height:26px;display:inline-block;flex-shrink:0}
.toggle-switch input{display:none}
.toggle-slider{position:absolute;inset:0;border-radius:26px;background:rgba(0,0,0,0.10);cursor:pointer;transition:.3s}
.toggle-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 4px rgba(0,0,0,0.12)}
input:checked+.toggle-slider{background:#10B981}
input:checked+.toggle-slider::before{transform:translateX(20px)}
```

### 3.8 — Navigation et interactions
```css
.nav-btn{transition:all .25s ease;border-radius:12px;cursor:pointer}
.nav-btn:hover{background:rgba(0,0,0,0.04)!important}
.row-item{transition:background .2s ease;cursor:pointer}
.row-item:hover{background:rgba(0,0,0,0.02)!important}
.card-lift{transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}
.card-lift:hover{transform:translateY(-1px);border-color:rgba(0,0,0,0.12)!important;box-shadow:0 4px 16px rgba(0,0,0,0.06)}
.btn-base{transition:all .3s ease;cursor:pointer;border:none;font-family:'Inter',sans-serif;font-weight:600;outline:none}
.btn-base:hover:not(:disabled){transform:translateY(-0.5px);filter:brightness(1.04)}
.btn-base:active:not(:disabled){transform:translateY(0);filter:brightness(0.96)}
.btn-base:disabled{opacity:.35;cursor:not-allowed;transform:none!important;filter:none!important}
```

### 3.9 — Animations (douces et lentes)
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

### 3.10 — Inputs
```css
input,select,textarea{outline:none;font-family:'Inter',sans-serif;-webkit-appearance:none;appearance:none}
input:focus,select:focus,textarea:focus{border-color:rgba(16,185,129,0.45)!important;box-shadow:0 0 0 3px rgba(16,185,129,0.08)!important}
```

### 3.11 — Modals
```css
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.40);backdrop-filter:blur(16px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease}
.modal-box{background:#FFFFFF;border:1px solid rgba(0,0,0,0.08);border-radius:24px;width:100%;animation:slideUp .35s ease;max-height:90vh;overflow-y:auto;box-shadow:0 24px 48px rgba(0,0,0,0.10)}
.side-panel{animation:slideInR .3s ease}
```

### 3.12 — Tabs
```css
.tab-bar{display:flex;gap:4px;background:rgba(0,0,0,0.03);border-radius:14px;padding:4px}
.tab-item{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s ease;color:rgba(0,0,0,0.40);white-space:nowrap}
.tab-item.active{background:#FFFFFF;color:#111;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.tab-item:hover:not(.active){color:#111;background:rgba(0,0,0,0.03)}
```

### 3.13 — Skeleton loader
```css
.skeleton{background:linear-gradient(90deg,rgba(0,0,0,0.03) 25%,rgba(0,0,0,0.06) 50%,rgba(0,0,0,0.03) 75%);background-size:200% 100%;animation:shimmer 2s ease-in-out infinite;border-radius:10px}
```

═══════════════════════════════════════════════════════
PARTIE 4 — GRADIENTS DANS LE JAVASCRIPT
═══════════════════════════════════════════════════════

Remplace TOUS les gradients dans le code JS/JSX :

### 4.1 — Gradient principal (teal → blue) — TOUTES les occurrences
CHERCHE ces patterns et remplace-les TOUS :
- `linear-gradient(135deg,#12CDB8,#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.blue})`
- `linear-gradient(135deg,${C.teal},#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.blue})`

### 4.2 — Gradient vert (succès/wellbeing)
- `linear-gradient(135deg,#10B981,#059669)` → `linear-gradient(135deg,${C.green},${C.teal})`

### 4.3 — Radial gradient du LoginScreen
AVANT : `radial-gradient(ellipse 80% 55% at 50% -8%,rgba(18,205,184,0.13) 0%,transparent 62%)`
APRÈS : `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(16,185,129,0.04) 0%,transparent 60%)`
(Très subtil sur fond blanc — presque invisible)

### 4.4 — Bouton Login submit
AVANT : `linear-gradient(135deg,${C.teal},#0EA5E9)` avec `color: "#070D1A"`
APRÈS : `background: "#111111"` avec `color: "#FFFFFF"`
(Bouton noir solide, pas de gradient — style minimal)

═══════════════════════════════════════════════════════
PARTIE 5 — OMBRES ULTRA-LÉGÈRES
═══════════════════════════════════════════════════════

Remplace TOUTES les box-shadow dans le code JS inline :

1. **Logo shadow** : `0 10px 36px ${C.tealGlow}` → `0 4px 12px ${C.tealGlow}`
2. **Form card shadow (LoginScreen)** : `0 48px 120px rgba(0,0,0,0.55)` → `0 8px 32px rgba(0,0,0,0.06)`
3. **Sidebar** : `1px 0 12px rgba(0,0,0,0.12)` → `1px 0 8px rgba(0,0,0,0.04)`
4. **Card glow** : `0 0 24px ${C.tealGlow}` → `0 0 16px ${C.tealGlow}`
5. **HealthBar glow** : `0 0 8px ${c}44` → `0 0 6px ${c}22`
6. **Boutons inline** : `0 6px 24px ${C.tealGlow}` → `0 4px 12px ${C.tealGlow}`
7. **Bouton login** : `0 6px 24px ${C.tealGlow}` → `0 2px 8px rgba(0,0,0,0.10)`

PRINCIPE : Toutes les ombres doivent être subtiles, à peine visibles. Aucune ombre intense ou colorée.

═══════════════════════════════════════════════════════
PARTIE 6 — POLICE
═══════════════════════════════════════════════════════

### 6.1 — Remplacer le lien Google Fonts (ligne ~9)
AVANT :
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```
APRÈS :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

### 6.2 — Remplacer TOUTES les occurrences dans le code
- `'DM Sans'` → `'Inter'` (environ 4 occurrences)
- `'DM Mono'` → `'JetBrains Mono'` (environ 12 occurrences)

═══════════════════════════════════════════════════════
PARTIE 7 — handleTheme (mise à jour)
═══════════════════════════════════════════════════════

Mettre à jour la fonction handleTheme pour utiliser les nouvelles couleurs :

```js
const handleTheme = t => {
  try{localStorage.setItem("scalyo_theme",t);}catch(e){}
  Object.assign(C, t==="light"?C_LIGHT:C_DARK);
  document.body.style.background = t==="light"?"#FFFFFF":"#0F0F0F";
  document.body.style.color = t==="light"?"#111111":"#F5F5F5";
  document.getElementById("root").style.background = t==="light"?"#FFFFFF":"#0F0F0F";
  setTheme(t);
};
```

IMPORTANT : Le thème par défaut doit être "light" (l'app est lumineuse par défaut).
Si le code initialise le thème avec `useState("dark")`, remplace par `useState("light")`.
Si `localStorage` retourne null, le défaut doit être "light".

═══════════════════════════════════════════════════════
PARTIE 8 — COULEURS HARDCODÉES DANS LE CSS
═══════════════════════════════════════════════════════

Remplace TOUTES les couleurs en dur dans le CSS (pas via les tokens JS) :

| AVANT (CSS) | APRÈS (CSS) | Pourquoi |
|-------------|-------------|----------|
| `#070D1A` | `#FFFFFF` | body background → blanc pur |
| `#E8EDF5` | `#111111` | body text → noir |
| `#0C1525` | `#FFFFFF` | modal-box background → blanc |
| `#131E35` | `#FFFFFF` | tab-item.active background → blanc |
| `#12CDB8` | `#10B981` | accent teal → vert émeraude |
| `#0EA5E9` | `#3B82F6` | accent blue → bleu vif |
| `#F04C5B` | `#EF4444` | danger → rouge standard |
| `rgba(18,205,184,...)` | `rgba(16,185,129,...)` | tous les rgba teal |
| `rgba(240,76,91,...)` | `rgba(239,68,68,...)` | tous les rgba red |
| `rgba(245,158,11,...)` | `rgba(245,158,11,...)` | amber = garder tel quel |
| `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.02)` | surfaces (mode clair) |
| `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.03)` | surfaces hover |
| `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.04)` | surfaces hover |
| `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` | borders light |
| `rgba(255,255,255,0.09)` | `rgba(0,0,0,0.08)` | scrollbar |
| `rgba(255,255,255,0.1)` | `rgba(0,0,0,0.08)` | borders |
| `rgba(255,255,255,0.18)` | `rgba(0,0,0,0.14)` | borders hi |
| `rgba(232,237,245,...)` | `rgba(0,0,0,...)` | textes secondaires |
| `rgba(7,13,26,0.9)` | `rgba(0,0,0,0.40)` | modal overlay |
| `rgba(0,0,0,0.25)` | `rgba(0,0,0,0.12)` | toggle shadow |
| `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.06)` | tab shadow |

═══════════════════════════════════════════════════════
PARTIE 9 — LANDING PAGE (LoginScreen) — MÊME DA
═══════════════════════════════════════════════════════

La landing page DOIT avoir la MÊME DA blanche et minimale que l'app :

1. **Background** : Blanc pur `#FFFFFF` avec radial gradient ultra-subtil :
   ```js
   background: `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(16,185,129,0.04) 0%,transparent 60%),${C.bg}`
   ```

2. **Logo ⚡** : Fond noir `#111` au lieu du gradient coloré :
   ```js
   background: "#111111"
   // OU garder un gradient si tu préfères :
   background: `linear-gradient(135deg,${C.teal},${C.blue})`
   ```

3. **Form card** :
   - Background : `C.bg1` (blanc)
   - Border : `1px solid ${C.border}` (gris très subtil)
   - Shadow : `0 8px 32px rgba(0,0,0,0.06)` (ombre quasi-invisible)
   - Border-radius : 24px

4. **Bouton submit** : Noir solide, pas de gradient
   ```js
   background: "#111111",
   color: "#FFFFFF",
   boxShadow: "0 2px 8px rgba(0,0,0,0.10)"
   ```

5. **Inputs** : Bordures grises ultra-subtiles, focus ring vert doux

6. **Titre "scalyo"** : Le "yo" en couleur `C.teal` (vert émeraude)

7. **Couleur du texte sur bouton login** : `color: "#FFFFFF"` (blanc sur fond noir, PAS `#070D1A`)

═══════════════════════════════════════════════════════
PARTIE 10 — SIDEBAR SCROLLABLE (CRITIQUE)
═══════════════════════════════════════════════════════

Le sidebar DOIT scroller correctement avec la souris. Voici la structure exacte à implémenter :

### 10.1 — Structure du sidebar en 3 zones

Le sidebar est un `<div>` flex-column avec `height: 100vh`. Il contient 3 zones :

1. **ZONE HAUTE (fixe)** — Logo ⚡ + "scalyo" — `flexShrink: 0`
2. **ZONE MILIEU (scrollable)** — Items de navigation — `flex: 1, overflowY: "auto", overflowX: "hidden"`
3. **ZONE BASSE (fixe)** — Settings + Avatar/Logout — `flexShrink: 0`

### 10.2 — Code de la structure sidebar

Le sidebar (`<div>` principal, actuellement ~ligne 8169) doit avoir cette structure :

```
sidebar container (flex column, height 100%)
├── zone-haute (flexShrink: 0)
│   └── logo ⚡ + "scalyo" (avec onClick toggleSidebar)
│
├── zone-milieu (flex: 1, overflowY: "auto", overflowX: "hidden")
│   └── <nav> avec tous les nav items (map sur nav[])
│
└── zone-basse (flexShrink: 0, borderTop)
    ├── bouton Settings ⚙️
    ├── avatar + nom + plan
    └── bouton Logout
```

### 10.3 — Vérification dans le code actuel

Le code actuel (lignes ~8162-8340) a déjà un sidebar avec :
- Logo en haut
- `<nav>` au milieu avec `flex:1, overflowY:"auto"`
- Settings/avatar en bas

VÉRIFIE que :
1. Le `<nav>` a bien `overflowY: "auto"` et `overflowX: "hidden"`
2. Le container sidebar a `overflow: "hidden"` pour empêcher le scroll global
3. La scrollbar dans le nav est stylée (fine, discrète)
4. Le logo (zone haute) NE scrolle PAS
5. Le settings/avatar (zone basse) NE scrolle PAS
6. Seuls les items de navigation au milieu scrollent avec la molette

### 10.4 — Scrollbar du sidebar

Ajoute ces styles spécifiques dans le `<style>` si pas déjà présents :
```css
nav::-webkit-scrollbar{width:3px}
nav::-webkit-scrollbar-track{background:transparent}
nav::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:3px}
nav::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.16)}
```

═══════════════════════════════════════════════════════
PARTIE 11 — KANBAN FONCTIONNEL (VÉRIFICATION)
═══════════════════════════════════════════════════════

Le composant KanbanView existe déjà dans le code (~lignes 7623-7785). L'entrée "Kanban" existe dans NAV_MANAGER et NAV_CSM. Le routing case "kanban" existe dans renderView().

VÉRIFIE ET CORRIGE si nécessaire :

### 11.1 — Navigation vers le Kanban
- L'item "Kanban" (📋) est bien présent dans le sidebar (NAV_MANAGER et NAV_CSM)
- Le clic sur l'item déclenche bien `setScreenPersist("kanban")`
- Le `renderView()` a bien un `case "kanban"` qui retourne le composant `KanbanView`

### 11.2 — Boutons d'ajout de tâche VISIBLES
Dans chaque colonne du Kanban, il doit y avoir un bouton "+" ou "Ajouter une tâche" CLAIREMENT VISIBLE :
- Le bouton doit avoir un bon contraste (visible sur fond blanc)
- Au clic, un formulaire inline apparaît avec : titre, description, priorité, date
- Le bouton "Enregistrer" du formulaire doit être bien visible aussi

### 11.3 — Style du Kanban adapté à la nouvelle DA
Les colonnes du Kanban doivent utiliser les nouveaux tokens de couleur :
- Colonne "À faire" → accent `C.blue` (bleu)
- Colonne "En cours" → accent `C.amber` (orange)
- Colonne "Terminé" → accent `C.green` (vert)
- Cartes : fond blanc `C.bg1`, bordure `C.border`, border-radius 14px
- Badges de priorité : Haute=rouge, Moyenne=orange, Basse=vert
- Boutons de déplacement (← →) bien visibles

### 11.4 — Drag & drop
Vérifie que le drag & drop fonctionne :
- `draggable="true"` sur chaque carte
- `onDragStart`, `onDragOver`, `onDrop` sur les colonnes
- Feedback visuel lors du drag (opacité, bordure pointillée)

═══════════════════════════════════════════════════════
PARTIE 12 — ACCENTS MULTICOLORES PAR SECTION
═══════════════════════════════════════════════════════

Pour donner un côté "playful" et coloré (comme le screenshot de référence), chaque section de navigation peut avoir un accent de couleur différent. Les emojis dans le nav font déjà ce travail, mais on peut aller plus loin :

### 12.1 — Icônes du nav avec couleurs vives (optionnel)
Quand un nav item est ACTIF, la couleur d'accent change selon la section :
- Dashboard 📊 → `C.teal` (vert émeraude)
- Portefeuille 💼 → `C.blue` (bleu)
- Kanban 📋 → `C.purple` (violet)
- Roadmap 🗺 → `C.amber` (orange)
- KPIs 📈 → `C.blue` (bleu)
- Bien-être 💚 → `C.green` (vert)
- Coach IA 🤖 → `C.purple` (violet)

Ceci est OPTIONNEL — si c'est trop complexe à implémenter proprement, garde `C.teal` pour tous les actifs. L'important est que le design global soit blanc et minimal.

═══════════════════════════════════════════════════════
PARTIE 13 — VÉRIFICATION OBLIGATOIRE
═══════════════════════════════════════════════════════

### A. Design "White & Playful" appliqué
□ C (C_DARK) : palette sombre neutre (#0F0F0F, pas bleu marine)
□ C_LIGHT : palette blanche pure (#FFFFFF)
□ CSS : TOUTES les couleurs hardcodées mises à jour (voir tableau Partie 8)
□ TOUS les gradients néon remplacés
□ TOUTES les box-shadow ultra-légères
□ TOUTES les animations lentes et douces (0.3s+)
□ Police Inter chargée et appliquée (remplace DM Sans)
□ Police JetBrains Mono chargée et appliquée (remplace DM Mono)
□ handleTheme utilise les nouvelles couleurs
□ Thème par défaut = "light" (fond blanc par défaut)

### B. Landing page = Même DA
□ LoginScreen : fond blanc pur
□ LoginScreen : ombres quasi-invisibles
□ LoginScreen : bouton submit noir solide
□ LoginScreen : même style minimal que l'app

### C. Sidebar scrollable
□ Logo ⚡ en haut FIXE (ne scrolle pas)
□ Settings + avatar en bas FIXES (ne scrollent pas)
□ Zone nav au milieu SCROLLE avec la molette de la souris
□ Scrollbar fine et discrète visible dans le nav
□ Pas de scroll sur le sidebar entier, seulement la zone nav

### D. Kanban fonctionnel
□ Item "Kanban" 📋 visible et cliquable dans le sidebar
□ Clic navigue vers l'écran Kanban
□ 3 colonnes affichées (À faire, En cours, Terminé)
□ Bouton "+" visible dans chaque colonne
□ Formulaire d'ajout de tâche fonctionnel
□ Drag & drop fonctionnel entre colonnes
□ Cartes stylées avec la nouvelle DA (fond blanc, bordures subtiles)

### E. Anti-régression — RIEN N'EST CASSÉ
□ LoginScreen : signIn, signUp, validation → FONCTIONNEL
□ Auth : onAuthStateChange, getSession, signOut → FONCTIONNEL
□ DashboardView → FONCTIONNEL
□ PortfolioView : filtrage, CRUD → FONCTIONNEL
□ ImportModal → FONCTIONNEL
□ WellbeingView → FONCTIONNEL
□ CoachIAView → FONCTIONNEL
□ KPIView → FONCTIONNEL
□ TipsView, ResourcesView, EmailStudioView → FONCTIONNEL
□ RoadmapView → FONCTIONNEL
□ UpgradeModal → FONCTIONNEL
□ SettingsView : thème, langue, API key → FONCTIONNEL
□ AccountTodoPanel → FONCTIONNEL
□ KanbanView → FONCTIONNEL
□ Thème clair/sombre switch → FONCTIONNE avec nouvelles palettes
□ I18N fr/en/kr → INTACT
□ Aucun appel Supabase modifié
□ Aucun appel Stripe modifié
□ Aucun appel Anthropic modifié

### F. Couleurs néon éradiquées
□ AUCUNE de ces couleurs ne reste : #070D1A, #0C1525, #131E35, #12CDB8, #0EA5E9
□ Toutes remplacées par blanc/noir/vert émeraude/bleu/violet

### G. Rapport final

| Élément | Statut |
|---------|--------|
| Palette blanche light | ✅/❌ |
| Palette sombre dark | ✅/❌ |
| CSS hardcodé MAJ | ✅/❌ |
| Gradients remplacés | ✅/❌ |
| Ombres ultra-légères | ✅/❌ |
| Animations douces | ✅/❌ |
| Police Inter | ✅/❌ |
| Landing page même DA | ✅/❌ |
| handleTheme MAJ | ✅/❌ |
| Sidebar scrollable | ✅/❌ |
| Kanban fonctionnel | ✅/❌ |
| Anti-régression | ✅/❌ |

Verdict : 🟢 WHITE & READY / 🟠 PRESQUE / 🔴 PAS BON

Retourne-moi le fichier COMPLET.
```
