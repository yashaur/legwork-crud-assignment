from pathlib import Path
import json
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from items.models import Items

class Command(BaseCommand):

    help = "This command helps Django parse different types of json files for a single model"

    def handle(self, *args, **options):

        FILEPATH = settings.BASE_DIR.parent / 'data/items.json'

        if not FILEPATH.exists():
            raise CommandError(f"No file called items.json found in {FILEPATH.parent}.\nPlease ensure that `items.json` is added to `backend/data/`")

        file = json.loads(FILEPATH.read_text())
        n_rows = len(file)

        if not isinstance(file,list):
            raise CommandError("Incorrect file format: must be a list containing key-value pairs")

        with transaction.atomic():
            Items.objects.all().delete()

            bad_imports = 0

            for row in file:
                if not isinstance(row, dict):
                    bad_imports += 1
                    continue

                key, value = row.get('key'), row.get('value')

                if not (key or value):
                    bad_imports += 1
                    continue

                Items.objects.create(key=key, value=value)

        if bad_imports == 0:
            self.style.SUCCESS(self.stdout.write(f"File written to database sucessfully. Added {n_rows} rows"))
        elif bad_imports > 0 and bad_imports < n_rows:
            self.style.WARNING(self.stdout.write(f"File written to database but with skipped rows. {n_rows-bad_imports} written; {bad_imports} skipped."))
        else:
            self.style.ERROR_OUTPUT(self.stdout.write(f"File could not be written to database"))
            raise CommandError("File could not be written to database. Check the format") 

        