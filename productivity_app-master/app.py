import logging
import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_login import login_required, logout_user, current_user, login_user
from flask_login import LoginManager, UserMixin

from db_handler import DBModule
import firebase_admin
from firebase_admin import credentials, auth

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Initialize Firebase
db = DBModule()

# Initialize Firebase Admin
cred = credentials.Certificate("/Users/liuhongcheng/Desktop/productivity_app-master/config/studentproductivityapp-b-block-firebase-adminsdk-fbsvc-59e82bf71b.json")
firebase_admin.initialize_app(cred)

# Load Firebase Auth config
with open('config/firebase_auth.json', 'r') as f:
    firebase_config = json.load(f)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'signin'

class User(UserMixin):
    def __init__(self, uid, email):
        self.id = uid
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    try:
        user = auth.get_user(user_id)
        return User(user.uid, user.email)
    except:
        return None

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
        email = decoded_token['email']
        
        user = User(uid, email)
        login_user(user)
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "uid": uid,
                "email": email
            }
        }), 200
    except Exception as e:
        logging.error(f"Error in Google Auth: {str(e)}", exc_info=True)
        return jsonify({"error": f"Authentication failed: {str(e)}"}), 401

# Routes for rendering templates
@app.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('signin'))
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
    return render_template('signin.html', firebase_config=json.dumps(firebase_config))

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

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
