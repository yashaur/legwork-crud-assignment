from rest_framework.routers import DefaultRouter
from items.views import ItemsViewSet

router = DefaultRouter()
router.register(prefix='items', viewset = ItemsViewSet)

urlpatterns = router.urls