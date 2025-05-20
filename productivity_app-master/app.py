import logging
import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_login import login_required, logout_user, current_user, login_user
from flask_login import LoginManager, UserMixin
import bcrypt 

from db_handler import DBModule
import firebase_admin
from firebase_admin import credentials, auth

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Initialize Firebase Admin SDK
cred = credentials.Certificate("config/service_account_key.json")
firebase_admin.initialize_app(cred)

# Initialize Firebase Realtime Database
db = DBModule()

# Load Firebase Auth config
with open('config/firebase_auth.json', 'r') as f:
    firebase_config = json.load(f)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'signin'

class User(UserMixin):

    def __init__(self, uid, email, name=None):
        self.id = uid
        self.email = email
        self.name = name or email.split('@')[0]  # Use email username if name not provided

@login_manager.user_loader
def load_user(user_id):
    try:
        user_data = db.db.child('users').child(user_id).get().val()
        if user_data:
            return User(user_id, user_data['email'], user_data['name'])
    except Exception as e:
        print(f"Error loading user: {e}")
        return None

# Routes for rendering templates
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup')
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('signup.html')

@app.route('/signin')
def signin():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    # Load Firebase config
    with open('config/firebase_auth.json', 'r') as f:
        firebase_config = json.load(f)
    return render_template('signin.html', firebase_config=firebase_config)

@app.route('/dashboard')
def dashboard():
    return render_template('index.html')  # Dashboard uses index.html

@app.route('/tasks')
def tasks():
    return render_template('tasks.html')

@app.route('/notes')
def notes():
    return render_template('notes.html')

@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('signin'))

@app.route('/api/register_user', methods=['POST'])
def register_user():
    try:
        data = request.json
        email = data.get('email')
        name = data.get('name')

        if db.sign_up(email, name):
            return jsonify({"message": "User registered successfully"}), 200
        else:
            return jsonify({"error": "Failed to register user"}), 500
    except Exception as e:
        logging.error(f"Error registering user: {e}")
        return jsonify({"error": "Failed to register user"}), 500
        
# API Routes for Tasks
@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    try:
        tasks_ref = db.child('users').child(current_user.id).child('tasks')
        tasks = tasks_ref.get().val()
        return jsonify({
            "tasks": [{"id": task_id, **task} for task_id, task in tasks.items()]
        })
    except Exception as e:
        logging.error(f"Error fetching tasks: {e}")
        return jsonify({"error": "Failed to fetch tasks"}), 500

@app.route('/api/tasks', methods=['POST'])
@login_required
def create_task():
    try:
        data = request.json
        data['created_at'] = {'.sv': 'timestamp'}
        data['updated_at'] = {'.sv': 'timestamp'}
        
        task_ref = db.child('users').child(current_user.id).child('tasks').push(data)
        
        return jsonify({
            "message": "Task created successfully",
            "task": {"id": task_ref['name'], **data}
        })
    except Exception as e:
        logging.error(f"Error creating task: {e}")
        return jsonify({"error": "Failed to create task"}), 500

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    try:
        data = request.json
        data['updated_at'] = {'.sv': 'timestamp'}
        
        task_ref = db.child('users').child(current_user.id).child('tasks').child(task_id)
        task_ref.update(data)
        
        return jsonify({
            "message": "Task updated successfully",
            "task": {"id": task_id, **data}
        })
    except Exception as e:
        logging.error(f"Error updating task: {e}")
        return jsonify({"error": "Failed to update task"}), 500

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    try:
        task_ref = db.child('users').child(current_user.id).child('tasks').child(task_id)
        task_ref.remove()
        return jsonify({"message": "Task deleted successfully"})
    except Exception as e:
        logging.error(f"Error deleting task: {e}")
        return jsonify({"error": "Failed to delete task"}), 500

# API Routes for Notes
@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    try:
        notes_ref = db.child('users').child(current_user.id).child('notes')
        notes = notes_ref.get().val()
        return jsonify({
            "notes": [{"id": note_id, **note} for note_id, note in notes.items()]
        })
    except Exception as e:
        logging.error(f"Error fetching notes: {e}")
        return jsonify({"error": "Failed to fetch notes"}), 500

@app.route('/api/notes', methods=['POST'])
@login_required
def create_note():
    try:
        data = request.json
        data['created_at'] = {'.sv': 'timestamp'}
        data['updated_at'] = {'.sv': 'timestamp'}
        
        note_ref = db.child('users').child(current_user.id).child('notes').push(data)
        
        return jsonify({
            "message": "Note created successfully",
            "note": {"id": note_ref['name'], **data}
        })
    except Exception as e:
        logging.error(f"Error creating note: {e}")
        return jsonify({"error": "Failed to create note"}), 500

