# NotesBuddy

**NotesBuddy** is an AI-powered web application that turns YouTube videos into comprehensive, structured academic notes. It leverages **Azure OpenAI** to analyze video transcripts and generate educational summaries, key concepts, and detailed notes.

## 🚀 Features

-   **YouTube Integration**: Simply paste a video URL.
-   **AI Analysis**: Uses advanced LLMs to extract academic value.
-   **Content Filtering**: Automatically rejects non-academic content (music, gaming, pranks).
-   **Markdown Support**: Beautifully rendered notes with headers, lists, and formatting.
-   **Download**: Export notes as Markdown files.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide React
-   **Backend**: FastAPI, LangChain, Azure OpenAI, SQLite
-   **AI**: Azure OpenAI (GPT-3.5/4)

## 📦 Installation

### Prerequisites
-   Node.js & npm
-   Python 3.8+
-   Azure OpenAI API Key

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in `backend/` with your Azure credentials.

### Frontend Setup
```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the App

1.  **Start Backend**:
    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```
2.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
3.  Open `http://localhost:5173` in your browser.

