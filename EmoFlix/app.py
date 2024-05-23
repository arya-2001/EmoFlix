from flask import Flask, render_template, request, jsonify, session, Response
from keras.models import load_model
import cv2
import numpy as np
import random
import requests
from keras.preprocessing.image import img_to_array


TMDB_API_KEY = '2807f073ab621c4f31a2ab144662b84f'
app = Flask(__name__)

face_classifier = cv2.CascadeClassifier('haarcascade_frontalface_alt.xml')
emotion_labels = ['Angry', 'Disgusted', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprised']
current_emotion_label = None
camera_active = None
app.secret_key = 'akash'  # Set a secret key for session management
model = load_model('new_model.keras')

def gen_frames():
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break
        else:

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_classifier.detectMultiScale(gray)

            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
                roi_gray = gray[y:y + h, x:x + w]
                roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)

                if np.sum([roi_gray]) != 0:
                    roi = roi_gray.astype('float') / 255.0
                    roi = img_to_array(roi)
                    roi = np.expand_dims(roi, axis=0)

                    prediction = model.predict(roi)[0]
                    label = emotion_labels[prediction.argmax()]
                    global current_emotion_label
                    current_emotion_label = label
                    label_position = (x, y)
                    cv2.putText(frame, label, label_position, cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    print("Detected emotion:", label)  
                else:
                    cv2.putText(frame, 'No Faces', (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()
    cv2.destroyAllWindows()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect_emotion', methods=['POST'])

def detect_emotion():
    global current_emotion_label
    if current_emotion_label:
        session['detected_emotion'] = current_emotion_label
        return jsonify({'current_emotion_label': current_emotion_label})
    else:
        return jsonify({'current_emotion_label': None})


@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_camera', methods=['POST'])
def start_camera():
    global camera_active
    camera_active = True
    return jsonify({'message': 'Camera started'})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    global camera_active
    camera_active = False
    return jsonify({'message': 'Camera Stopped'})


@app.route('/recommend', methods=['GET'])
def recommend_movies():
    
    emotion = session.get('detected_emotion')

    if emotion:
        emotion = emotion.lower()

        # Define a default value for input_genre
        input_genre = None

        if emotion == "sad":
            input_genre = ["Drama", "Romance", "Music", "Comedy"]
        elif emotion == "disgusted":
            input_genre = ["Music", "Animation", "Comedy"]
        elif emotion == "angry":
            input_genre = ["Music", "Romance", "Drama","Family", "Thriller"]
        elif emotion == "fear":
            input_genre = ["Comedy", "Fantasy", "Adventure", "History"]
        elif emotion == "happy":
            input_genre = ["Comedy", "Music", "Romance", "Drama","Family", "Fantasy", "Adventure", "History", "Action", "Thriller","Horror"]
        elif emotion == "neutral":
            input_genre = ["Documentary", "Family", "Horror", "War"]
        elif emotion == "surprised":
            input_genre = ["Mystery", "Science Fiction", "Adventure"]

        if input_genre is not None:
            # Step 1: Get the genre ID for the input genre
            genre_url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={TMDB_API_KEY}"
            response = requests.get(genre_url)
            genre_data = response.json()

            genre_id = None
            for genre in genre_data['genres']:
                if genre['name'].lower() in [g.lower() for g in input_genre]:
                    genre_id = genre['id']
                    break

            if genre_id is None:
                return jsonify(f"Genre '{input_genre}' not found.")
            else:
                # Step 2: Search for movies based on genre ID
                url = f'https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&with_genres={genre_id}'
                response = requests.get(url)
                if response.status_code == 200:
                    data = response.json()
                    movies = [{'id': movie['id'],'title': movie['title'], 'poster_path': movie['poster_path'],'vote_average': movie['vote_average']} for movie in
                              data['results']]
                    
                    # Shuffle the list of movies
                    random.shuffle(movies)
                    
                    # Select the first 5 movies (or fewer if less than 5 are available)
                    selected_movies = movies[:5]
                    
                    return jsonify({'movies': selected_movies})
                else:
                    return jsonify({'error': 'Failed to fetch movie recommendations'}), 500
    else:
        return jsonify({'error': 'No emotion detected'}), 400

if __name__ == '__main__':
    app.run(debug=True)
