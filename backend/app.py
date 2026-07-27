import json
import sqlite3
import traceback
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from googletrans import Translator
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)
CORS(app)
translator = Translator()
DB_PATH = Path(__file__).with_name('notesmart.sqlite3')


def connection():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, payload TEXT NOT NULL, last_modified TEXT NOT NULL)')
    db.execute('CREATE TABLE IF NOT EXISTS flashcards (note_id INTEGER PRIMARY KEY, payload TEXT NOT NULL)')
    return db


def json_error(message, status=400):
    return jsonify({'error': message}), status


@app.route('/ai/generate', methods=['POST', 'OPTIONS'])
def generate_ai():
    """Local-only proxy for OpenAI Responses, avoiding browser CORS restrictions."""
    if request.method == 'OPTIONS':
        return '', 204
    payload = request.get_json(silent=True) or {}
    api_key = payload.get('apiKey', '').strip()
    if not api_key:
        return json_error('No OpenAI API key was supplied')
    if payload.get('provider') != 'openai':
        return json_error('This local proxy currently supports OpenAI only')

    upstream_payload = {
        'model': payload.get('model'),
        'instructions': payload.get('instruction', ''),
        'input': payload.get('input', ''),
        'max_output_tokens': payload.get('maxTokens', 1800),
    }
    try:
        upstream = Request(
            'https://api.openai.com/v1/responses',
            data=json.dumps(upstream_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'},
            method='POST',
        )
        with urlopen(upstream, timeout=90) as response:
            data = json.loads(response.read().decode('utf-8'))
        text = data.get('output_text')
        if not text:
            return json_error('OpenAI returned no text output', 502)
        return jsonify({'text': text})
    except HTTPError as error:
        details = error.read().decode('utf-8', errors='replace')[:600]
        return jsonify({'error': details or error.reason}), error.code
    except URLError as error:
        return json_error(f'Could not reach OpenAI: {error.reason}', 502)
    except Exception as error:
        traceback.print_exc()
        return json_error(f'Local AI proxy failed: {error}', 500)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/notes/<int:note_id>', methods=['GET', 'PUT', 'OPTIONS'])
def note(note_id):
    if request.method == 'OPTIONS':
        return '', 204
    db = connection()
    try:
        if request.method == 'GET':
            row = db.execute('SELECT payload FROM notes WHERE id = ?', (note_id,)).fetchone()
            return json_error('Note not found', 404) if not row else jsonify(json.loads(row['payload']))

        payload = request.get_json(silent=True)
        if not payload or not payload.get('lastModified'):
            return json_error('A note payload with lastModified is required')
        payload['id'] = note_id
        existing = db.execute('SELECT payload, last_modified FROM notes WHERE id = ?', (note_id,)).fetchone()
        if existing and existing['last_modified'] > payload['lastModified']:
            return jsonify(json.loads(existing['payload'])), 409
        db.execute(
            'INSERT INTO notes (id, payload, last_modified) VALUES (?, ?, ?) '
            'ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, last_modified=excluded.last_modified',
            (note_id, json.dumps(payload), payload['lastModified']),
        )
        db.commit()
        return jsonify(payload)
    finally:
        db.close()


@app.route('/notes/<int:note_id>/flashcards', methods=['GET', 'PUT', 'OPTIONS'])
def flashcards(note_id):
    if request.method == 'OPTIONS':
        return '', 204
    db = connection()
    try:
        if request.method == 'GET':
            row = db.execute('SELECT payload FROM flashcards WHERE note_id = ?', (note_id,)).fetchone()
            return jsonify(json.loads(row['payload'])) if row else jsonify([])
        payload = request.get_json(silent=True)
        if not isinstance(payload, list):
            return json_error('Flashcards must be a JSON array')
        db.execute('INSERT INTO flashcards (note_id, payload) VALUES (?, ?) ON CONFLICT(note_id) DO UPDATE SET payload=excluded.payload', (note_id, json.dumps(payload)))
        db.commit()
        return jsonify(payload)
    finally:
        db.close()


@app.route('/translate', methods=['POST', 'OPTIONS'])
def translate():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    if not text:
        return json_error('No text provided')
    try:
        translation = translator.translate(text, dest=data.get('target', 'zh-CN'))
        return jsonify({'translation': translation.text, 'source': translation.src, 'target': translation.dest})
    except Exception as error:
        traceback.print_exc()
        return json_error(f'Translation API error: {error}', 500)


@app.route('/transcript', methods=['GET', 'OPTIONS'])
def get_transcript():
    if request.method == 'OPTIONS':
        return '', 204
    video_id = request.args.get('videoId')
    if not video_id:
        return json_error('No video ID provided')
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        try:
            transcript = transcript_list.find_transcript(['en'])
        except Exception:
            transcript = transcript_list.find_manually_created_transcript()
        return jsonify({'transcript': transcript.fetch(), 'language': transcript.language, 'language_code': transcript.language_code})
    except Exception as error:
        traceback.print_exc()
        return json_error(f'Transcript API error: {error}', 500)


if __name__ == '__main__':
    print('NoteSmart local service: http://127.0.0.1:5001')
    app.run(host='127.0.0.1', port=5001, debug=True)
