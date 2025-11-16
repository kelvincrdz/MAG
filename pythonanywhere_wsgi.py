"""
WSGI config for PythonAnywhere deployment.

This file should be copied to your PythonAnywhere WSGI configuration file.
You can access it through the PythonAnywhere web tab.

Instructions:
1. Go to the Web tab on PythonAnywhere
2. Click on the WSGI configuration file link
3. Replace the entire content with this file's content
4. Update the paths to match your PythonAnywhere username and project location
"""

import os
import sys

# Add your project directory to the sys.path
# IMPORTANT: Update '/home/yourusername' to your actual PythonAnywhere username
path = '/home/yourusername/MAG'
if path not in sys.path:
    sys.path.insert(0, path)

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'mag_player.settings'

# Load the Django application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
