"""
Pytest configuration for Lab4
"""
import sys
import os

# Add order-service and product-service directories to path
lab4_dir = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(lab4_dir, 'order-service'))
sys.path.insert(0, os.path.join(lab4_dir, 'product-service'))
