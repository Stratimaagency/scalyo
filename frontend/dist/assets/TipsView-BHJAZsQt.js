import{k as b,c,b as n,t as i,l as o,C,D as z,n as v,F as S,r as x,x as _,j as f,h as m,q as y,i as r,e as q,S as R,v as T}from"./index-vorMzndg.js";import{_ as k}from"./EmptyState-Bv9C8K3r.js";const P={class:"fade-in"},w={class:"mb-lg"},D={style:{"font-weight":"800","margin-bottom":"4px"}},A={style:{"font-size":"13px",color:"var(--muted)"}},M=["placeholder"],j={class:"tab-bar mb-lg"},B={style:{display:"flex","flex-direction":"column",gap:"8px"}},I=["onClick"],L={class:"flex-between"},E={style:{display:"flex",gap:"10px","align-items":"center"}},F={style:{"font-weight":"700","font-size":"14px"}},N={key:0,style:{"margin-top":"12px","font-size":"13px","line-height":"1.7",color:"var(--muted)","white-space":"pre-wrap","border-top":"1px solid var(--border)","padding-top":"12px"}},J={__name:"TipsView",setup(V){const{t}=b(),l=m(""),a=m("manager"),u=m(null),g=[{id:1,icon:"target",title:"Comment mener un 1-on-1 CS efficace ?",content:`1. Préparez un agenda avec 3 points maximum
2. Commencez par le positif : succès récents, wins
3. Abordez les points de blocage avec des questions ouvertes
4. Définissez ensemble les prochaines actions
5. Terminez par un point bien-être

Durée idéale : 30 minutes
Fréquence : hebdomadaire pour les juniors, bi-mensuelle pour les seniors`},{id:2,icon:"chart-up",title:"Comment démontrer la valeur du CS au COMEX ?",content:`Métriques à présenter :
- Net Revenue Retention (NRR)
- Impact du CS sur le churn (-X% depuis mise en place)
- Expansion revenue driven by CS
- Time to Value (réduction)

Format :
- Dashboard mensuel (1 page)
- QBR trimestriel (5 slides max)
- Toujours lier les KPIs CS aux revenus`},{id:3,icon:"fire",title:"Comment prévenir le burn-out de mes CSMs ?",content:`Signaux d'alerte :
- Réponses de plus en plus courtes
- Temps de réponse en hausse
- Baisse de qualité des interactions
- Absentéisme ou présentéisme

Actions :
1. Check-in bien-être hebdomadaire
2. Rotation des comptes difficiles
3. Plafond de comptes par CSM
4. Formation continue (pas seulement opérationnelle)
5. Créer un espace de parole sans jugement`},{id:4,icon:"people",title:"Comment structurer l'intégration d'un nouveau CSM ?",content:`Semaine 1 : Observation
- Shadow de 3 CSMs différents
- Lecture de la documentation
- Présentation de l'équipe

Semaine 2-3 : Accompagnement
- Prise en charge de 3-5 comptes simples
- Buddy system avec un CSM senior
- Daily check-in

Semaine 4-8 : Autonomie progressive
- Portefeuille croissant
- Premier QBR supervisé
- Feedback 360 à J+30

J+90 : Évaluation complète`},{id:5,icon:"trophy",title:"Comment fixer des objectifs CS équilibrés ?",content:`Catégories d'objectifs :

1. Rétention (40%)
- GRR > 90%
- NRR > 105%
- Churn < 5%

2. Satisfaction (30%)
- NPS > 40
- CSAT > 8/10
- Health Score moyen > 70

3. Développement (20%)
- Expansion MRR
- Upsell/Cross-sell pipeline

4. Opérationnel (10%)
- Time to first value
- SLA respect`}],h=[{id:10,icon:"handshake",title:"Comment gérer un conflit avec un collègue CSM ?",content:`1. Identifiez le problème de fond (pas les symptômes)
2. Demandez un 1-on-1 informel
3. Utilisez le format "je" : "Je ressens... quand..."
4. Cherchez une solution win-win
5. Si nécessaire, impliquez un médiateur

À éviter :
- Régler ça par email/Slack
- En parler à toute l'équipe
- Accumuler sans communiquer`},{id:11,icon:"dashboard",title:"Comment accélérer la montée en compétences ?",content:`1. Identifiez vos lacunes (auto-évaluation)
2. Trouvez un mentor dans l'équipe
3. Documentez chaque interaction difficile
4. Demandez des feedbacks réguliers
5. Lisez 1 article CS par jour

Ressources recommandées :
- Gainsight Pulse
- CS Insider
- SuccessHACKER
- The Customer Success Café (podcast)`},{id:12,icon:"lightbulb",title:"Comment influencer sans autorité formelle ?",content:`1. Construisez votre crédibilité par les données
2. Devenez expert d'un domaine spécifique
3. Partagez vos insights proactivement
4. Aidez les autres avant de demander
5. Proposez des solutions, pas des problèmes

Technique : le "pull" plutôt que le "push"
- Posez des questions qui mènent à votre conclusion
- Laissez les autres s'approprier l'idée
- Soyez patient et constant`},{id:13,icon:"brain",title:"Comment gérer la surcharge sans alerter le manager ?",content:`D'abord : il est OK d'alerter votre manager ! C'est leur rôle de vous aider.

Mais si vous voulez d'abord essayer :
1. Priorisez par impact business (ARR × risque)
2. Automatisez les tâches répétitives
3. Utilisez des templates pour les emails récurrents
4. Regroupez les tâches similaires (batch)
5. Dites non aux réunions sans agenda

Si ça persiste > 2 semaines, communiquez avec votre manager.`},{id:14,icon:"star-glow",title:"Comment devenir une référence dans l'équipe ?",content:`1. Expertise : Maîtrisez parfaitement 2-3 sujets
2. Partage : Créez des guides, des templates
3. Mentorat : Aidez les nouveaux arrivants
4. Innovation : Proposez des améliorations de process
5. Fiabilité : Soyez constant dans la qualité

Visibilité :
- Présentez en réunion d'équipe
- Documentez vos best practices
- Participez aux projets transverses`}],p=y(()=>{const d=a.value==="manager"?g:h;if(!l.value)return d;const s=l.value.toLowerCase();return d.filter(e=>e.title.toLowerCase().includes(s)||e.content.toLowerCase().includes(s))});return(d,s)=>(r(),c("div",P,[n("div",w,[n("h3",D,i(o(t)("tipsTitle")),1),n("p",A,i(o(t)("tipsDesc")),1)]),C(n("input",{"onUpdate:modelValue":s[0]||(s[0]=e=>l.value=e),placeholder:o(t)("searchTips"),class:"field-input mb-md",style:{"max-width":"400px"}},null,8,M),[[z,l.value]]),n("div",j,[n("button",{class:v(["tab-item",{active:a.value==="manager"}]),onClick:s[1]||(s[1]=e=>a.value="manager")},i(o(t)("managerTips")),3),n("button",{class:v(["tab-item",{active:a.value==="csm"}]),onClick:s[2]||(s[2]=e=>a.value="csm")},i(o(t)("csmTips")),3)]),n("div",B,[(r(!0),c(S,null,x(p.value,e=>(r(),c("div",{key:e.id,class:"card card-lift",style:{padding:"16px 18px",cursor:"pointer"},onClick:O=>u.value=u.value===e.id?null:e.id},[n("div",L,[n("div",E,[q(R,{name:e.icon,size:20},null,8,["name"]),n("span",F,i(e.title),1)]),n("span",{style:T([{color:"var(--muted)","font-size":"16px",transition:"transform .2s"},{transform:u.value===e.id?"rotate(180deg)":""}])},"▾",4)]),u.value===e.id?(r(),c("div",N,i(e.content),1)):f("",!0)],8,I))),128))]),p.value.length?f("",!0):(r(),_(k,{key:0,icon:"lightbulb",title:o(t)("noResults")},null,8,["title"]))]))}};export{J as default};
