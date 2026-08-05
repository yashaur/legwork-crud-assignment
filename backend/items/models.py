from django.db import models
from uuid import uuid4

# Create your models here.
class BaseModel(models.Model):
    
    id = models.UUIDField(default = uuid4, editable = False, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Items(BaseModel):
    key = models.CharField(max_length = 50, null=False, blank=False)
    value = models.TextField()

    def __str__(self):
        return str(self.key)