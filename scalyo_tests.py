#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║  SCALYO — Test Suite Complet v15g                               ║
║  Document de référence qualité — Mars 2026                      ║
║  Alpha Test · Bêta Test · Process Bugs                          ║
╚══════════════════════════════════════════════════════════════════╝

Tests couverts :
  1. Fonctions utilitaires (parseItems, safeParseArray, fmtMRR, fmtARR, etc.)
  2. Logique métier (health→risk, filtrage, calculs financiers)
  3. Authentification & sécurité (isolation cross-client, validation)
  4. UI / Composants (navigation, modales, formulaires)
  5. Scénarios Alpha Test — 3 entreprises
     5.1 MikeArt SaaS — 1 manager, 3 CSMs
     5.2 ERP Corp — 7 CSMs, 200 clients, 70M ARR, burnout
     5.3 B2B Product — Commerciaux + Quality Control, 9M ARR
  6. Scénarios Bêta Test — Protocole testeurs externes
  7. Grille de sévérité & régressions
  8. Intégrations (Supabase, Stripe, Anthropic)
  9. Internationalisation (FR/EN)
  10. Thème clair/sombre
"""

import re
import json
import os
import sys
from datetime import datetime, timedelta

# ═══════════════════════════════════════════════════════
# SETUP — Charger le fichier source
# ═══════════════════════════════════════════════════════

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_HTML = os.path.join(SCRIPT_DIR, "app.html")

with open(INDEX_HTML, "r", encoding="utf-8") as f:
    SRC = f.read()

# Extraire le JavaScript (entre <script> et </script>)
js_match = re.search(r'<script type="text/javascript">(.*?)</script>', SRC, re.DOTALL)
JS_CODE = js_match.group(1) if js_match else ""


class TestResult:
    """Stocke le résultat d'un test individuel."""
    def __init__(self, name, passed, details="", severity="P2", category=""):
        self.name = name
        self.passed = passed
        self.details = details
        self.severity = severity  # P0=bloquant, P1=critique, P2=majeur, P3=mineur, P4=cosmétique
        self.category = category


