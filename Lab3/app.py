"""
Lab3: Containerization and Kubernetes Orchestration
Production-grade Flask API with error handling, validation, and security
"""

from flask import Flask, request, jsonify
import time
import random
import logging
import os
from functools import wraps
from datetime import datetime

# Configuration from environment variables
MAX_DATA_SIZE = int(os.getenv('MAX_DATA_SIZE', 5000))
MIN_DELAY = float(os.getenv('MIN_DELAY', 0.1))
MAX_DELAY = float(os.getenv('MAX_DELAY', 1.5))
APP_ENV = os.getenv('APP_ENV', 'development')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

app = Flask(__name__)

# Structured logging configuration
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# CORS headers for mobile-cloud communication
@app.after_request
def add_cors_headers(response):
    """Add CORS headers to allow cross-origin requests from mobile clients"""
    response.headers['Access-Control-Allow-Origin'] = os.getenv('CORS_ORIGIN', '*')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    return response


def validate_integer_param(param_name, min_value=1, max_value=MAX_DATA_SIZE):
    """
    Decorator to validate integer query parameters
    
    Args:
        param_name: Name of the query parameter
        min_value: Minimum allowed value
        max_value: Maximum allowed value
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                value = request.args.get(param_name)
                if value is None:
                    return f(*args, **kwargs)
                
                value = int(value)
                
                if value < min_value:
                    logger.warning(f"Invalid {param_name}: value {value} below minimum {min_value}")
                    return jsonify({
                        'error': f'{param_name} must be >= {min_value}',
                        'received': value
                    }), 400
                
                if value > max_value:
                    logger.warning(f"Invalid {param_name}: value {value} exceeds maximum {max_value}")
                    return jsonify({
                        'error': f'{param_name} must be <= {max_value}',
                        'received': value
                    }), 400
                
                request.args = request.args.copy()
                request.args[param_name] = value
                return f(*args, **kwargs)
                
            except ValueError:
                logger.warning(f"Invalid {param_name}: non-integer value '{request.args.get(param_name)}'")
                return jsonify({
                    'error': f'{param_name} must be an integer',
                    'received': request.args.get(param_name)
                }), 400
        
        return decorated_function
    return decorator


@app.route('/', methods=['GET'])
def home():
    """
    Home endpoint: Returns response time with simulated latency
    
    Returns:
        JSON response with message and delay
    """
    try:
        delay = random.uniform(MIN_DELAY, MAX_DELAY)
        time.sleep(delay)
        
        response_data = {
            'message': 'Mobile Cloud API',
            'delay': round(delay, 2),
            'timestamp': datetime.utcnow().isoformat(),
            'environment': APP_ENV
        }
        
        logger.info(f'Home endpoint called - delay: {delay:.2f}s')
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f'Error in home endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/data', methods=['GET'])
@validate_integer_param('size', min_value=1, max_value=MAX_DATA_SIZE)
def data():
    """
    Data endpoint: Returns generated dataset with specified size
    
    Query Parameters:
        size (int, optional): Number of data points to generate (default: 100, max: 5000)
    
    Returns:
        JSON response with count and sample data
    """
    try:
        size = int(request.args.get('size', 100))
        
        # Generate random data
        generated_data = [random.randint(1, 100) for _ in range(size)]
        
        response_data = {
            'count': len(generated_data),
            'sample': generated_data[:5],
            'timestamp': datetime.utcnow().isoformat(),
            'environment': APP_ENV
        }
        
        logger.info(f'Data endpoint called - size: {size}')
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f'Error in data endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint: Returns service status for Kubernetes probes
    
    Returns:
        Plain text 'ok' response with 200 status
    """
    try:
        logger.debug('Health check endpoint called')
        return 'ok', 200, {'Content-Type': 'text/plain'}
        
    except Exception as e:
        logger.error(f'Error in health endpoint: {str(e)}', exc_info=True)
        return 'error', 503, {'Content-Type': 'text/plain'}


@app.route('/status', methods=['GET'])
def status():
    """
    Detailed status endpoint: Returns service health status with metadata
    Useful for Kubernetes readiness probes
    
    Returns:
        JSON response with detailed status information
    """
    try:
        status_data = {
            'status': 'healthy',
            'service': 'Mobile Cloud API',
            'version': '1.0.0',
            'environment': APP_ENV,
            'timestamp': datetime.utcnow().isoformat(),
            'uptime': 'monitoring',
            'endpoints': {
                'home': '/',
                'data': '/data?size=100',
                'health': '/health',
                'status': '/status'
            }
        }
        
        logger.info('Status endpoint called')
        return jsonify(status_data), 200
        
    except Exception as e:
        logger.error(f'Error in status endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/metrics', methods=['GET'])
def metrics():
    """
    Metrics endpoint: Returns basic metrics for monitoring
    
    Returns:
        JSON response with metrics data
    """
    try:
        metrics_data = {
            'service': 'Mobile Cloud API',
            'timestamp': datetime.utcnow().isoformat(),
            'configuration': {
                'max_data_size': MAX_DATA_SIZE,
                'min_delay': MIN_DELAY,
                'max_delay': MAX_DELAY,
                'environment': APP_ENV
            }
        }
        
        logger.debug('Metrics endpoint called')
        return jsonify(metrics_data), 200
        
    except Exception as e:
        logger.error(f'Error in metrics endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors"""
    logger.warning(f'404 Not Found: {request.path}')
    return jsonify({'error': 'Endpoint not found', 'path': request.path}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 Method Not Allowed errors"""
    logger.warning(f'405 Method Not Allowed: {request.method} {request.path}')
    return jsonify({'error': 'Method not allowed', 'method': request.method}), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server errors"""
    logger.error(f'500 Internal Server Error: {str(error)}', exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Production: Use a proper WSGI server (gunicorn, uWSGI)
    # Development: Flask development server
    debug_mode = APP_ENV == 'development'
    logger.info(f'Starting Mobile Cloud API in {APP_ENV} environment')
    logger.info(f'Configuration: MIN_DELAY={MIN_DELAY}, MAX_DELAY={MAX_DELAY}, MAX_DATA_SIZE={MAX_DATA_SIZE}')
    
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=debug_mode,
        threaded=True
    )
