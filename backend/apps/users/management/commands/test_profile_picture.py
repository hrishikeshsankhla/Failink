from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Test profile picture functionality'

    def handle(self, *args, **kwargs):
        self.stdout.write('Testing profile picture functionality...')
        
        # Check if media directory exists
        media_dir = settings.MEDIA_ROOT
        profile_pictures_dir = os.path.join(media_dir, 'profile_pictures')
        
        self.stdout.write(f'Media directory: {media_dir}')
        self.stdout.write(f'Profile pictures directory: {profile_pictures_dir}')
        
        if os.path.exists(media_dir):
            self.stdout.write(self.style.SUCCESS('✓ Media directory exists'))
        else:
            self.stdout.write(self.style.ERROR('✗ Media directory does not exist'))
            return
        
        if os.path.exists(profile_pictures_dir):
            self.stdout.write(self.style.SUCCESS('✓ Profile pictures directory exists'))
        else:
            self.stdout.write(self.style.ERROR('✗ Profile pictures directory does not exist'))
            return
        
        # Check if we can write to the directory
        test_file = os.path.join(profile_pictures_dir, 'test.txt')
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            self.stdout.write(self.style.SUCCESS('✓ Can write to profile pictures directory'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Cannot write to profile pictures directory: {e}'))
            return
        
        # Check user model
        try:
            user = User.objects.first()
            if user:
                self.stdout.write(f'Found user: {user.username} ({user.email})')
                self.stdout.write(f'Profile picture field: {user.profile_picture}')
                if user.profile_picture:
                    self.stdout.write(f'Profile picture path: {user.profile_picture.path}')
                    if os.path.exists(user.profile_picture.path):
                        self.stdout.write(self.style.SUCCESS('✓ Profile picture file exists'))
                    else:
                        self.stdout.write(self.style.WARNING('⚠ Profile picture file does not exist'))
                else:
                    self.stdout.write('No profile picture set')
            else:
                self.stdout.write('No users found in database')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error checking user model: {e}'))
        
        self.stdout.write(self.style.SUCCESS('Profile picture test completed')) 