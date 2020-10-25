"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
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
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import TokenRefreshView

from .views import AccountView, CommonParticipantViewSet, UrlChangeViewSet


router = DefaultRouter(False)
router.register('', AccountView, 'sign_account')
router.register('common', CommonParticipantViewSet)
router.register('change', UrlChangeViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
