<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <router-link to="/" class="legal-back">← scalyo.app</router-link>
        <h1>Politique de Confidentialité</h1>
        <p class="legal-date">Dernière mise à jour : 17 avril 2026</p>
      </div>
      <div class="legal-content">
        <section>
          <h2>1. Responsable du traitement</h2>
          <p>Lidia Chikhoune, éditrice de Scalyo (scalyo.app) — contact@scalyo.app</p>
        </section>
        <section>
          <h2>2. Données collectées</h2>
          <ul>
            <li><strong>Données de compte</strong> : prénom, nom, email, mot de passe (haché)</li>
            <li><strong>Données d'usage</strong> : clients, tâches, équipe, KPIs saisis dans l'application</li>
            <li><strong>Données techniques</strong> : adresse IP, navigateur, logs d'accès</li>
            <li><strong>Données de paiement</strong> : gérées exclusivement par Stripe — Scalyo ne stocke aucune coordonnée bancaire</li>
          </ul>
        </section>
        <section>
          <h2>3. Finalités du traitement</h2>
          <ul>
            <li>Fourniture du service et gestion des comptes</li>
            <li>Facturation et gestion des abonnements</li>
            <li>Support client et amélioration du service</li>
            <li>Sécurité et prévention des fraudes</li>
          </ul>
        </section>
        <section>
          <h2>4. Base légale</h2>
          <p>Le traitement est fondé sur l'exécution du contrat (CGU) et le consentement de l'utilisateur lors de l'inscription.</p>
        </section>
        <section>
          <h2>5. Durée de conservation</h2>
          <p>Les données sont conservées pendant la durée de l'abonnement + 3 ans après résiliation pour obligations légales. Les données peuvent être supprimées sur demande à tout moment.</p>
        </section>
        <section>
          <h2>6. Hébergement</h2>
          <p>Les données sont hébergées par <strong>Supabase</strong> (serveurs EU — Frankfurt, Allemagne) et <strong>Cloudflare</strong> pour la diffusion du service. Ces sous-traitants sont conformes au RGPD.</p>
        </section>
        <section>
          <h2>7. Partage des données</h2>
          <p>Scalyo ne vend pas et ne loue pas vos données à des tiers. Les données peuvent être partagées uniquement avec les sous-traitants techniques nécessaires au fonctionnement du service (Supabase, Stripe, Cloudflare).</p>
        </section>
        <section>
          <h2>8. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger vos données</li>
            <li><strong>Droit à l'effacement</strong> : supprimer votre compte et vos données</li>
            <li><strong>Droit à la portabilité</strong> : exporter vos données en CSV</li>
            <li><strong>Droit d'opposition</strong> : s'opposer au traitement</li>
          </ul>
          <p>Pour exercer vos droits : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
        </section>
        <section>
          <h2>9. Cookies</h2>
          <p>Scalyo utilise uniquement des cookies techniques nécessaires au fonctionnement du service (session, authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
        </section>
        <section>
          <h2>10. Contact DPO</h2>
          <p>Pour toute question relative à vos données : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
onMounted(() => { document.title = 'Politique de confidentialité — Scalyo' })
</script>
<style scoped>
.legal-page { min-height: 100vh; background: var(--bg, #f8f9fb); padding: 40px 20px; }
.legal-container { max-width: 760px; margin: 0 auto; }
.legal-header { margin-bottom: 40px; }
.legal-back { color: var(--purple, #7c3aed); text-decoration: none; font-size: 0.9rem; font-weight: 500; }
.legal-header h1 { font-size: 2rem; font-weight: 800; margin-top: 16px; margin-bottom: 8px; }
.legal-date { color: var(--text-muted, #6b7280); font-size: 0.85rem; }
.legal-content { background: var(--bg-card, #fff); border-radius: 16px; padding: 40px; border: 1px solid var(--border, #e5e7eb); }
.legal-content section { margin-bottom: 32px; }
.legal-content h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; }
.legal-content p, .legal-content li { font-size: 0.9rem; line-height: 1.7; margin-bottom: 8px; }
.legal-content ul { padding-left: 20px; }
.legal-content a { color: var(--purple, #7c3aed); }
</style>