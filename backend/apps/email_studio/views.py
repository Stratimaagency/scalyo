from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


TEMPLATES = {
    'welcome': {
        'id': 'welcome',
        'name_fr': 'Bienvenue — Guide de démarrage',
        'name_en': 'Welcome — Onboarding Guide',
        'subject_fr': 'Bienvenue chez [Entreprise] — votre guide de démarrage',
        'subject_en': 'Welcome to [Company] — your onboarding guide',
        'body_fr': "Bonjour [Prénom],\n\nBienvenue chez [Entreprise] ! Je suis [Votre nom], votre Customer Success Manager dédié.\n\nJe serai votre point de contact principal pour vous accompagner dans la prise en main de notre solution.\n\nVoici les prochaines étapes :\n1. Planifier votre session d'onboarding\n2. Configurer votre espace\n3. Former vos équipes\n\nN'hésitez pas à me contacter pour toute question.\n\nÀ très vite,\n[Votre nom]",
        'body_en': "Hi [First name],\n\nWelcome to [Company]! I'm [Your name], your dedicated Customer Success Manager.\n\nI'll be your main point of contact to help you get started with our solution.\n\nHere are the next steps:\n1. Schedule your onboarding session\n2. Set up your workspace\n3. Train your teams\n\nFeel free to reach out with any questions.\n\nBest,\n[Your name]",
    },
    'qbr': {
        'id': 'qbr',
        'name_fr': 'QBR — Revue trimestrielle',
        'name_en': 'QBR — Quarterly Review',
        'subject_fr': 'QBR Q[N] — Revue trimestrielle de votre succès',
        'subject_en': 'QBR Q[N] — Quarterly success review',
        'body_fr': "Bonjour [Prénom],\n\nVoici le récapitulatif de votre trimestre :\n\n📊 Résultats clés :\n• Adoption : [X]%\n• Satisfaction : [NPS]\n• Tickets résolus : [N]\n\n🎯 Objectifs Q+1 :\n1. [Objectif 1]\n2. [Objectif 2]\n3. [Objectif 3]\n\nJe vous propose un call de 30 min pour en discuter.\n\nCordialement,\n[Votre nom]",
        'body_en': "Hi [First name],\n\nHere's your quarterly summary:\n\n📊 Key results:\n• Adoption: [X]%\n• Satisfaction: [NPS]\n• Resolved tickets: [N]\n\n🎯 Q+1 Goals:\n1. [Goal 1]\n2. [Goal 2]\n3. [Goal 3]\n\nI'd like to schedule a 30-min call to discuss.\n\nBest,\n[Your name]",
    },
    'checkin': {
        'id': 'checkin',
        'name_fr': 'Check-in mensuel',
        'name_en': 'Monthly check-in',
        'subject_fr': '📞 Je souhaite prendre de vos nouvelles — [Entreprise]',
        'subject_en': '📞 Checking in on you — [Company]',
        'body_fr': "Bonjour [Prénom],\n\nJ'espère que tout se passe bien de votre côté.\n\nJe fais un point rapide pour m'assurer que :\n✅ Vous utilisez bien toutes les fonctionnalités\n✅ Votre équipe est à l'aise avec la solution\n✅ Vous n'avez pas de bloquant\n\nAvez-vous 15 min cette semaine pour un point rapide ?\n\nBien cordialement,\n[Votre nom]",
        'body_en': "Hi [First name],\n\nHope everything is going well on your end.\n\nJust checking in to make sure:\n✅ You're using all the features\n✅ Your team is comfortable with the solution\n✅ You don't have any blockers\n\nDo you have 15 min this week for a quick catch-up?\n\nBest,\n[Your name]",
    },
    'risk': {
        'id': 'risk',
        'name_fr': 'Relance compte à risque',
        'name_en': 'At-risk account follow-up',
        'subject_fr': '🔔 Point important — [Entreprise]',
        'subject_en': '🔔 Important update — [Company]',
        'body_fr': "Bonjour [Prénom],\n\nJ'ai remarqué [signal d'alerte] et je souhaite en discuter avec vous.\n\nNotre objectif est de vous assurer la meilleure expérience possible.\n\nPouvons-nous planifier un appel cette semaine ?\n\nCordialement,\n[Votre nom]",
        'body_en': "Hi [First name],\n\nI noticed [warning signal] and I'd like to discuss it with you.\n\nOur goal is to ensure you have the best experience possible.\n\nCan we schedule a call this week?\n\nBest,\n[Your name]",
    },
    'expansion': {
        'id': 'expansion',
        'name_fr': "Opportunité d'expansion",
        'name_en': 'Expansion opportunity',
        'subject_fr': '💡 Nouvelle opportunité pour [Entreprise]',
        'subject_en': '💡 New opportunity for [Company]',
        'body_fr': "Bonjour [Prénom],\n\nSuite à l'utilisation croissante de [fonctionnalité], je pense que [offre supérieure] pourrait vous apporter encore plus de valeur.\n\nVoici ce que cela inclut :\n• [Avantage 1]\n• [Avantage 2]\n• [Avantage 3]\n\nSouhaitez-vous en savoir plus ?\n\nCordialement,\n[Votre nom]",
        'body_en': "Hi [First name],\n\nGiven the growing usage of [feature], I believe [higher plan] could bring even more value.\n\nHere's what it includes:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nWould you like to learn more?\n\nBest,\n[Your name]",
    },
    'renewal': {
        'id': 'renewal',
        'name_fr': 'Renouvellement à venir',
        'name_en': 'Upcoming renewal',
        'subject_fr': '📅 Votre renouvellement approche — [Entreprise]',
        'subject_en': '📅 Your renewal is coming up — [Company]',
        'body_fr': "Bonjour [Prénom],\n\nVotre contrat arrive à échéance le [date].\n\nVoici un récapitulatif de cette année :\n📊 [Résultats clés]\n\nJe souhaiterais discuter de votre renouvellement et des améliorations prévues.\n\nÊtes-vous disponible cette semaine ?\n\nCordialement,\n[Votre nom]",
        'body_en': "Hi [First name],\n\nYour contract is up for renewal on [date].\n\nHere's a summary of this year:\n📊 [Key results]\n\nI'd like to discuss your renewal and upcoming improvements.\n\nAre you available this week?\n\nBest,\n[Your name]",
    },
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def template_list(request):
    lang = request.query_params.get('lang', 'fr')
    result = []
    for key, tpl in TEMPLATES.items():
        result.append({
            'id': tpl['id'],
            'name': tpl.get(f'name_{lang}', tpl['name_fr']),
            'subject': tpl.get(f'subject_{lang}', tpl['subject_fr']),
            'body': tpl.get(f'body_{lang}', tpl['body_fr']),
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def template_detail(request, template_id):
    lang = request.query_params.get('lang', 'fr')
    tpl = TEMPLATES.get(template_id)
    if not tpl:
        return Response({'error': 'Template not found'}, status=404)
    return Response({
        'id': tpl['id'],
        'name': tpl.get(f'name_{lang}', tpl['name_fr']),
        'subject': tpl.get(f'subject_{lang}', tpl['subject_fr']),
        'body': tpl.get(f'body_{lang}', tpl['body_fr']),
    })
