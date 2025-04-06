# Cordova MensaCard Balance Demo

## Development

### Prerequisites

-   Node.js
-   Cordova: `npm i -g cordova`
-   Android Studio
-   Gradle: `brew install gradle`

### Setup

1. Clone the repository
1. Install dependencies: `npm install`

### Run

```
cordova run android
```

### Build

```
cordova build android
```

### Changing the main UI

The main UI is embedded using an iframe, by default it loads `docs/index.html` served via GitHub Pages. For local debugging, you need to:

1. Change to the `docs` directory
1. Generate openssl certs: `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`
1. Start a local server: `npx http-server -S`
1. Update the URL in `www/index.html` to point to your local server, e.g. `https://192.168.178.15:8082`
1. Rerun the app: `cordova run android`
