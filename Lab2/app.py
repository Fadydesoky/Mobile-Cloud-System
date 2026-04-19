"""
Lab2: Distributed Consistency and Cloud Systems
Redis-based distributed system simulation with error handling
"""

from flask import Flask, jsonify, request
import redis
import logging
import os
from datetime import datetime

# Configuration from environment
REDIS_PRIMARY_HOST = os.getenv('REDIS_PRIMARY_HOST', 'localhost')
REDIS_PRIMARY_PORT = int(os.getenv('REDIS_PRIMARY_PORT', 6379))
REDIS_REPLICA_HOST = os.getenv('REDIS_REPLICA_HOST', 'localhost')
REDIS_REPLICA_PORT = int(os.getenv('REDIS_REPLICA_PORT', 6380))
REDIS_TIMEOUT = int(os.getenv('REDIS_TIMEOUT', 5))
APP_ENV = os.getenv('APP_ENV', 'development')

app = Flask(__name__)

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Redis connection pool
redis_primary = None
redis_replica = None

def init_redis_connections():
    """Initialize Redis connections with error handling"""
    global redis_primary, redis_replica
    
    try:
        redis_primary = redis.Redis(
            host=REDIS_PRIMARY_HOST,
            port=REDIS_PRIMARY_PORT,
            socket_connect_timeout=REDIS_TIMEOUT,
            decode_responses=True,
            retry_on_timeout=True
        )
        # Test connection
        redis_primary.ping()
        logger.info(f'Connected to primary Redis at {REDIS_PRIMARY_HOST}:{REDIS_PRIMARY_PORT}')
    except Exception as e:
        logger.warning(f'Failed to connect to primary Redis: {str(e)}')
        redis_primary = None
    
    try:
        redis_replica = redis.Redis(
            host=REDIS_REPLICA_HOST,
            port=REDIS_REPLICA_PORT,
            socket_connect_timeout=REDIS_TIMEOUT,
            decode_responses=True,
            retry_on_timeout=True
        )
        # Test connection
        redis_replica.ping()
        logger.info(f'Connected to replica Redis at {REDIS_REPLICA_HOST}:{REDIS_REPLICA_PORT}')
    except Exception as e:
        logger.warning(f'Failed to connect to replica Redis: {str(e)}')
        redis_replica = None

# CORS headers
@app.after_request
def add_cors_headers(response):
    """Add CORS headers for cross-origin requests"""
    response.headers['Access-Control-Allow-Origin'] = os.getenv('CORS_ORIGIN', '*')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

@app.route('/', methods=['GET'])
def home():
    """Home endpoint: Returns API information"""
    try:
        response_data = {
            'service': 'Redis Distributed Consistency Simulation API',
            'version': '1.0.0',
            'environment': APP_ENV,
            'timestamp': datetime.utcnow().isoformat(),
            'endpoints': {
                'write': '/write',
                'read-primary': '/read-primary',
                'read-replica': '/read-replica',
                'status': '/status',
                'health': '/health'
            }
        }
        logger.info('Home endpoint called')
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f'Error in home endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/write', methods=['POST', 'GET'])
def write():
    
    POST Parameters (preferred):
        key (str): Key to write
        value (str): Value to write
    
    GET Parameters (for testing):
        key (str, optional): Key to write (default: 'test_key')
        value (str, optional): Value to write (default: 'hello')
    
    Returns:
        JSON response with write status

    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            key = data.get('key', 'test_key')
            value = data.get('value', 'hello')
        else:
            key = request.args.get('key', 'test_key')
            value = request.args.get('value', 'hello')
        
        # Input validation
        if not key or not isinstance(key, str) or len(key) > 256:
            return jsonify({
                'error': 'Invalid key: must be non-empty string (max 256 chars)'
            }), 400
        
        if not value or not isinstance(value, str) or len(value) > 1024:
            return jsonify({
                'error': 'Invalid value: must be non-empty string (max 1024 chars)'
            }), 400
        
        if redis_primary:
            redis_primary.set(key, value, ex=3600)  # Expires in 1 hour
            response_data = {
                'status': 'success',
                'message': 'Data written to primary node',
                'key': key,
                'timestamp': datetime.utcnow().isoformat(),
                'ttl': 3600
            }
            logger.info(f'Data written to primary: key={key}, value_len={len(value)}')
            return jsonify(response_data), 200
        else:
            return jsonify({
                'error': 'Primary Redis not available',
                'status': 'degraded'
            }), 503
    
    except Exception as e:
        logger.error(f'Error in write endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/read-primary', methods=['GET'])
