# Student Productivity App

A comprehensive student productivity application that helps students manage their tasks, notes, and schedule.

python version : 3.11.11

## Features

- Task Management with due dates
- Dashboard with task completion tracking
- Notes functionality
- Calendar integration with FullCalendar.io
- Firebase backend integration

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up Firebase:
   - Create a Firebase project
   - Download your service account key (JSON file)
   - Place the JSON file in the project root
   - Update the Firebase initialization in `app.py` with your credentials file path

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run the application:
   ```bash
   python app.py
   ```

## Project Structure

```
.
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── static/            # Static files (CSS, JS, images)
├── templates/         # HTML templates
└── .env              # Environment variables
```

## API Endpoints

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a new task
- PUT /api/tasks/<task_id> - Update a task
- DELETE /api/tasks/<task_id> - Delete a task

### Notes
- GET /api/notes - Get all notes
- POST /api/notes - Create a new note
- PUT /api/notes/<note_id> - Update a note
- DELETE /api/notes/<note_id> - Delete a note

### Calendar Events
- GET /api/calendar/events - Get all calendar events
- POST /api/calendar/events - Create a new calendar event
- PUT /api/calendar/events/<event_id> - Update a calendar event
- DELETE /api/calendar/events/<event_id> - Delete a calendar event

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
