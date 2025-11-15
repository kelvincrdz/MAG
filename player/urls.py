from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('player/', views.player_view, name='player'),
    path('upload/', views.upload_mag, name='upload_mag'),
    path('player/<slug:pkg_id>/', views.player_with_package, name='player_with_package'),
    path('arquivos/<slug:pkg_id>/', views.arquivos_view, name='arquivos'),
    path('logout/', views.logout_view, name='logout'),
]
