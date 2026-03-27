<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">Mentions légales</h1>

      <div class="legal-tabs">
        <button
          class="legal-tab"
          :class="{ active: tab === 'cgu' }"
          @click="tab = 'cgu'"
        >Conditions d'utilisation</button>
        <button
          class="legal-tab"
          :class="{ active: tab === 'privacy' }"
          @click="tab = 'privacy'"
        >Politique de confidentialité</button>
      </div>

      <!-- CGU -->
      <div v-if="tab === 'cgu'" class="legal-content">
        <p class="legal-update">Dernière mise à jour : 27 mars 2026</p>

        <h2>1. Objet</h2>
        <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Scalyo, éditée par Stratima Agency. En utilisant Scalyo, vous acceptez ces conditions dans leur intégralité.</p>

        <h2>2. Inscription</h2>
        <p>L'accès à Scalyo nécessite la création d'un compte. Vous vous engagez à fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité réalisée depuis votre compte est réputée effectuée par vous.</p>

        <h2>3. Services</h2>
        <p>Scalyo est une plateforme SaaS de gestion et de suivi de la performance pour les équipes Customer Success. Les fonctionnalités proposées incluent le suivi de KPIs, la gestion de portefeuille, la planification, le coaching et l'envoi d'emails. Les services peuvent évoluer sans préavis.</p>

        <h2>4. Données personnelles</h2>
        <p>La collecte et le traitement de vos données personnelles sont détaillés dans notre Politique de confidentialité. En utilisant Scalyo, vous consentez à ce traitement conformément au RGPD.</p>

        <h2>5. Responsabilité</h2>
        <p>Scalyo est fourni « en l'état ». Stratima Agency met tout en œuvre pour assurer la disponibilité et la fiabilité de la plateforme, mais ne saurait être tenue responsable en cas d'interruption temporaire, de perte de données ou de dommages indirects liés à l'utilisation du service.</p>

        <h2>6. Propriété intellectuelle</h2>
        <p>L'ensemble du contenu de Scalyo (code, design, textes, marques) est la propriété de Stratima Agency. Toute reproduction ou utilisation non autorisée est interdite.</p>

        <h2>7. Résiliation</h2>
        <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Stratima Agency se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, sans préavis ni indemnité.</p>

        <h2>8. Droit applicable</h2>
        <p>Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, les tribunaux compétents seront ceux du ressort du siège social de Stratima Agency.</p>

        <h2>9. Contact</h2>
        <p>Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
      </div>

      <!-- Politique de confidentialité -->
      <div v-if="tab === 'privacy'" class="legal-content">
        <p class="legal-update">Dernière mise à jour : 27 mars 2026</p>

        <h2>1. Responsable du traitement</h2>
        <p>Le responsable du traitement des données est Stratima Agency, éditeur de la plateforme Scalyo.<br>Contact : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>

        <h2>2. Données collectées</h2>
        <ul>
          <li><strong>Données d'identification :</strong> nom, prénom, adresse email professionnelle</li>
          <li><strong>Données de connexion :</strong> mot de passe (hashé), dates de connexion</li>
          <li><strong>Données d'usage :</strong> actions réalisées sur la plateforme, préférences, données de performance saisies</li>
        </ul>

        <h2>3. Finalités du traitement</h2>
        <ul>
          <li>Gestion de votre compte et authentification</li>
          <li>Fourniture et amélioration des services Scalyo</li>
          <li>Communication relative au service (notifications, mises à jour)</li>
          <li>Analyse anonymisée pour l'amélioration de la plateforme</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>Le traitement de vos données repose sur l'exécution du contrat (utilisation du service) et votre consentement pour les communications optionnelles.</p>

        <h2>5. Durée de conservation</h2>
        <p>Vos données sont conservées pendant toute la durée d'utilisation de votre compte. En cas de suppression de compte, vos données personnelles sont effacées dans un délai de 30 jours. Les données anonymisées à des fins statistiques peuvent être conservées sans limitation de durée.</p>

        <h2>6. Hébergement</h2>
        <p>Vos données sont hébergées par Cloudflare (Workers, Pages, D1). Les données sont hébergées en Europe conformément au RGPD.</p>

        <h2>7. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
          <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
          <li><strong>Droit à la limitation :</strong> restreindre le traitement de vos données</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>

        <h2>8. Cookies</h2>
        <p>Scalyo utilise uniquement des cookies techniques nécessaires au fonctionnement du service (authentification, préférences). Aucun cookie publicitaire ou de suivi tiers n'est utilisé.</p>

        <h2>9. Modifications</h2>
        <p>Cette politique peut être mise à jour. En cas de modification substantielle, vous serez informé via la plateforme. L'utilisation continue de Scalyo après modification vaut acceptation.</p>
      </div>

      <div class="legal-back">
        <router-link to="/">Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const tab = ref('cgu')
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--surface);
  color: var(--text);
  padding: 48px 20px;
  display: flex;
  justify-content: center;
}

.legal-container {
  max-width: 720px;
  width: 100%;
}

.legal-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.legal-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.legal-tab {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.legal-tab.active {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}

.legal-content h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 24px 0 8px;
  color: var(--text);
}

.legal-content p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 12px;
}

.legal-content ul {
  padding-left: 20px;
  margin-bottom: 12px;
}

.legal-content li {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 4px;
}

.legal-content a {
  color: var(--teal);
  text-decoration: none;
}

.legal-content a:hover {
  text-decoration: underline;
}

.legal-update {
  font-size: 12px !important;
  color: var(--muted) !important;
  font-style: italic;
  margin-bottom: 20px !important;
}

.legal-back {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.legal-back a {
  color: var(--teal);
  font-size: 13px;
  text-decoration: none;
  font-weight: 600;
}

.legal-back a:hover {
  text-decoration: underline;
}
</style>
