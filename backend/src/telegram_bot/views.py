import json

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .bot import webhook_handler

from core.settings import DEBUG


@api_view(['POST'])
def webhook(request):
    if DEBUG:
        print(json.dumps(request.data, indent=2, ensure_ascii=False))

    webhook_handler(request.data)
    return Response('ok')