@app.route('/api/notes/<note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    try:
        data = request.json
        data['updated_at'] = {'.sv': 'timestamp'}
        
        note_ref = db.child('users').child(current_user.id).child('notes').child(note_id)
        note_ref.update(data)
        
        return jsonify({
            "message": "Note updated successfully",
            "note": {"id": note_id, **data}
        })
    except Exception as e:
        logging.error(f"Error updating note: {e}")
        return jsonify({"error": "Failed to update note"}), 500

@app.route('/api/notes/<note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    try:
        note_ref = db.child('users').child(current_user.id).child('notes').child(note_id)
        note_ref.remove()
        return jsonify({"message": "Note deleted successfully"})
    except Exception as e:
        logging.error(f"Error deleting note: {e}")
        return jsonify({"error": "Failed to delete note"}), 500

# API Routes for Calendar Events
@app.route('/api/calendar/events', methods=['GET'])
@login_required
def get_calendar_events():
    try:
        events_ref = db.child('users').child(current_user.id).child('events')
        events = events_ref.get().val()
        return jsonify({
            "events": [{"id": event_id, **event} for event_id, event in events.items()]
        })
    except Exception as e:
        logging.error(f"Error fetching events: {e}")
        return jsonify({"error": "Failed to fetch events"}), 500

@app.route('/api/calendar/events', methods=['POST'])
@login_required
def create_calendar_event():
    try:
        data = request.json
        data['created_at'] = {'.sv': 'timestamp'}
        data['updated_at'] = {'.sv': 'timestamp'}
        
        event_ref = db.child('users').child(current_user.id).child('events').push(data)
        
        return jsonify({
            "message": "Event created successfully",
            "event": {"id": event_ref['name'], **data}
        })
    except Exception as e:
        logging.error(f"Error creating event: {e}")
        return jsonify({"error": "Failed to create event"}), 500

@app.route('/api/calendar/events/<event_id>', methods=['PUT'])
@login_required
def update_calendar_event(event_id):
    try:
        data = request.json
        data['updated_at'] = {'.sv': 'timestamp'}
        
        event_ref = db.child('users').child(current_user.id).child('events').child(event_id)
        event_ref.update(data)
        
        return jsonify({
            "message": "Event updated successfully",
            "event": {"id": event_id, **data}
        })
    except Exception as e:
        logging.error(f"Error updating event: {e}")
        return jsonify({"error": "Failed to update event"}), 500

@app.route('/api/calendar/events/<event_id>', methods=['DELETE'])
@login_required
def delete_calendar_event(event_id):
    try:
        event_ref = db.child('users').child(current_user.id).child('events').child(event_id)
        event_ref.remove()
        return jsonify({"message": "Event deleted successfully"})
    except Exception as e:
        logging.error(f"Error deleting event: {e}")
        return jsonify({"error": "Failed to delete event"}), 500

@app.route('/api/auth/signup', methods=['POST'])
def local_signup():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        existing_user = db.get_user_by_email(email)
        if existing_user:
            if existing_user.val().get('provider') != 'local':
                return jsonify({"error": "Email already registered with another provider."}), 409
            return jsonify({"error": "Email already registered."}), 409

        success = db.register_local_user(name, email, password)
        if success:
            user = db.get_user_by_email(email)
            if user:
                user_obj = User(user.key(), email, name)
                login_user(user_obj)
    
            return jsonify({"message": "User registered successfully."}), 200
        return jsonify({"error": "Registration failed."}), 500

    except Exception as e:
        logging.error(f"Error in signup: {e}", exc_info=True)
        return jsonify({"error": "Internal server error."}), 500



@app.route('/api/auth/login', methods=['POST'])
def local_login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        user = db.validate_local_login(email, password)
        if user == "conflict":
            return jsonify({"error": "Email registered via Google. Please use Google Login."}), 403
        if not user:
            return jsonify({"error": "Invalid email or password."}), 401

        val = user.val()
        uid = user.key()
        name = val.get('name')

        login_user(User(uid, email, name))
        return jsonify({
            "message": "Login successful",
            "user": {
                "uid": uid,
                "email": email,
                "name": name
            }
        }), 200

    except Exception as e:
        logging.error(f"Error in login: {e}", exc_info=True)
        return jsonify({"error": "Internal server error."}), 500
    
@app.route('/profile')
@login_required
def profile():
    user_data = db.db.child('users').child(current_user.id).get().val()
    joined = user_data.get('created_at')
    from datetime import datetime
    joined_date = datetime.fromtimestamp(joined / 1000).strftime('%B %d, %Y') if joined else None
    return render_template('profile.html', joined_date=joined_date)

# API Routes for Google Authentication
@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    try:
        id_token = request.json.get('idToken')
        if not id_token:
            logging.error("No ID token provided")
            return jsonify({"error": "No ID token provided"}), 400
            
        logging.debug(f"Received ID token: {id_token[:20]}...")
        
        decoded_token = auth.verify_id_token(id_token)
        logging.debug(f"Decoded token: {decoded_token}")
        
        uid = decoded_token['uid']
        created_at = request.json.get('createdAt')
        email = decoded_token['email']
        name = decoded_token.get('name', email.split('@')[0])  # Use email username if name not provided
        
        # Save or update user in Firebase Realtime Database
        user_data = {
            'email': email,
            'name': name,
            'last_login': {'.sv': 'timestamp'},
            'provider': 'google',
            'created_at': created_at or {'.sv': 'timestamp'}
        }
        
        # Check if user exists
        existing_user = db.get_user_by_email(email)
        
        if existing_user:
            # Update last login time for existing user
            db.update_user(existing_user.key(), {'last_login': {'.sv': 'timestamp'}})
            uid = existing_user.key()  # Use the existing user's key
            logging.info(f"Updated existing user: {uid}")
        else:
            # Create new user
            uid = db.create_user(user_data)
            if not uid:
                raise Exception("Failed to create new user")
            logging.info(f"Created new user: {uid}")
        
        user = User(uid, email, name)
        login_user(user)
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "uid": uid,
                "email": email,
                "name": name
            }
        }), 200
    except Exception as e:
        logging.error(f"Error in Google Auth: {str(e)}", exc_info=True)
        return jsonify({"error": f"Authentication failed: {str(e)}"}), 401

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
