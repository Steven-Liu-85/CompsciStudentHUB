from app import app

import sys
if sys.version_info >= (3, 10):
    import collections, collections.abc
    collections.Mapping        = collections.abc.Mapping
    collections.MutableMapping = collections.abc.MutableMapping
    collections.Callable       = collections.abc.Callable   # if needed

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
