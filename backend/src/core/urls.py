"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from rest_framework import permissions

from app.events.feed import EventFeed
from app.events.views import response_event

from telegram_bot.views import webhook


schema_view = get_schema_view(
   openapi.Info(
      title="NTUB Calendar",
      default_version='v2',
      description="臺北商業大學 資訊管理系 專題組別：109405",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

api_urlpatterns = [
    path('user/', include('app.users.urls')),
    path('calendar/', include('app.calendars.urls')),
    path('event/', include('app.events.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('api/v2/', include(api_urlpatterns)),
    path('feed/<str:code>/', EventFeed(), name='ical'),
    path('<str:code>/<str:eid>/<str:response>', response_event),
    path('webhook', webhook, name='webhook'),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
