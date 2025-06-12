from django.core.management.base import BaseCommand
from apps.posts.models import Tag, TrendingTag

class Command(BaseCommand):
    help = 'Populates initial trending tags'

    def handle(self, *args, **kwargs):
        # Create some initial tags if they don't exist
        tags = [
            {'name': 'coding', 'slug': 'coding', 'description': 'Programming and development related posts'},
            {'name': 'startup', 'slug': 'startup', 'description': 'Startup and entrepreneurship stories'},
            {'name': 'career', 'slug': 'career', 'description': 'Career development and job search experiences'},
            {'name': 'learning', 'slug': 'learning', 'description': 'Learning and educational experiences'},
            {'name': 'interview', 'slug': 'interview', 'description': 'Interview experiences and tips'},
        ]

        for tag_data in tags:
            tag, created = Tag.objects.get_or_create(
                name=tag_data['name'],
                defaults={
                    'slug': tag_data['slug'],
                    'description': tag_data['description']
                }
            )
            
            # Create trending tag entry
            trending_tag, created = TrendingTag.objects.get_or_create(
                tag=tag,
                defaults={'post_count': 0}
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created trending tag for {tag.name}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'Trending tag for {tag.name} already exists')
                ) 