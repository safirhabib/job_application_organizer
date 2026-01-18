from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0002_tailored_resume_client_id_and_timestamps"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobapplication",
            name="company_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="notes",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="follow_up_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="posting_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="image_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]

