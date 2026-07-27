from flask import Flask, request, jsonify
from flask_cors import CORS
from googletrans import Translator
from youtube_transcript_api import YouTubeTranscriptApi
import traceback

app = Flask(__name__)
CORS(app)

translator = Translator()

@app.route('/translate', methods=['POST', 'OPTIONS'])
def translate():
    # 处理 CORS 预检请求
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        print("\n=== New Translation Request ===")
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
            
        text = data.get('text')
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        print(f"Translating text: {text}")

        try:
            # 使用 zh-CN 作为目标语言代码
            translation = translator.translate(text, dest='zh-CN')
            
            if not translation or not translation.text:
                return jsonify({'error': 'Translation failed'}), 500

            print(f"Translation successful: {translation.text}")
            
            return jsonify({
                'translation': translation.text,
                'source': translation.src,
                'target': translation.dest
            })
            
        except Exception as e:
            print(f"Translation API error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': f'Translation API error: {str(e)}'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/transcript', methods=['GET', 'OPTIONS'])
def get_transcript():
    # 处理 CORS 预检请求
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        print("\n=== New Transcript Request ===")
        video_id = request.args.get('videoId')
        if not video_id:
            return jsonify({'error': 'No video ID provided'}), 400
            
        print(f"Fetching transcript for video: {video_id}")

        try:
            # 获取字幕列表
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # 尝试获取英文字幕，如果没有则获取任何可用的字幕
            try:
                transcript = transcript_list.find_transcript(['en'])
            except:
                print("English transcript not found, getting first available")
                transcript = transcript_list.find_manually_created_transcript()
            
            # 获取字幕内容
            transcript_data = transcript.fetch()
            
            print(f"Transcript fetched successfully")
            
            return jsonify({
                'transcript': transcript_data,
                'language': transcript.language,
                'language_code': transcript.language_code
            })
            
        except Exception as e:
            print(f"Transcript API error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': f'Transcript API error: {str(e)}'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n=== Starting Translation Server ===")
    print("Server is running on http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True) 