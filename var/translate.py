import requests
import json
from openai import OpenAI
import os
from time import sleep

POEDITOR_API_KEY = os.environ['POEDITOR_API_KEY']
POEDITOR_PROJECT_ID = os.environ['POEDITOR_PROJECT_ID']

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

LANGUAGE_CODES = [
    ("ar", "Arabic"),
    ("da", "Danish"),
    ("de", "German"),
    ("es", "Spanish"),
    ("fr", "French"),
    ("hi", "Hindi"),
    ("it", "Italian"),
    ("ja", "Japanese"),
    ("ko", "Korean"),
    ("nl", "Dutch"),
    ("no", "Norwegian"),
    ("pl", "Polish"),
    ("pt", "Portuguese"),
    ("pt-br", "Portuguese Brazilian"),
    ("sv", "Swedish"),
    ("ru", "Russian"),
    ("zh-Hans", "Simplified Chinese"),
    ("zh-Hant", "Traditional Chinese"),
]



# Function to translate text using OpenAI GPT-4o
def translate_text(text, lang, language):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Translate the following text to {language} language code '{lang}' and provide only the translated text with no additional commentary or explanations: {text}"}
        ]
    )
    translated_text = response.choices[0].message.content.strip()
    return translated_text

def translate_language(lang, language):
    data = [
        ('api_token', POEDITOR_API_KEY),
        ('action', 'export'),
        ('id', POEDITOR_PROJECT_ID),
        ('filters', 'untranslated'),
        ('language', lang),
        ('type', 'key_value_json'),
    ]

    r = requests.post('https://poeditor.com/api/', data=data, timeout=20.0)

    if not r.ok:
        print("Error: download_language")
        print(r.text)
        exit(1)

    result = r.json()

    r = requests.get(result['item'], stream=True, timeout=20.0)

    if r.status_code != 200:
        print(f"Error: download_language {lang}")
        print(r.text)
        exit(1)


    r.raw.decode_content = True
    content = r.raw.read()

    if not content:
        # no untranslated terms
        print(f"Success: nothing to translate for {lang}")
        return

    data = json.loads(content)

    if not data:
        # no untranslated terms
        print(f"Success: nothing to translate for {lang}")
        return

    translated_data = {}
    for key, value in data.items():
        translated_data[key] = translate_text(value, lang, language)

    folder_path = os.path.join('untranslated')
    os.makedirs(folder_path, exist_ok=True)
    path = os.path.join(folder_path, f"{lang}.json")
    with open(path, 'w') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=4)

    print(f"Translation completed and saved to {path}")

    data = {
        'id': POEDITOR_PROJECT_ID,
        'api_token': POEDITOR_API_KEY,
        'updating': 'translations',
        'language': lang,
        'sync_terms': 0,
    }
    with open(path, 'rb') as file:
        r = requests.post('https://api.poeditor.com/v2/projects/upload', data=data, files={'file': file}, timeout=20.0)

    if not r.ok:
        print("Error: upload_language " + lang)
        print(r.text)
        exit(1)
    content = json.loads(r.content)
    if "response" not in content or "status" not in content["response"] or content["response"]["status"] != 'success':
        print("Error: upload_language " + lang)
        print(r.text)
        exit(1)

    sleep(30)

    return path

def main():
    for lang, language in LANGUAGE_CODES:
        print("processing language " + lang)
        translate_language(lang, language)

    print("Success")

if __name__ == "__main__":
    main()
