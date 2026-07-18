import sys
import types
import os
try:
    import pkg_resources
    if not hasattr(pkg_resources, 'resource_filename'):
        raise ImportError
except (ImportError, AttributeError):
    pkg_mock = types.ModuleType('pkg_resources')
    pkg_mock.declare_namespace = lambda name: None
    pkg_mock.get_distribution = lambda name: types.SimpleNamespace(version="0.0.0")
    pkg_mock.resource_filename = lambda package, resource: os.path.abspath(resource)
    sys.modules['pkg_resources'] = pkg_mock
from app import create_app
app = create_app()
if __name__ == '__main__':
    print("Starting backend server safely on http://127.0.0.1:5000 ...")
    app.run(debug=True, host='127.0.0.1', port=5000)
