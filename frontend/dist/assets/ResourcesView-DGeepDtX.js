import{k as _,c as r,b as n,t,l as v,n as l,F as f,r as g,x as h,w as y,j as P,h as k,q as x,i as o,e as c,S as u,f as C}from"./index-CuRUa4xA.js";import{_ as w}from"./AppCard-BSDl1_rc.js";import{_ as T}from"./AppModal-OA6U9_uo.js";const q={class:"fade-in"},B={class:"mb-lg"},I={style:{"font-weight":"800","margin-bottom":"4px"}},E={style:{display:"flex",gap:"6px","flex-wrap":"wrap","margin-bottom":"16px"}},A=["onClick"],J={style:{display:"grid","grid-template-columns":"repeat(auto-fit, minmax(280px, 1fr))",gap:"14px"}},V={style:{"margin-bottom":"10px"}},N={style:{"font-weight":"800","margin-bottom":"4px"}},Q={style:{"font-size":"12px",color:"var(--muted)","line-height":"1.6"}},z={style:{"margin-top":"10px"}},F={style:{"text-align":"center","margin-bottom":"16px"}},O={style:{"white-space":"pre-wrap","font-size":"14px","line-height":"1.8",color:"var(--text)"}},M={__name:"ResourcesView",setup(j){const{t:d}=_(),s=k("all"),a=k(null),b=[{key:"framework",icon:"clipboard",label:"Frameworks"},{key:"kpi",icon:"dashboard",label:"KPIs"},{key:"playbook",icon:"book-open",label:"Playbooks"},{key:"template",icon:"memo",label:"Templates"}],p=[{id:1,icon:"target",title:"NPS de 0 à +50 en 60 jours",desc:"Framework complet avec étapes, scripts et métriques de suivi.",category:"framework",content:`Phase 1 (J1-15): Audit & Baseline
- Envoyer le NPS à 100% de la base
- Identifier détracteurs, passifs, promoteurs
- Classifier les retours par thème

Phase 2 (J15-30): Close the Loop
- Appeler chaque détracteur (< 24h)
- Créer un plan d'action par compte
- Communiquer les améliorations

Phase 3 (J30-45): Améliorer
- Implémenter les quick wins
- Former l'équipe sur les patterns récurrents
- Relancer le NPS aux détracteurs traités

Phase 4 (J45-60): Consolider
- Mesurer l'évolution
- Documenter les best practices
- Automatiser le suivi`},{id:2,icon:"dashboard",title:"KPIs Essentiels CS",desc:"Indicateurs essentiels pour le suivi hebdomadaire de votre équipe.",category:"kpi",content:`KPIs Opérationnels:
- Time to Value (TTV)
- First Response Time
- Resolution Time
- Tickets/CSM/semaine

KPIs Business:
- Net Revenue Retention (NRR)
- Gross Revenue Retention (GRR)
- Expansion MRR
- Churn Rate

KPIs Satisfaction:
- NPS
- CSAT
- CES (Customer Effort Score)
- Health Score moyen`},{id:3,icon:"refresh",title:"Matrice Valeur × Risque",desc:"Classifiez vos comptes par valeur × risque. Décisions rapides.",category:"framework",content:`Quadrant 1 - Haute Valeur / Haut Risque: PRIORITÉ ABSOLUE
→ Action immédiate, escalade manager, plan de sauvetage

Quadrant 2 - Haute Valeur / Bas Risque: PROTÉGER & DÉVELOPPER
→ QBR réguliers, upsell/cross-sell, advocacy

Quadrant 3 - Basse Valeur / Haut Risque: AUTOMATISER
→ Self-service, contenu, webinars collectifs

Quadrant 4 - Basse Valeur / Bas Risque: TECH TOUCH
→ Emails automatiques, in-app guidance`},{id:4,icon:"warning",title:"Protocole Détection Churn",desc:"Signaux d'alerte précoce et procédure d'intervention en 5 étapes.",category:"playbook",content:`Signaux d'alerte:
- Baisse d'usage > 20% sur 30 jours
- Pas de login depuis 14+ jours
- Ticket de facturation/annulation
- Changement de champion/sponsor
- NPS détracteur

Procédure en 5 étapes:
1. Détection (automatique via health score)
2. Qualification (appel discovery en 24h)
3. Plan d'action (roadmap personnalisée)
4. Exécution (weekly check-ins)
5. Stabilisation (monitoring 90 jours)`},{id:5,icon:"envelope",title:"Séquences Email Automatisées",desc:"Templates pour onboarding, QBR, renouvellement et plus.",category:"template",content:`Séquence Onboarding (30 jours):
- J+0: Welcome + Setup guide
- J+3: Check-in "Avez-vous besoin d'aide ?"
- J+7: Tips & Best practices
- J+14: Premier QBR mini
- J+30: Bilan du premier mois

Séquence Renouvellement (90 jours avant):
- J-90: Teaser nouvelles features
- J-60: QBR avec ROI review
- J-30: Proposition de renouvellement
- J-14: Relance si pas de réponse
- J-7: Escalade si nécessaire`},{id:6,icon:"building",title:"Onboarding Playbook",desc:"Structure standard pour un onboarding client réussi.",category:"playbook",content:`Phase 1 - Kickoff (Semaine 1):
- Call de bienvenue
- Définir les objectifs du client
- Identifier les KPIs de succès
- Planifier les jalons

Phase 2 - Setup (Semaines 2-3):
- Configuration technique
- Import de données
- Formation admin

Phase 3 - Adoption (Semaines 4-8):
- Formation utilisateurs
- Suivi de l'adoption
- Quick wins

Phase 4 - Handoff (Semaines 8-12):
- Premier QBR
- Transition vers le CSM
- Documenter le plan de succès`}],R=x(()=>s.value==="all"?p:p.filter(m=>m.category===s.value));return(m,i)=>(o(),r("div",q,[n("div",B,[n("h3",I,t(v(d)("resources")),1),i[2]||(i[2]=n("p",{style:{"font-size":"13px",color:"var(--muted)"}},"Frameworks, guides and best practices for CS teams",-1))]),n("div",E,[n("button",{class:l(["chip",{active:s.value==="all"}]),onClick:i[0]||(i[0]=e=>s.value="all")},t(v(d)("allAccounts")||"All"),3),(o(),r(f,null,g(b,e=>n("button",{key:e.key,class:l(["chip",{active:s.value===e.key}]),onClick:S=>s.value=e.key},[c(u,{name:e.icon,size:14},null,8,["name"]),C(" "+t(e.label),1)],10,A)),64))]),n("div",J,[(o(!0),r(f,null,g(R.value,e=>(o(),h(w,{key:e.id,class:"card-lift",style:{cursor:"pointer"},onClick:S=>a.value=e},{default:y(()=>[n("div",V,[c(u,{name:e.icon,size:32},null,8,["name"])]),n("div",N,t(e.title),1),n("div",Q,t(e.desc),1),n("div",z,[n("span",{class:l(["tag","risk-low"]),style:{"font-size":"10px"}},t(e.category),1)])]),_:2},1032,["onClick"]))),128))]),a.value?(o(),h(T,{key:0,title:a.value.title,onClose:i[1]||(i[1]=e=>a.value=null),maxWidth:"700px"},{default:y(()=>[n("div",F,[c(u,{name:a.value.icon,size:52},null,8,["name"])]),n("div",O,t(a.value.content),1)]),_:1},8,["title"])):P("",!0)]))}};export{M as default};