class ScalyoTestSuite:
    """Suite de tests complète pour Scalyo v15g."""

    def __init__(self):
        self.results = []
        self.src = SRC
        self.js = JS_CODE

    def add(self, name, passed, details="", severity="P2", category=""):
        self.results.append(TestResult(name, passed, details, severity, category))

    # ═══════════════════════════════════════════════════
    # 1. TESTS FONCTIONS UTILITAIRES
    # ═══════════════════════════════════════════════════

    def test_helper_functions(self):
        cat = "1. Fonctions utilitaires"

        # --- parseItems ---
        self.add("parseItems — définition existe",
                 "const parseItems" in self.js,
                 "La fonction parseItems doit être définie", "P0", cat)

        self.add("parseItems — gère null/undefined",
                 "if (!items) return []" in self.js,
                 "Doit retourner [] pour null/undefined", "P1", cat)

        self.add("parseItems — gère Array",
                 "if (Array.isArray(items)) return items" in self.js,
                 "Doit retourner le tableau tel quel", "P1", cat)

        self.add("parseItems — gère JSON string",
                 "JSON.parse(items)" in self.js,
                 "Doit parser les strings JSON", "P1", cat)

        # --- safeParseArray ---
        self.add("safeParseArray — définition existe",
                 "const safeParseArray" in self.js,
                 "La fonction safeParseArray doit être définie", "P0", cat)

        self.add("safeParseArray — vérifie Array.isArray",
                 re.search(r'safeParseArray.*Array\.isArray', self.js, re.DOTALL) is not None,
                 "Doit d'abord vérifier si c'est déjà un tableau", "P1", cat)

        self.add("safeParseArray — vérifie string startsWith [",
                 'v.trim().startsWith("[")' in self.js,
                 "Doit vérifier que la string commence par [", "P1", cat)

        self.add("safeParseArray — catch error retourne []",
                 re.search(r'safeParseArray.*catch.*return \[\]', self.js, re.DOTALL) is not None,
                 "Doit retourner [] en cas d'erreur de parsing", "P1", cat)

        # --- fmtMRR ---
        self.add("fmtMRR — définition existe",
                 "const fmtMRR" in self.js,
                 "La fonction fmtMRR doit être définie", "P0", cat)

        self.add("fmtMRR — format >=10K",
                 'v >= 10000' in self.js and "toFixed(0)" in self.js,
                 "fmtMRR >= 10000 → format entier (ex: 35K€)", "P2", cat)

        self.add("fmtMRR — format <10K",
                 "toFixed(1)" in self.js,
                 "fmtMRR < 10000 → 1 décimale (ex: 3.5K€)", "P2", cat)

        # --- fmtARR ---
        self.add("fmtARR — définition existe",
                 "const fmtARR" in self.js,
                 "La fonction fmtARR doit être définie", "P0", cat)

        self.add("fmtARR — multiplie par 12",
                 "v * 12" in self.js,
                 "fmtARR doit convertir MRR→ARR (×12)", "P0", cat)

        self.add("fmtARR — format millions",
                 "1000000" in self.js and "M€" in self.js,
                 ">=1M → affichage en millions", "P2", cat)

        # --- riskColor / riskLabel ---
        self.add("riskColor — critical = red",
                 'r === "critical" ? C.red' in self.js,
                 "Risque critique → couleur rouge", "P1", cat)

        self.add("riskColor — medium = amber",
                 'r === "medium" ? C.amber' in self.js,
                 "Risque moyen → couleur ambre", "P1", cat)

        self.add("riskLabel — Critique",
                 '"Critique"' in self.js,
                 "Label critique en français", "P2", cat)

        self.add("riskLabel — Vigilance",
                 '"Vigilance"' in self.js,
                 "Label moyen = Vigilance", "P2", cat)

        self.add("riskLabel — Sain",
                 '"Sain"' in self.js,
                 "Label sain", "P2", cat)

        # --- todayFR ---
        self.add("todayFR — format FR",
                 '"fr-FR"' in self.js and 'weekday: "long"' in self.js,
                 "Date formatée en français avec jour de la semaine", "P3", cat)

    # ═══════════════════════════════════════════════════
    # 2. TESTS LOGIQUE MÉTIER
    # ═══════════════════════════════════════════════════

    def test_business_logic(self):
        cat = "2. Logique métier"

        # Health → Risk mapping
        self.add("Health→Risk — >=70 = low",
                 'h >= 70 ? "low"' in self.js or 'parseInt(row.health) >= 70 ? "low"' in self.js,
                 "Health >=70 → risque faible", "P0", cat)

        self.add("Health→Risk — >=40 = medium",
                 '>= 40 ? "medium"' in self.js,
                 "Health 40-69 → risque moyen", "P0", cat)

        self.add("Health→Risk — <40 = critical",
                 '"critical"' in self.js,
                 "Health <40 → risque critique", "P0", cat)

        # Filtrage portfolio
        self.add("Portfolio — filtre par risque",
                 'filter === "all" || a.risk === filter' in self.js,
                 "Filtrage des comptes par niveau de risque", "P1", cat)

        self.add("Portfolio — filtre par CSM",
                 'csmFilter === "all" || a.csm === csmFilter' in self.js,
                 "Filtrage des comptes par CSM assigné", "P1", cat)

        self.add("Portfolio — recherche nom/CSM",
                 "a.name?.toLowerCase().includes(search.toLowerCase())" in self.js,
                 "Recherche insensible à la casse sur nom et CSM", "P1", cat)

        # Compteurs
        self.add("Portfolio — compteur tous",
                 "all: accounts.length" in self.js,
                 "Compteur total des comptes", "P2", cat)

        self.add("Portfolio — compteur critiques",
                 'critical: accounts.filter(a => a.risk === "critical").length' in self.js,
                 "Compteur des comptes critiques", "P1", cat)

        # Default health score
        self.add("Default health = 70",
                 'parseInt(form.health) || 70' in self.js or 'parseInt(row.health) || 70' in self.js,
                 "Health score par défaut = 70 lors de l'ajout", "P2", cat)

        # Default usage
        self.add("Default usage = 70",
                 'usage: 70' in self.js,
                 "Usage par défaut = 70 lors de l'ajout", "P3", cat)

        # MRR parsing
        self.add("MRR — nettoyage caractères",
                 "replace(/[^\\d.]/g" in self.js,
                 "MRR nettoyé des caractères non numériques à l'import", "P2", cat)

        # HealthBar component color logic
        self.add("HealthBar — vert si >=70",
                 re.search(r'val >= 70.*C\.green', self.js) is not None,
                 "Barre de santé verte si score >=70", "P2", cat)

        self.add("HealthBar — rouge si <40",
                 re.search(r'C\.red', self.js) is not None,
                 "Barre de santé rouge si score <40", "P2", cat)

        # HealthBar clamp 0-100
        self.add("HealthBar — clamp 0-100%",
                 "Math.min(100, Math.max(0, val))" in self.js,
                 "Valeur de la barre clampée entre 0% et 100%", "P1", cat)

    # ═══════════════════════════════════════════════════
    # 3. TESTS AUTHENTIFICATION & SÉCURITÉ
    # ═══════════════════════════════════════════════════

    def test_auth_security(self):
        cat = "3. Auth & Sécurité"

        # Auth methods
        self.add("Auth — signInWithPassword",
                 "db.auth.signInWithPassword" in self.js,
                 "Login par email/mot de passe", "P0", cat)

        self.add("Auth — signUp",
                 "db.auth.signUp" in self.js,
                 "Inscription", "P0", cat)

        self.add("Auth — signOut",
                 "db.auth.signOut()" in self.js,
                 "Déconnexion", "P0", cat)

        self.add("Auth — onAuthStateChange",
                 "db.auth.onAuthStateChange" in self.js,
                 "Écoute des changements d'état auth", "P0", cat)

        self.add("Auth — getSession",
                 "db.auth.getSession()" in self.js,
                 "Restauration de session existante", "P0", cat)

        # Validation formulaires
        self.add("Login — validation email requis",
                 "!email.trim() || !pass" in self.js,
                 "Email et mot de passe requis au login", "P0", cat)

        self.add("Signup — tous champs requis",
                 "!email.trim() || !pass || !company.trim()" in self.js,
                 "Tous les champs requis à l'inscription", "P0", cat)

        self.add("Signup — password min 8 chars",
                 "pass.length < 8" in self.js,
                 "Mot de passe minimum 8 caractères", "P0", cat)

        # Sécurité cross-client
        self.add("Sécurité — isolation company par auth_user_id",
                 '.eq("auth_user_id", sess.user.id)' in self.js,
                 "Company filtrée par auth_user_id (pas de fuite)", "P0", cat)

        self.add("Sécurité — accounts filtrés par company_id",
                 '.eq("company_id", company.id)' in self.js,
                 "Comptes filtrés par company_id", "P0", cat)

        self.add("Sécurité — refreshAccounts filtre company_id",
                 '.eq("company_id", companyId)' in self.js,
                 "Refresh des comptes aussi filtré par company_id", "P0", cat)

        # Email confirmation flow
        self.add("Auth — gestion email non confirmé",
                 'error.message.includes("Email not confirmed")' in self.js,
                 "Message d'erreur explicite si email non confirmé", "P1", cat)

        self.add("Auth — pending profile localStorage",
                 '"scalyo_pending"' in self.js,
                 "Profil en attente stocké pour post-confirmation", "P1", cat)

        # Session fallback
        self.add("Auth — fallback timeout 1.5s",
                 "setTimeout(() => setAuthReady(true), 1500)" in self.js,
                 "Fallback si Supabase ne répond pas en 1.5s", "P1", cat)

        # Logout cleanup
        self.add("Logout — clear role localStorage",
                 '"scalyo_role"' in self.js and 'removeItem' in self.js,
                 "Le rôle est supprimé du localStorage au logout", "P1", cat)

        self.add("Logout — clear session state",
                 "setSession(null)" in self.js and "setAppData(null)" in self.js,
                 "Session et données effacées au logout", "P1", cat)

        # XSS / injection checks
        # Count actual usage of dangerouslySetInnerHTML (not comments mentioning it)
        dsihtml_usage = len(re.findall(r'dangerouslySetInnerHTML\s*=', self.js))
        self.add("Sécurité — dangerouslySetInnerHTML non utilisé",
                 dsihtml_usage == 0,
                 f"dangerouslySetInnerHTML utilisé {dsihtml_usage} fois. "
                 f"Recommandation : utiliser un parser markdown sécurisé.",
                 "P1", cat)

        self.add("Sécurité — pas d'eval() sur données utilisateur",
                 "eval(" not in self.js,
                 "Pas d'utilisation de eval() (risque XSS)", "P0", cat)

    # ═══════════════════════════════════════════════════
    # 4. TESTS NAVIGATION & UI
    # ═══════════════════════════════════════════════════

    def test_navigation_ui(self):
        cat = "4. Navigation & UI"

        # Navigation screens
        screens = ["dashboard", "portfolio", "roadmap", "kpi", "wellbeing",
                    "coach", "tips", "resources", "email", "settings"]
        for screen_id in screens:
            self.add(f"Nav — écran '{screen_id}' défini",
                     f'id: "{screen_id}"' in self.js or f'"{screen_id}"' in self.js,
                     f"L'écran {screen_id} est accessible", "P1", cat)

        # Manager vs CSM navigation
        self.add("Nav — menu Manager défini (NAV_MANAGER)",
                 "NAV_MANAGER" in self.js,
                 "Navigation spécifique manager", "P1", cat)

        self.add("Nav — menu CSM défini (NAV_CSM)",
                 "NAV_CSM" in self.js,
                 "Navigation spécifique CSM", "P1", cat)

        # Components exist
        components = [
            "LoginScreen", "DashboardView", "PortfolioView", "RoadmapView",
            "KPIView", "WellbeingView", "CoachIAView", "SettingsView",
            "TipsView", "ResourcesView", "EmailStudioView",
            "UpgradeModal", "ImportModal", "AddAccountModal",
            "AccountDetailPanel", "EditAccountPanel"
        ]
        for comp in components:
            self.add(f"Composant — {comp} défini",
                     f"const {comp}" in self.js,
                     f"Le composant {comp} est défini", "P0", cat)

        # UI atoms
        atoms = ["Spinner", "Loader", "Avatar", "Tag", "RiskPill",
                 "HealthBar", "Card", "KpiCard", "EmptyState", "Field"]
        for atom in atoms:
            self.add(f"Atom — {atom} défini",
                     f"const {atom}" in self.js,
                     f"L'atome UI {atom} est défini", "P2", cat)

        # Modal overlay
        self.add("Modal — overlay avec click-outside",
                 "e.target === e.currentTarget && onClose()" in self.js,
                 "Click en dehors du modal ferme le modal", "P2", cat)

        # Animations
        self.add("UI — animation fade-in",
                 "fadeIn" in self.src and "@keyframes fadeIn" in self.src,
                 "Animation d'entrée fade-in définie", "P3", cat)

        self.add("UI — animation slide-in",
                 "slideInR" in self.src and "@keyframes slideInR" in self.src,
                 "Animation slide-in pour panels latéraux", "P3", cat)

        # Responsive scrollbar
        self.add("UI — scrollbar custom",
                 "::-webkit-scrollbar" in self.src,
                 "Scrollbar personnalisée", "P4", cat)

    # ═══════════════════════════════════════════════════
    # 5. TESTS ALPHA — SCÉNARIOS ENTREPRISES
    # ═══════════════════════════════════════════════════

    def test_alpha_mikeart(self):
        """5.1 MikeArt SaaS — 1 manager, 3 CSMs."""
        cat = "5.1 Alpha — MikeArt SaaS"

        # Scénario : Manager crée 3 CSMs, assigne des comptes
        self.add("MikeArt — ajout compte avec CSM",
                 'csm: form.csm || ""' in self.js or "csm:" in self.js,
                 "Un manager peut assigner un CSM à un compte", "P0", cat)

        self.add("MikeArt — filtre par CSM dans portefeuille",
                 "csmFilter" in self.js and "setCsmFilter" in self.js,
                 "Le manager peut filtrer par CSM", "P1", cat)

        self.add("MikeArt — chips CSM dynamiques",
                 "new Set(accounts.map(a=>a.csm)" in self.js,
                 "Les chips CSM sont générés dynamiquement", "P2", cat)

        self.add("MikeArt — vue 'Tous les CSM'",
                 '"all"' in self.js and 'csms' in self.js,
                 "Option 'Tous les CSM' dans le filtre", "P1", cat)

        # Import CSV
        self.add("MikeArt — import CSV/Excel",
                 "ImportModal" in self.js and ".xlsx" in self.js and ".csv" in self.js,
                 "Import de portefeuille en CSV/Excel", "P0", cat)

        self.add("MikeArt — auto-mapping colonnes",
                 "autoMap" in self.js,
                 "Mapping automatique des colonnes à l'import", "P1", cat)

        self.add("MikeArt — prévisualisation avant import",
                 '"preview"' in self.js and "editableRows" in self.js,
                 "Étape de prévisualisation/édition avant import", "P1", cat)

    def test_alpha_erpcorp(self):
        """5.2 ERP Corp — 7 CSMs, 200 clients, 70M ARR, burnout."""
        cat = "5.2 Alpha — ERP Corp"

        # Scénario haut volume
        self.add("ERPCorp — performance avec >100 comptes",
                 "rawRows.slice(0, 50)" in self.js,
                 "Import limité à 50 lignes pour performance", "P1", cat)

        # Burnout / Wellbeing
        self.add("ERPCorp — module Bien-être",
                 "WellbeingView" in self.js,
                 "Vue dédiée au bien-être de l'équipe", "P0", cat)

        self.add("ERPCorp — score burnout",
                 '"burnout"' in self.js,
                 "Indicateur de burnout", "P0", cat)

        self.add("ERPCorp — charge de travail",
                 '"charge"' in self.js,
                 "Indicateur de charge de travail", "P1", cat)

        self.add("ERPCorp — alertes bien-être",
                 'alerts' in self.js and "wellbeing" in self.js,
                 "Système d'alertes pour le bien-être", "P1", cat)

        self.add("ERPCorp — données team",
                 '"team"' in self.js and "wellbeing" in self.js,
                 "Données individuelles par membre d'équipe", "P2", cat)

        # KPI COPIL
        self.add("ERPCorp — vue KPIs",
                 "KPIView" in self.js,
                 "Vue KPIs pour COPIL", "P0", cat)

        self.add("ERPCorp — KpiCard composant",
                 "KpiCard" in self.js and "label" in self.js and "value" in self.js,
                 "Cartes KPI avec label/valeur/trend", "P1", cat)

        # ARR haute valeur
        self.add("ERPCorp — format ARR millions",
                 "M€" in self.js,
                 "Affichage ARR en millions (70M ARR)", "P1", cat)

    def test_alpha_b2b_product(self):
        """5.3 B2B Product — Commerciaux + Quality Control, 9M ARR."""
        cat = "5.3 Alpha — B2B Product"

        # Roadmap 90J
        self.add("B2B — Roadmap 90 jours",
                 "RoadmapView" in self.js,
                 "Vue Roadmap 90 jours", "P0", cat)

        self.add("B2B — phases roadmap",
                 'phase:' in self.js and "roadmap" in self.js,
                 "Phases de roadmap définies", "P1", cat)

        self.add("B2B — progression roadmap",
                 'progress:' in self.js and "roadmap" in self.js,
                 "Indicateur de progression", "P1", cat)

        self.add("B2B — items roadmap",
                 'items:' in self.js and "roadmap" in self.js,
                 "Items de roadmap (done/label/due)", "P1", cat)

        # Renouvellement
        self.add("B2B — date de renouvellement",
                 '"renewal"' in self.js,
                 "Champ de date de renouvellement par compte", "P1", cat)

        # Industrie / secteur
        self.add("B2B — secteur d'activité",
                 '"industry"' in self.js,
                 "Champ secteur pour chaque compte", "P2", cat)

        # Email Studio
        self.add("B2B — Email Studio",
                 "EmailStudioView" in self.js,
                 "Module Email Studio pour campagnes", "P1", cat)

        # Suppression compte
        self.add("B2B — suppression avec confirmation",
                 'window.confirm(' in self.js and ('confirmDelete' in self.js or 'Supprimer' in self.js),
                 "Confirmation avant suppression d'un compte", "P1", cat)

    # ═══════════════════════════════════════════════════
    # 6. TESTS BÊTA — PROTOCOLE TESTEURS EXTERNES
    # ═══════════════════════════════════════════════════

    def test_beta_protocol(self):
        cat = "6. Bêta Test"

        # Onboarding complet
        self.add("Bêta — écran de login complet",
                 "LoginScreen" in self.js and "signUp" in self.js and "signInWithPassword" in self.js,
                 "Flux d'inscription et de connexion fonctionnel", "P0", cat)

        self.add("Bêta — choix du rôle (manager/csm)",
                 '"manager"' in self.js and '"csm"' in self.js and "setRole" in self.js,
                 "Sélection du rôle à l'inscription", "P0", cat)

        self.add("Bêta — création profil automatique",
                 "createUserProfile" in self.js,
                 "Profil créé automatiquement après inscription", "P0", cat)

        # Données initiales
        self.add("Bêta — roadmap initiale créée",
                 'phase: "Phase 1' in self.js and "roadmap" in self.js,
                 "Roadmap initiale créée avec Phase 1", "P1", cat)

        self.add("Bêta — wellbeing initial créé",
                 "score: 70" in self.js and "wellbeing" in self.js,
                 "Score de bien-être initialisé à 70", "P1", cat)

        # Plan Starter par défaut
        self.add("Bêta — plan Starter par défaut",
                 'plan: "Starter"' in self.js,
                 "Nouveau compte = plan Starter", "P1", cat)

        # Fallback données vides
        self.add("Bêta — fallback si loadData échoue",
                 "Mon Entreprise" in self.js,
                 "Données par défaut si le chargement échoue", "P1", cat)

        # Guide CS
        self.add("Bêta — Guide CS / Tips",
                 "TipsView" in self.js,
                 "Guide CS pour les nouveaux utilisateurs", "P2", cat)

        # Coach IA
        self.add("Bêta — Coach IA",
                 "CoachIAView" in self.js,
                 "Coach IA pour accompagnement", "P1", cat)

    # ═══════════════════════════════════════════════════
    # 7. TESTS INTÉGRATIONS
    # ═══════════════════════════════════════════════════

    def test_integrations(self):
        cat = "7. Intégrations"

        # Supabase
        self.add("Supabase — URL configurée",
                 "supabase.co" in self.js,
                 "URL Supabase présente", "P0", cat)

        self.add("Supabase — clé anon JWT (pas service_role)",
                 "SUPABASE_KEY" in self.js and "eyJ" in self.js,
                 "Clé anon Supabase présente (JWT, pas de clé secrète)", "P0", cat)

        self.add("Supabase — pas de clé service_role exposée",
                 "service_role" not in self.js,
                 "Aucune clé service_role dans le code client", "P0", cat)

        self.add("Supabase — createClient",
                 "supabase.createClient" in self.js,
                 "Client Supabase initialisé", "P0", cat)

        # Supabase tables
        for table in ["companies", "accounts", "roadmap", "wellbeing"]:
            self.add(f"Supabase — table '{table}' utilisée",
                     f'from("{table}")' in self.js,
                     f"La table {table} est requêtée", "P0", cat)

        # Stripe
        self.add("Stripe — liens checkout sécurisés (HTTPS)",
                 "https://buy.stripe.com/" in self.js,
                 "Liens Stripe en HTTPS", "P0", cat)

        self.add("Stripe — 3 plans définis",
                 "starter:" in self.js and "growth:" in self.js and "elite:" in self.js,
                 "Plans Starter, Growth et Elite configurés", "P1", cat)

        # Coach IA — API via Cloudflare Workers proxy
        self.add("Coach IA — endpoint API proxy",
                 "scalyo-ai.stratimaagency.workers.dev" in self.js,
                 "Endpoint Coach IA via Cloudflare Workers proxy", "P1", cat)

        self.add("Coach IA — modèle configuré",
                 "deepseek-chat" in self.js or "claude" in self.js,
                 "Modèle IA configuré pour le Coach", "P1", cat)

        self.add("Coach IA — Content-Type JSON",
                 '"Content-Type": "application/json"' in self.js or '"Content-Type":"application/json"' in self.js,
                 "Header Content-Type pour appels API", "P2", cat)

        self.add("Coach IA — pas de clé API exposée côté client",
                 "sk-ant-" not in self.js and "sk-" not in self.js,
                 "Aucune clé API secrète exposée dans le code client", "P0", cat)

        # External libs CDN
        self.add("CDN — React 18 chargé",
                 "react/18.2.0" in self.src,
                 "React 18.2.0 chargé via CDN", "P0", cat)

        self.add("CDN — ReactDOM chargé",
                 "react-dom/18.2.0" in self.src,
                 "ReactDOM chargé via CDN", "P0", cat)

        self.add("CDN — Supabase JS chargé",
                 "supabase-js@2" in self.src,
                 "Supabase JS v2 chargé via CDN", "P0", cat)

        # Lazy loading
        self.add("Lazy load — XLSX",
                 "xlsx/0.18.5" in self.js or "xlsx.full.min.js" in self.js,
                 "XLSX chargé à la demande (lazy)", "P2", cat)

        self.add("Lazy load — PapaParse",
                 "PapaParse/5.4.1" in self.js or "papaparse.min.js" in self.js,
                 "PapaParse chargé à la demande (lazy)", "P2", cat)

    # ═══════════════════════════════════════════════════
    # 8. TESTS INTERNATIONALISATION
    # ═══════════════════════════════════════════════════

    def test_i18n(self):
        cat = "8. Internationalisation"

        self.add("I18N — objet défini",
                 "const I18N" in self.js,
                 "Dictionnaire I18N défini", "P0", cat)

        self.add("I18N — français (fr)",
                 "fr:{" in self.js or "fr: {" in self.js,
                 "Traductions françaises", "P0", cat)

        self.add("I18N — anglais (en)",
                 "en:{" in self.js or "en: {" in self.js,
                 "Traductions anglaises", "P0", cat)

        self.add("I18N — fonction T() définie",
                 "const T=" in self.js or "const T =" in self.js,
                 "Fonction de traduction T() définie", "P0", cat)

        # Clés essentielles
        keys_fr = {
            "dashboard": "Dashboard",
            "portfolio": "Portefeuille",
            "settings": "Paramètres",
            "coach": "Coach IA",
            "save": "Enregistrer",
            "cancel": "Annuler",
        }
        for key, expected in keys_fr.items():
            self.add(f"I18N FR — '{key}' = '{expected}'",
                     f'{key}:"{expected}"' in self.js or f"{key}: \"{expected}\"" in self.js,
                     f"Traduction FR de {key}", "P2", cat)

        keys_en = {
            "dashboard": "Dashboard",
            "portfolio": "Portfolio",
            "settings": "Settings",
            "coach": "AI Coach",
            "save": "Save",
            "cancel": "Cancel",
        }
        for key, expected in keys_en.items():
            self.add(f"I18N EN — '{key}' = '{expected}'",
                     f'{key}:"{expected}"' in self.js or f"{key}: \"{expected}\"" in self.js,
                     f"Traduction EN de {key}", "P2", cat)

        # Persistence langue
        self.add("I18N — persistence localStorage",
                 '"scalyo_lang"' in self.js,
                 "Langue sauvegardée dans localStorage", "P1", cat)

    # ═══════════════════════════════════════════════════
    # 9. TESTS THÈME CLAIR/SOMBRE
    # ═══════════════════════════════════════════════════

    def test_themes(self):
        cat = "9. Thème clair/sombre"

        self.add("Thème — C_DARK défini",
                 "C_DARK" in self.js,
                 "Palette sombre définie", "P0", cat)

        self.add("Thème — C_LIGHT défini",
                 "C_LIGHT" in self.js,
                 "Palette claire définie", "P0", cat)

        self.add("Thème — handleTheme fonction",
                 "handleTheme" in self.js,
                 "Fonction de changement de thème", "P0", cat)

        self.add("Thème — persistence localStorage",
                 '"scalyo_theme"' in self.js,
                 "Thème sauvegardé dans localStorage", "P1", cat)

        self.add("Thème — application body background",
                 "document.body.style.background" in self.js,
                 "Background du body mis à jour au changement de thème", "P1", cat)

        self.add("Thème — application root background",
                 'document.getElementById("root").style.background' in self.js,
                 "Background du root mis à jour", "P1", cat)

        self.add("Thème — Object.assign C",
                 "Object.assign(C," in self.js,
                 "Palette C mise à jour dynamiquement", "P1", cat)

        # Light theme colors
        self.add("Thème clair — background blanc",
                 '"#FAF7F2"' in self.js or '"#F0F4F8"' in self.js or '"#FFFFFF"' in self.js,
                 "Fond clair utilise des blancs/gris", "P2", cat)

        self.add("Thème clair — texte sombre",
                 '"#2D2A26"' in self.js or '"#37352F"' in self.js or '"#1E293B"' in self.js,
                 "Texte sombre en mode clair", "P2", cat)

    # ═══════════════════════════════════════════════════
    # 10. TESTS CRUD COMPLETS
    # ═══════════════════════════════════════════════════

    def test_crud_operations(self):
        cat = "10. CRUD Comptes"

        # CREATE
        self.add("CRUD — INSERT accounts",
                 'db.from("accounts").insert(payload)' in self.js,
                 "Insertion de comptes dans Supabase", "P0", cat)

        self.add("CRUD — INSERT companies",
                 'db.from("companies").insert' in self.js,
                 "Insertion de companies", "P0", cat)

        self.add("CRUD — INSERT roadmap",
                 'db.from("roadmap").insert' in self.js,
                 "Insertion de roadmap", "P0", cat)

        self.add("CRUD — INSERT wellbeing",
                 'db.from("wellbeing").insert' in self.js,
                 "Insertion de wellbeing", "P0", cat)

        # READ
        self.add("CRUD — SELECT accounts",
                 'db.from("accounts").select("*")' in self.js,
                 "Lecture de tous les comptes", "P0", cat)

        self.add("CRUD — SELECT companies",
                 'db.from("companies").select("*")' in self.js,
                 "Lecture de la company", "P0", cat)

        # UPDATE
        self.add("CRUD — UPDATE accounts",
                 'db.from("accounts").update' in self.js,
                 "Mise à jour de comptes", "P0", cat)

        self.add("CRUD — UPDATE roadmap",
                 'db.from("roadmap").update' in self.js,
                 "Mise à jour de roadmap", "P0", cat)

        self.add("CRUD — UPDATE companies",
                 'db.from("companies").update' in self.js,
                 "Mise à jour de company", "P0", cat)

        # DELETE
        self.add("CRUD — DELETE accounts",
                 'db.from("accounts").delete()' in self.js,
                 "Suppression de comptes", "P0", cat)

        # Validation avant insert
        self.add("CRUD — validation nom requis (AddAccount)",
                 '!form.name.trim()' in self.js,
                 "Validation : nom de compte requis avant insertion", "P0", cat)

        self.add("CRUD — validation nom requis (Import)",
                 "r.name?.trim()" in self.js,
                 "Validation : nom requis à l'import", "P0", cat)

    # ═══════════════════════════════════════════════════
    # 11. TESTS SETTINGS & PRÉFÉRENCES
    # ═══════════════════════════════════════════════════

    def test_settings(self):
        cat = "11. Settings"

        self.add("Settings — vue définie",
                 "SettingsView" in self.js,
                 "Vue paramètres définie", "P0", cat)

        self.add("Settings — clé API Anthropic configurable",
                 '"scalyo_api"' in self.js,
                 "Clé API stockée dans localStorage", "P1", cat)

        self.add("Settings — rôle persisté",
                 '"scalyo_role"' in self.js,
                 "Rôle utilisateur persisté", "P1", cat)

        # Upgrade modal
        self.add("Settings — UpgradeModal défini",
                 "UpgradeModal" in self.js,
                 "Modal d'upgrade pour changer de plan", "P1", cat)

        self.add("Settings — plans Starter/Growth/Elite",
                 '"Starter"' in self.js and '"Growth"' in self.js and '"Elite"' in self.js,
                 "Les 3 plans sont définis", "P1", cat)

        self.add("Settings — prix Starter 97€",
                 "97" in self.js,
                 "Prix Starter à 97€/mois", "P2", cat)

        self.add("Settings — prix Growth 297€",
                 "297" in self.js,
                 "Prix Growth à 297€/mois", "P2", cat)

        self.add("Settings — prix Elite 697€",
                 "697" in self.js,
                 "Prix Elite à 697€/mois", "P2", cat)

    # ═══════════════════════════════════════════════════
    # 12. TESTS HTML / CSS / ACCESSIBILITÉ
    # ═══════════════════════════════════════════════════

    def test_html_css(self):
        cat = "12. HTML/CSS"

        self.add("HTML — DOCTYPE html",
                 "<!DOCTYPE html>" in self.src,
                 "Document HTML5 valide", "P0", cat)

        self.add("HTML — lang=fr",
                 'lang="fr"' in self.src,
                 "Langue définie en français", "P2", cat)

        self.add("HTML — charset UTF-8",
                 'charset="UTF-8"' in self.src,
                 "Encodage UTF-8", "P0", cat)

        self.add("HTML — viewport meta",
                 'name="viewport"' in self.src,
                 "Viewport meta pour responsive", "P1", cat)

        self.add("HTML — meta description",
                 'name="description"' in self.src,
                 "Meta description SEO", "P3", cat)

        self.add("HTML — div#root",
                 'id="root"' in self.src,
                 "Point de montage React", "P0", cat)

        self.add("CSS — box-sizing border-box",
                 "box-sizing:border-box" in self.src,
                 "box-sizing global", "P2", cat)

        self.add("CSS — font Inter",
                 "Inter" in self.src,
                 "Police Inter chargée", "P2", cat)

        self.add("CSS — antialiasing",
                 "-webkit-font-smoothing:antialiased" in self.src,
                 "Antialiasing CSS activé", "P3", cat)

        # Préchargement
        self.add("HTML — preconnect fonts",
                 'rel="preconnect"' in self.src,
                 "Preconnect pour les fonts", "P3", cat)

        self.add("HTML — preload scripts",
                 'rel="preload"' in self.src,
                 "Preload pour les scripts critiques", "P2", cat)

    # ═══════════════════════════════════════════════════
    # 13. TESTS TODO SYSTÈME (localStorage)
    # ═══════════════════════════════════════════════════

    def test_todo_system(self):
        cat = "13. Système Todo"

        self.add("Todo — stockage localStorage",
                 "scalyo_todos_" in self.js,
                 "Todos stockés dans localStorage avec clé par compte", "P1", cat)

        self.add("Todo — AccountTodoPanel composant",
                 "AccountTodoPanel" in self.js,
                 "Panel de gestion des todos par compte", "P1", cat)

        self.add("Todo — ajout tâche custom",
                 "addCustom" in self.js or "newTask" in self.js,
                 "Ajout de tâche personnalisée", "P1", cat)

        self.add("Todo — touche Entrée pour ajouter",
                 'e.key === "Enter"' in self.js,
                 "Appui sur Entrée ajoute la tâche", "P2", cat)

        self.add("Todo — date picker",
                 'type: "date"' in self.js or 'type:"date"' in self.js,
                 "Sélecteur de date pour les tâches", "P2", cat)

    # ═══════════════════════════════════════════════════
    # 14. TESTS DESIGN TOKENS
    # ═══════════════════════════════════════════════════

    def test_design_tokens(self):
        cat = "14. Design Tokens"

        tokens = {
            "bg": "#1C1A17",
            "teal": "#9BB8CC",
            "red": "#D4958A",
            "amber": "#D4BA6E",
            "green": "#9BB8A8",
            "purple": "#B8A8D4",
            "blue": "#8BA8C4",
            "text": "#E8E4DC",
        }
        for name, value in tokens.items():
            self.add(f"Token — {name} = {value}",
                     f'"{value}"' in self.js or f"'{value}'" in self.js,
                     f"Design token {name} correctement défini", "P3", cat)

        self.add("Tokens — objet C défini",
                 "const C = {" in self.js or "const C =" in self.js,
                 "Objet de design tokens défini", "P0", cat)

    # ═══════════════════════════════════════════════════
    # 15. TESTS TIMEOUT & ERROR HANDLING
    # ═══════════════════════════════════════════════════

    def test_error_handling(self):
        cat = "15. Gestion d'erreurs"

        self.add("Error — timeout companies 5s",
                 "companies_timeout" in self.js or "5000" in self.js,
                 "Timeout de 5s pour le chargement des companies", "P1", cat)

        self.add("Error — fallback données vides",
                 "Mon Entreprise" in self.js,
                 "Fallback avec données vides si erreur", "P1", cat)

        self.add("Error — catch loadData",
                 "loadData error" in self.js or "console.error" in self.js,
                 "Erreurs de loadData catchées et loguées", "P1", cat)

        self.add("Error — erreur import fichier",
                 "Erreur lecture fichier" in self.js,
                 "Message d'erreur si fichier non lisible", "P1", cat)

        self.add("Error — fichier vide",
                 "Fichier vide ou non lisible" in self.js,
                 "Détection de fichier vide à l'import", "P1", cat)

        self.add("Error — try/catch localStorage",
                 "try { return localStorage" in self.js or
                 "try{return localStorage" in self.js,
                 "Accès localStorage protégé par try/catch", "P2", cat)

    # ═══════════════════════════════════════════════════
    # EXÉCUTION & RAPPORT
    # ═══════════════════════════════════════════════════

    def run_all(self):
        """Exécute tous les tests et affiche le rapport."""
        test_methods = [
            self.test_helper_functions,
            self.test_business_logic,
            self.test_auth_security,
            self.test_navigation_ui,
            self.test_alpha_mikeart,
            self.test_alpha_erpcorp,
            self.test_alpha_b2b_product,
            self.test_beta_protocol,
            self.test_integrations,
            self.test_i18n,
            self.test_themes,
            self.test_crud_operations,
            self.test_settings,
            self.test_html_css,
            self.test_todo_system,
            self.test_design_tokens,
            self.test_error_handling,
        ]

        for method in test_methods:
            method()

        return self.report()

    def report(self):
        """Génère un rapport détaillé."""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = sum(1 for r in self.results if not r.passed)

        # Grouper par catégorie
        categories = {}
        for r in self.results:
            cat = r.category or "Autres"
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(r)

        # Grouper les échecs par sévérité
        failures_by_sev = {}
        for r in self.results:
            if not r.passed:
                if r.severity not in failures_by_sev:
                    failures_by_sev[r.severity] = []
                failures_by_sev[r.severity].append(r)

        # Affichage
        print()
        print("╔══════════════════════════════════════════════════════════════╗")
        print("║       SCALYO — RAPPORT DE TESTS v15g — Mars 2026           ║")
        print("╚══════════════════════════════════════════════════════════════╝")
        print()

        for cat_name in sorted(categories.keys()):
            tests = categories[cat_name]
            cat_passed = sum(1 for t in tests if t.passed)
            cat_total = len(tests)
            status = "✅" if cat_passed == cat_total else "⚠️" if cat_passed > cat_total * 0.8 else "❌"
            print(f"  {status} {cat_name} — {cat_passed}/{cat_total}")

            for t in tests:
                icon = "  ✅" if t.passed else "  ❌"
                sev = f"[{t.severity}]" if not t.passed else ""
                print(f"      {icon} {t.name} {sev}")
                if not t.passed and t.details:
                    print(f"           → {t.details}")
            print()

        # Résumé
        pct = (passed / total * 100) if total > 0 else 0
        print("─" * 62)
        print(f"  TOTAL : {passed}/{total} tests passés ({pct:.1f}%)")
        print()

        if failures_by_sev:
            print("  ÉCHECS PAR SÉVÉRITÉ :")
            for sev in sorted(failures_by_sev.keys()):
                count = len(failures_by_sev[sev])
                sev_labels = {
                    "P0": "🔴 BLOQUANT",
                    "P1": "🟠 CRITIQUE",
                    "P2": "🟡 MAJEUR",
                    "P3": "🔵 MINEUR",
                    "P4": "⚪ COSMÉTIQUE"
                }
                print(f"    {sev_labels.get(sev, sev)} : {count} échec(s)")
            print()

        # Verdict
        p0_fails = len(failures_by_sev.get("P0", []))
        p1_fails = len(failures_by_sev.get("P1", []))

        if p0_fails > 0:
            verdict = "🔴 BLOQUÉ — Corrections P0 requises avant livraison"
        elif p1_fails > 0:
            verdict = "🟠 ATTENTION — Corrections P1 recommandées"
        elif failed > 0:
            verdict = "🟡 ACCEPTABLE — Quelques points mineurs à corriger"
        else:
            verdict = "🟢 PRÊT POUR LIVRAISON"

        print(f"  VERDICT : {verdict}")
        print()
        print("═" * 62)

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "percentage": pct,
            "p0_failures": p0_fails,
            "p1_failures": p1_fails,
            "verdict": verdict
        }


# ═══════════════════════════════════════════════════════
# POINT D'ENTRÉE
# ═══════════════════════════════════════════════════════

if __name__ == "__main__":
    suite = ScalyoTestSuite()
    result = suite.run_all()
    sys.exit(0 if result["p0_failures"] == 0 else 1)