def read_primary():
    """Read data from primary Redis node"""
    
    Query Parameters:
        key (str, optional): Key to read (default: 'test_key')
    
    Returns:
        JSON response with primary node data
    
    try:
        key = request.args.get('key', 'test_key')
        
        if not key or not isinstance(key, str):
            return jsonify({'error': 'Invalid key parameter'}), 400
        
        if redis_primary:
            value = redis_primary.get(key)
            response_data = {
                'source': 'primary',
                'key': key,
                'value': value,
                'found': value is not None,
                'timestamp': datetime.utcnow().isoformat()
            }
            logger.info(f'Read from primary: key={key}, found={value is not None}')
            return jsonify(response_data), 200
        else:
            return jsonify({
                'error': 'Primary Redis not available',
                'status': 'degraded'
            }), 503
    
    except Exception as e:
        logger.error(f'Error in read_primary endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/read-replica', methods=['GET'])
def read_replica():
    """Read data from replica Redis node"""
    
    Query Parameters:
        key (str, optional): Key to read (default: 'test_key')
    
    Returns:
        JSON response with replica node data (may be stale due to replication lag)
    
    try:
        key = request.args.get('key', 'test_key')
        
        if not key or not isinstance(key, str):
            return jsonify({'error': 'Invalid key parameter'}), 400
        
        if redis_replica:
            value = redis_replica.get(key)
            response_data = {
                'source': 'replica',
                'key': key,
                'value': value,
                'found': value is not None,
                'timestamp': datetime.utcnow().isoformat(),
                'consistency': 'eventual (may be stale)'
            }
            logger.info(f'Read from replica: key={key}, found={value is not None}')
            return jsonify(response_data), 200
        else:
            return jsonify({
                'error': 'Replica Redis not available',
                'status': 'degraded'
            }), 503
    
    except Exception as e:
        logger.error(f'Error in read_replica endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/status', methods=['GET'])
def status():
    """System status endpoint: Returns health information for both nodes"""
    
    Returns:
        JSON response with status of both primary and replica nodes
    
    try:
        primary_status = 'healthy'
        replica_status = 'healthy'
        
        if redis_primary:
            try:
                redis_primary.ping()
            except Exception:
                primary_status = 'unhealthy'
        else:
            primary_status = 'unavailable'
        
        if redis_replica:
            try:
                redis_replica.ping()
            except Exception:
                replica_status = 'unhealthy'
        else:
            replica_status = 'unavailable'
        
        response_data = {
            'service': 'Redis Distributed System',
            'timestamp': datetime.utcnow().isoformat(),
            'nodes': {
                'primary': {
                    'host': REDIS_PRIMARY_HOST,
                    'port': REDIS_PRIMARY_PORT,
                    'status': primary_status
                },
                'replica': {
                    'host': REDIS_REPLICA_HOST,
                    'port': REDIS_REPLICA_PORT,
                    'status': replica_status
                }
            },
            'overall_status': 'healthy' if primary_status == 'healthy' else 'degraded'
        }
        
        logger.info(f'Status check: primary={primary_status}, replica={replica_status}')
        return jsonify(response_data), 200
    
    except Exception as e:
        logger.error(f'Error in status endpoint: {str(e)}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Kubernetes liveness probe"""
    
    Returns:
        Plain text 'ok' or error message
    
    try:
        logger.debug('Health check called')
        return 'ok', 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        logger.error(f'Error in health endpoint: {str(e)}', exc_info=True)
        return 'error', 503, {'Content-Type': 'text/plain'}

@app.route('/ready', methods=['GET'])
def ready():
    """Readiness probe: Checks if primary Redis is available"""
    
    Returns:
        200 if ready, 503 if not ready
    
    try:
        if redis_primary:
            redis_primary.ping()
            logger.debug('Readiness check: ready')
            return 'ready', 200, {'Content-Type': 'text/plain'}
        else:
            logger.warning('Readiness check: not ready - primary unavailable')
            return 'not ready', 503, {'Content-Type': 'text/plain'}
    except Exception as e:
        logger.warning(f'Readiness check failed: {str(e)}')
        return 'not ready', 503, {'Content-Type': 'text/plain'}

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    logger.warning(f'404 Not Found: {request.path}')
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f'500 Internal Server Error: {str(error)}', exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize Redis connections
    init_redis_connections()
    
    logger.info(f'Starting Lab2 Distributed System API in {APP_ENV} environment')
    logger.info(f'Primary Redis: {REDIS_PRIMARY_HOST}:{REDIS_PRIMARY_PORT}')
    logger.info(f'Replica Redis: {REDIS_REPLICA_HOST}:{REDIS_REPLICA_PORT}')
    
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5001)),
        debug=APP_ENV == 'development',
        threaded=True
    )
