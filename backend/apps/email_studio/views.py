from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .templates_registry import registry


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def template_list(request):
    lang = request.query_params.get('lang', 'fr')
    return Response(registry.list_localized(lang))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def template_detail(request, template_id):
    lang = request.query_params.get('lang', 'fr')
    tpl = registry.get(template_id)
    if not tpl:
        return Response({'error': 'Template not found'}, status=404)
    return Response(tpl.localize(lang))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_email(request):
    """Send an email using a template or custom content."""
    to_email = request.data.get('to')
    subject = request.data.get('subject', '')
    body = request.data.get('body', '')
    template_id = request.data.get('template_id')
    lang = request.data.get('lang', 'fr')

    if not to_email:
        return Response({'error': 'Recipient email is required'}, status=400)

    if template_id:
        tpl = registry.get(template_id)
        if not tpl:
            return Response({'error': 'Template not found'}, status=404)
        localized = tpl.localize(lang)
        subject = subject or localized['subject']
        body = body or localized['body']

    if not subject or not body:
        return Response({'error': 'Subject and body are required'}, status=400)

    # Replace common placeholders
    user = request.user
    replacements = {
        '[Votre nom]': user.display_name or user.email,
        '[Your name]': user.display_name or user.email,
        '[Entreprise]': user.company.name if user.company else '',
        '[Company]': user.company.name if user.company else '',
    }
    for placeholder, value in replacements.items():
        subject = subject.replace(placeholder, value)
        body = body.replace(placeholder, value)

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email] if isinstance(to_email, str) else to_email,
            fail_silently=False,
        )
        return Response({'status': 'sent', 'to': to_email})
    except Exception as e:
        return Response({'error': f'Failed to send email: {str(e)}'}, status=500)
