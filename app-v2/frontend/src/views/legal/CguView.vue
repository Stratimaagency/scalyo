<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <router-link to="/" class="legal-back">← scalyo.app</router-link>
        <h1>Conditions Générales d'Utilisation</h1>
        <p class="legal-date">Dernière mise à jour : 17 avril 2026</p>
      </div>

      <div class="legal-content">
        <section>
          <h2>1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Scalyo, service SaaS de Customer Success Management édité par Lidia Chikhoune (ci-après "Scalyo"), accessible à l'adresse scalyo.app.</p>
        </section>
        <section>
          <h2>2. Acceptation des conditions</h2>
          <p>L'utilisation du service implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.</p>
        </section>
        <section>
          <h2>3. Description du service</h2>
          <p>Scalyo est une plateforme SaaS destinée aux équipes Customer Success permettant de gérer un portefeuille clients, des indicateurs de performance (KPIs), des tâches, un planning, une équipe et des ressources associées.</p>
        </section>
        <section>
          <h2>4. Accès au service</h2>
          <p>Le service est accessible 24h/24, 7j/7, sous réserve des opérations de maintenance. Scalyo se réserve le droit d'interrompre le service pour maintenance sans préavis. L'accès nécessite la création d'un compte avec une adresse email valide.</p>
        </section>
        <section>
          <h2>5. Période d'essai</h2>
          <p>Scalyo offre une période d'essai gratuite de 14 jours sans engagement. À l'issue de cette période, l'accès au service est conditionné à la souscription d'un abonnement payant. La période d'essai est limitée à une utilisation par personne et par entreprise.</p>
        </section>
        <section>
          <h2>6. Abonnements et tarification</h2>
          <p>Les abonnements sont disponibles aux tarifs suivants :</p>
          <ul>
            <li><strong>Starter</strong> : 97 €/mois HT</li>
            <li><strong>Growth</strong> : 297 €/mois HT</li>
            <li><strong>Elite</strong> : 697 €/mois HT</li>
          </ul>
          <p>Les abonnements sont renouvelés automatiquement chaque mois. La résiliation peut être effectuée à tout moment depuis l'espace client, avec effet à la fin de la période en cours.</p>
        </section>
        <section>
          <h2>7. Propriété des données</h2>
          <p>L'utilisateur est et reste propriétaire de ses données. Scalyo n'exploite pas les données des utilisateurs à des fins commerciales. Les données sont stockées de manière sécurisée sur des serveurs européens (Supabase, région EU Frankfurt).</p>
        </section>
        <section>
          <h2>8. Responsabilité</h2>
          <p>Scalyo ne saurait être tenu responsable des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service. La responsabilité de Scalyo est limitée au montant des sommes versées par l'utilisateur au cours des 3 derniers mois.</p>
        </section>
        <section>
          <h2>9. Droit applicable</h2>
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront compétents.</p>
        </section>
        <section>
          <h2>10. Contact</h2>
          <p>Pour toute question relative aux présentes CGU, vous pouvez nous contacter à : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
onMounted(() => { document.title = 'CGU — Scalyo' })
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
.legal-content h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; color: var(--text, #1a1a2e); }
.legal-content p, .legal-content li { font-size: 0.9rem; line-height: 1.7; color: var(--text, #1a1a2e); margin-bottom: 8px; }
.legal-content ul { padding-left: 20px; }
.legal-content a { color: var(--purple, #7c3aed); }
</style>