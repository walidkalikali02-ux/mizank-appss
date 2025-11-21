
# Mizank (CalApp) - AI Calorie Tracker

A smart, multilingual (Arabic/English) calorie and macronutrient tracker powered by Google's Gemini 2.5 API.

## Features

- **AI Food Analysis**: Upload photos or describe meals to get instant nutritional data (Calories, Protein, Carbs, Fat).
- **Multilingual Support**: Fully localized for Arabic (RTL) and English (LTR).
- **Interactive Visualizations**: 
  - Daily timeline showing calorie intake over time.
  - Macro distribution charts.
  - Daily goal progress rings.
- **Goal Setting**: Customize your daily targets for calories and macros.
- **Local Storage**: Data persists in your browser's local storage.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Visualization**: Recharts
- **Icons**: Lucide React

## Setup & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mizank-calapp.git
   ```

2. **API Key Configuration**
   This application requires a Google Gemini API Key.
   
   If running in a local development environment using Node/Vite:
   - Create a `.env` file.
   - Add `API_KEY=your_google_api_key_here`.

   If running in a static browser environment:
   - Ensure the environment injects `process.env.API_KEY`.

3. **Running the App**
   This project uses ES Modules and CDN imports. You can serve it using any static file server.
   
   Example using `serve`:
   ```bash
   npx serve .
   ```
   Then open `http://localhost:3000` in your browser.

## License

MIT
