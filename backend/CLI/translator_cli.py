#!/usr/bin/env python3
"""
Real-Time Voice Translator (CLI Version)
Supports voice commands in multiple languages
"""

import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
from playsound import playsound
import os
from datetime import datetime

# Supported voice commands in multiple languages
STOP_COMMANDS = [
    "stop translation", "stop", "end", "quit", "exit",
    "अनुवाद बंद करो", "बंद करो", "रुको",
    "翻訳を停止", "停止",
    "detener traducción", "detener", "parar",
    "arrêter la traduction", "arrêter",
    "übersetzung stoppen", "stoppen"
]

CHANGE_COMMANDS = [
    "change language", "switch language", "change",
    "भाषा बदलो", "बदलो",
    "言語を変更", "変更",
    "cambiar idioma", "cambiar",
    "changer de langue", "changer",
    "sprache ändern", "ändern"
]

# Supported languages (expanded list)
LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ja": "Japanese",
    "zh-CN": "Chinese (Simplified)",
    "ar": "Arabic",
    "ru": "Russian",
    "pt": "Portuguese",
    "it": "Italian",
    "ko": "Korean"
}

# History file
HISTORY_FILE = "cli_translation_history.txt"

def clear_screen():
    """Clear terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """Print application header"""
    print("=" * 70)
    print("🌍 REAL-TIME VOICE TRANSLATOR (CLI)".center(70))
    print("=" * 70)
    print()

def speak_text(text, lang):
    """
    Speak text using Google Text-to-Speech
    Creates temporary audio file and plays it
    """
    try:
        print(f"🔊 SPEAKING: {text}")
        tts = gTTS(text=text, lang=lang, slow=False)
        audio_file = "temp_output.mp3"
        tts.save(audio_file)
        playsound(audio_file)
        os.remove(audio_file)
        print("✅ Spoken successfully\n")
    except Exception as e:
        print(f"❌ Speech error: {e}\n")

def save_translation(original, translated, src_lang, dest_lang):
    """Save translation to history file"""
    try:
        with open(HISTORY_FILE, "a", encoding="utf-8") as file:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            file.write(f"\n[{timestamp}]\n")
            file.write(f"ORIGINAL ({LANGUAGES[src_lang]}): {original}\n")
            file.write(f"TRANSLATED ({LANGUAGES[dest_lang]}): {translated}\n")
            file.write(f"{'-' * 60}\n")
    except Exception as e:
        print(f"⚠️ Could not save history: {e}")

def get_language_input(prompt):
    """
    Get language selection from user
    Returns language code
    """
    print("\n" + prompt)
    print("-" * 40)
    
    # Display languages in columns
    lang_items = list(LANGUAGES.items())
    for i in range(0, len(lang_items), 2):
        lang1 = f"{lang_items[i][0]}: {lang_items[i][1]}"
        if i + 1 < len(lang_items):
            lang2 = f"{lang_items[i+1][0]}: {lang_items[i+1][1]}"
            print(f"{lang1:30} {lang2}")
        else:
            print(lang1)
    
    print("-" * 40)
    
    while True:
        lang = input("Enter language code: ").strip().lower()
        if lang in LANGUAGES:
            print(f"✅ Selected: {LANGUAGES[lang]}\n")
            return lang
        print("❌ Invalid code. Try again.")

def listen_and_translate(input_lang, output_lang):
    """
    Main translation loop
    Listens for speech, translates, and speaks result
    Returns 'change' if user wants to change language, None otherwise
    """
    recognizer = sr.Recognizer()
    translator = Translator()

    print("\n" + "=" * 70)
    print(f"🎤 TRANSLATION ACTIVE: {LANGUAGES[input_lang]} → {LANGUAGES[output_lang]}")
    print("=" * 70)
    print("\n💡 COMMANDS:")
    print("   • Say 'stop translation' to end")
    print("   • Say 'change language' to switch languages")
    print("\n🎤 Listening... Speak now!\n")

    with sr.Microphone() as source:
        while True:
            try:
                # Listen for audio
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
                
                # Recognize speech
                text = recognizer.recognize_google(audio, language=input_lang)
                
                print("-" * 70)
                print(f"🎤 ORIGINAL ({LANGUAGES[input_lang]}):")
                print(f"   {text}")
                print()

                # Check for commands
                text_lower = text.lower()
                
                if any(cmd in text_lower for cmd in STOP_COMMANDS):
                    print("🛑 Stopping translation...")
                    return None

                if any(cmd in text_lower for cmd in CHANGE_COMMANDS):
                    print("🔄 Changing languages...")
                    return "change"

                # Translate
                translated = translator.translate(text, src=input_lang, dest=output_lang)
                translated_text = translated.text
                
                print(f"🌐 TRANSLATED ({LANGUAGES[output_lang]}):")
                print(f"   {translated_text}")
                print("-" * 70)
                print()
                
                # Save to history
                save_translation(text, translated_text, input_lang, output_lang)
                
                # Speak translation
                speak_text(translated_text, output_lang)
                
                print("🎤 Ready for next input...\n")

            except sr.WaitTimeoutError:
                print("⏱️  No speech detected. Listening...\n")
                continue
                
            except sr.UnknownValueError:
                print("🤔 Could not understand audio. Please speak clearly.\n")
                continue
                
            except sr.RequestError as e:
                print(f"❌ Speech recognition error: {e}")
                print("⚠️  Check your internet connection.\n")
                return None
                
            except Exception as e:
                print(f"⚠️  Error: {e}\n")
                continue

def view_history():
    """Display translation history"""
    if os.path.exists(HISTORY_FILE):
        print("\n" + "=" * 70)
        print("📜 TRANSLATION HISTORY")
        print("=" * 70 + "\n")
        
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            history = file.read()
            print(history)
        
        input("\nPress Enter to continue...")
    else:
        print("\n📭 No translation history found.\n")
        input("Press Enter to continue...")

def main():
    """Main application entry point"""
    clear_screen()
    print_header()
    
    print("Welcome to Real-Time Voice Translator!")
    print("\n🎯 Features:")
    print("   • Real-time speech recognition")
    print("   • Instant translation")
    print("   • Text-to-speech output")
    print("   • Voice command support")
    print("   • Translation history\n")
    
    # Check for history
    if os.path.exists(HISTORY_FILE):
        view_hist = input("📜 View previous translation history? (y/n): ").strip().lower()
        if view_hist == 'y':
            view_history()
            clear_screen()
            print_header()
    
    while True:
        # Get language selection
        input_lang = get_language_input("🎤 SELECT INPUT LANGUAGE (what you'll speak):")
        output_lang = get_language_input("🌐 SELECT OUTPUT LANGUAGE (translation target):")
        
        # Start translation
        action = listen_and_translate(input_lang, output_lang)
        
        if action != "change":
            break
        
        # Clear screen for new language selection
        clear_screen()
        print_header()
    
    print("\n" + "=" * 70)
    print("👋 Thank you for using Voice Translator!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Translation stopped by user.")
        print("👋 Goodbye!\n")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        print("Please restart the application.\n")