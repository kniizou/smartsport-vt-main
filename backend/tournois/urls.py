from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from . import views
from .views import RegisterAPI, LoginAPI, DashboardAdminView

# Création du router pour les ViewSets
router = DefaultRouter()
router.register(r'utilisateurs', views.UtilisateurViewSet)
router.register(r'joueurs', views.JoueurViewSet)
router.register(r'organisateurs', views.OrganisateurViewSet)
router.register(r'arbitres', views.ArbitreViewSet)
router.register(r'paiements', views.PaiementViewSet)
router.register(r'equipes', views.EquipeViewSet)
router.register(r'joueurs-equipes', views.JoueurEquipeViewSet)
router.register(r'tournois', views.TournoiViewSet)
router.register(r'rencontres', views.RencontreViewSet)
router.register(r'inscriptions', views.InscriptionTournoiViewSet, basename='inscription')

# Configuration de la documentation Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="API Tournois E-Sport",
        default_version='v1',
        description="API pour la gestion des tournois e-sport",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('api/auth/register/', RegisterAPI.as_view(), name='register'),
    path('api/auth/login/', LoginAPI.as_view(), name='login'),
    # URLs pour l'authentification JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # URLs pour les ViewSets
    path('api/', include(router.urls)),

    # URLs pour la documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path('api/dashboard/admin/', DashboardAdminView.as_view(), name='dashboard-admin'),
]
