import json
import pyrebase


class DBModule:
    def __init__(self):
        # Load Firebase configuration from json file
        with open('config/firebase_auth.json', 'r') as f:
            config = json.load(f)

        self.firebase = pyrebase.initialize_app(config)
        self.db = self.firebase.database()
        print("==============firebase connected!====================")

    def sign_up(self, email, name):
        try:
            user_data = {
                'email': email,
                'name': name
            }
            self.db.child('users').push(user_data)
            return True
        except Exception as e:
            print(f"Error in sign_up: {e}")
            return False

    def login(self, id, pwd):
        pass

    def sign_in(self, id, pwd, email):
        pass

    def write_post(self):
        pass

    def get_posts(self):
        pass
