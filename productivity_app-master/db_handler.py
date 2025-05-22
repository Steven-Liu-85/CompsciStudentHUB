import json
import pyrebase
import bcrypt
import time
import uuid

class DBModule:
    def __init__(self):
        # Load Firebase configuration from json file
        with open('config/firebase_auth.json', 'r') as f:
            config = json.load(f)

        # Initialize Firebase with the configuration
        try:
            self.firebase = pyrebase.initialize_app(config)
            self.db = self.firebase.database()
            self.auth = self.firebase.auth()
            print("==============firebase connected!====================")
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            raise e

    def get_user_by_email(self, email):
        try:
            users_ref = self.db.child('users')
            all_users = users_ref.get()
            if all_users.each():
                for user in all_users.each():
                    if user.val().get('email') == email:
                        return user
            return None
        except Exception as e:
            print(f"Error getting user by email: {e}")
            return None

    def update_user(self, user_key, data):
        try:
            users_ref = self.db.child('users')
            users_ref.child(user_key).update(data)
            return True
        except Exception as e:
            print(f"Error updating user: {e}")
            return False

    def create_user_with_uid(self, uid, user_data):
        try:
            self.db.child("users").child(uid).set(user_data)
            return True
        except Exception as e:
            print(f"Error creating user with UID: {e}")
            return False

    def create_user(self, user_data):
        try:
            users_ref = self.db.child('users')
            new_user = users_ref.push(user_data)
            return new_user['name']  # Return the generated key
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    def register_local_user(self, name, email, password):
        try:
            uid = str(uuid.uuid4())
            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            user_data = {
                'email': email,
                'name': name,
                'password': hashed_pw,
                'provider': 'local',
                'created_at': int(time.time() * 1000)
            }

            return self.create_user_with_uid(uid, user_data)
        except Exception as e:
            print(f"Error registering local user: {e}")
            return False

    def validate_local_login(self, email, password):
        try:
            user = self.get_user_by_email(email)
            if not user:
                return None

            val = user.val()
            if val.get("provider") != "local":
                return "conflict"

            if bcrypt.checkpw(password.encode('utf-8'), val.get("password", "").encode('utf-8')):
                return user
            return None
        except Exception as e:
            print(f"Error validating local login: {e}")
            return None
        
    def delete_user(self, uid):
        try:
            self.db.child("users").child(uid).remove()
            return True
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False

    # Placeholders for future features
    def write_post(self):
        pass

    def get_posts(self):
        pass
