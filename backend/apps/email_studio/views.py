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
