# Generated by Django 5.0.7 on 2024-09-11 06:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0010_user_deleted_contacts'),
    ]

    operations = [
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('car_name', models.CharField(max_length=500)),
                ('speed', models.IntegerField(default=50)),
            ],
        ),
    ]
