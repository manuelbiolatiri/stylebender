# Voice input (mobile Home)

Mobile Home offers a secondary **Speak** button when the browser exposes the Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`).

- A tap starts browser-managed speech recognition and may prompt for microphone permission.
- As words are recognised, they populate the **existing editable occasion textarea**; pre-existing text is preserved.
- Tap **Stop** to finish. Voice input **does not generate an outfit** or call Gemini; the user still selects **Style my look**.
- A permission, microphone, recognition or network error is explained without blocking typing.
- If the API is unavailable the button is omitted and typing plus **Use an example** remain.
- Recognition is aborted when leaving Home. No audio is stored or uploaded by Stylebender code. The browser or OS speech service may process audio remotely according to its own privacy policies; do not represent recognition as universally offline.
- No backend, auth, account, saved-look or Gemini changes.

## QA
```bash
yarn typecheck
yarn test
yarn build
yarn test:e2e tests/e2e/voice-occasion.spec.ts
```

These tests fake browser recognition and make **zero paid Gemini calls**. They do not prove real microphone permissions, transcription accuracy or Safari/Chrome support. Confirm on physical iPhone Safari, iOS Chrome and Android Chrome: start, deny permission, stop, edit recognised text, generate manually and navigate away during recording.

Do not automatically submit the text after recognition, or silently request microphone access during page load.
