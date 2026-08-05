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
            raise CommandError(f"No file called items.json found in {FILEPATH.parent}.\nPlease ensure that `items.json` is added to `root/data/`")

        try:
            file = json.loads(FILEPATH.read_text())
        except Exception as e:
            raise CommandError(f"Could not parse json due to the following error: {e}")

        if not isinstance(file,list):
            raise CommandError("Incorrect file format: must be a list containing key-value pairs")

        with transaction.atomic():
            Items.objects.all().delete()

            bad_imports = 0
            n_rows = len(file)

            for row in file:
                if not isinstance(row, dict):
                    bad_imports += 1
                    continue

                key, value = row.get('key'), row.get('value')

                key_invalid = (key == "") or (key is None)
                value_invalid = (value is None)

                if key_invalid or value_invalid:
                    bad_imports += 1
                    continue

                Items.objects.create(key=key, value=value)

        if bad_imports == 0:
            self.stdout.write(self.style.SUCCESS(f"File written to database sucessfully. Added {n_rows} rows"))
        elif bad_imports > 0 and bad_imports < n_rows:
            self.stdout.write(self.style.WARNING(f"File written to database but with skipped rows. {n_rows-bad_imports} written; {bad_imports} skipped."))
        else:
            self.stdout.write(self.style.ERROR(f"File could not be written to database"))
            raise CommandError("File could not be written to database. Check the format") 

        