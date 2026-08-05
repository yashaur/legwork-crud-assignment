from rest_framework import viewsets
from items.serializers import ItemsSerializer
from items.models import Items
from rest_framework import status
from rest_framework.response import Response

# Create your views here.

class ItemsViewSet(viewsets.ModelViewSet):

    queryset = Items.objects.all().order_by('-created_at')
    serializer_class = ItemsSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        return_data = self.get_serializer(instance).data
        self.perform_destroy(instance)

        return Response(data = {'item deleted': return_data}, status=status.HTTP_200_OK)