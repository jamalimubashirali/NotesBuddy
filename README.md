# NotesBuddy 📚

An AI-powered note-taking and content summarization platform that transforms YouTube videos into comprehensive, well-structured notes with intelligent chat capabilities.

## ✨ Features

### 🎥 YouTube Integration
- Extract and process YouTube video transcripts
- Support for multiple languages
- Automatic content analysis and categorization

### 🤖 AI-Powered Note Generation
- Intelligent summarization using OpenRouter LLM (Llama 3.3 70B)
- Multiple note styles: Detailed, Summary, Bullet Points
- Smart content organization and formatting
- Markdown support for rich text rendering

### 💬 RAG-Powered Chat System
- **Retrieval Augmented Generation** using ChromaDB vector database
- Semantic search through your notes with sentence transformers
- Context-aware responses based on note content
- Real-time streaming responses with loading indicators
- Persistent chat history per note
- Modal-based chat interface with floating activation button

### 🔒 Token Usage Management
- Daily token limits (5,000 tokens/day for free tier)
- Per-chat session limits (2,000 tokens)
- Real-time token tracking and usage display
- Automatic chat disable when limit reached
- Visual warnings and clear user feedback
- Token counter with remaining balance

### 👤 User Authentication & Security
- JWT-based authentication
- Secure password hashing with bcrypt
- User-specific note isolation
- Session management

### 📄 Export Capabilities
- PDF export with custom styling
- Markdown export
- Preserve formatting and structure

### 🎨 Modern UI/UX
- Dark mode support
- Responsive design
- Smooth animations and transitions
- Toast notifications
- Collapsible sections
- Color-coded video categories

## 🏗️ Application Architecture

### Frontend Stack
```
React + TypeScript + Vite
├── Components
│   ├── Auth (Login, Signup)
│   ├── Dashboard (Note list, search)
│   ├── NoteView (Note display, PDF export)
│   ├── ChatModal (Floating chat button)
│   └── ChatInterface (RAG-powered chat)
├── Services
│   └── API Client (Axios with auth)
└── Routing (React Router)
```

### Backend Stack
```
FastAPI + PostgreSQL + ChromaDB
├── API Layer
│   ├── Authentication (JWT)
│   ├── Notes CRUD
│   ├── Chat Endpoints
│   └── Export Services
├── Services
│   ├── LLM Service (OpenRouter)
│   ├── Vector Service (ChromaDB + RAG)
│   └── User Service
├── Models
│   ├── User
│   ├── Notes
│   ├── ChatMessage
│   └── TokenUsage
└── Database
    ├── PostgreSQL (User data, notes, chat history)
    └── ChromaDB (Vector embeddings)
```

### RAG Architecture
```
User Query → Vector Search (ChromaDB) → Retrieve Relevant Chunks
                                              ↓
                                    Build Context with Chunks
                                              ↓
                                    LLM (Llama 3.3 70B) → Response
                                              ↓
                                    Stream to Frontend
                                              ↓
                                Save to Chat History + Track Tokens
```

### Data Flow

#### Note Generation Flow
```
1. User submits YouTube URL
2. Backend extracts transcript
3. LLM classifies video category
4. LLM generates formatted notes
5. Notes saved to PostgreSQL
6. Content chunked and embedded
7. Vectors stored in ChromaDB
8. Frontend displays rendered notes
```

#### Chat Flow
```
1. User opens chat modal
2. Load chat history from PostgreSQL
3. User sends message
4. Check daily token limit
5. If allowed:
   a. Vector search in ChromaDB
   b. Retrieve relevant chunks
   c. Build context for LLM
   d. Stream LLM response
   e. Save chat to database
   f. Update token usage
6. Display response in real-time
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **FastAPI** - Web framework
- **PostgreSQL** - Primary database (Supabase)
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **python-jose** - JWT handling
- **passlib[bcrypt]** - Password hashing
- **ChromaDB** - Vector database for RAG
- **sentence-transformers** - Text embeddings
- **langchain** - LLM framework
- **OpenRouter API** - LLM access (Llama 3.3 70B)
- **youtube-transcript-api** - Transcript extraction
- **xhtml2pdf** - PDF generation

## 📊 Database Schema

### Users Table
```sql
- id (PK)
- email (unique)
- username (unique)
- hashed_password
- full_name
- is_active
- is_verified
- created_at
- updated_at
```

### Notes Table
```sql
- id (PK)
- video_id
- title
- notes (markdown)
- language
- style
- user_id (FK → users)
- created_at
- updated_at
```

### ChatMessages Table
```sql
- id (PK)
- note_id (FK → notes)
- user_id (FK → users)
- role (user/assistant)
- content
- created_at
```

### TokenUsage Table
```sql
- id (PK)
- user_id (FK → users)
- date
- tokens_used
- created_at
```

### ChromaDB Collections
```
- note_chunks
  - embeddings (768-dim vectors)
  - metadata (note_id, user_id, chunk_index)
  - text chunks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL database
- OpenRouter API key

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create `.env` file:
```env
# Database
user=your_db_user
password=your_db_password
host=your_db_host
port=5432
dbname=your_db_name

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenRouter
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Token Limits
DAILY_TOKEN_LIMIT=5000
MAX_TOKENS_PER_CHAT=2000
```

5. **Run database migrations**
```bash
alembic upgrade head
```

6. **Start the server**
```bash
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 📁 Project Structure

```
NotesBuddy/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/           # API routes
│   │   ├── core/             # Config, auth, database
│   │   ├── models/           # SQLAlchemy models
│   │   ├── prompts/          # LLM prompts
│   │   └── services/         # Business logic
│   │       ├── llm_service.py
│   │       ├── vector_service.py
│   │       └── user_service.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatModal.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── NoteView.tsx
│   │   ├── services/         # API client
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## 🔑 Key Features Explained

### RAG Implementation
The app uses Retrieval Augmented Generation to provide accurate, context-aware chat responses:
1. **Document Chunking**: Notes are split into semantic chunks
2. **Embedding**: Each chunk is converted to a 768-dim vector
3. **Vector Storage**: Stored in ChromaDB for fast similarity search
4. **Query Processing**: User questions are embedded and matched
5. **Context Building**: Relevant chunks are injected into LLM prompt
6. **Response Generation**: LLM generates answer based on retrieved context

### Token Management
- **Daily Limits**: Prevents API abuse (5,000 tokens/day)
- **Session Limits**: Caps individual conversations (2,000 tokens)
- **Real-time Tracking**: Updates after each message
- **Auto-disable**: Chat locks when limit reached
- **Visual Feedback**: Token counter and warning messages

### Chat Persistence
- All conversations saved to PostgreSQL
- Loads automatically when modal opens
- Maintains context across sessions
- Linked to specific notes and users

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/token-usage` - Check token usage

### Notes
- `POST /api/v1/notes/` - Create note from YouTube URL
- `GET /api/v1/notes/` - List user's notes
- `GET /api/v1/notes/{id}` - Get specific note
- `DELETE /api/v1/notes/{id}` - Delete note

### Chat
- `POST /api/v1/notes/{id}/chat` - Send chat message (streaming)
- `GET /api/v1/notes/{id}/chat/history` - Get chat history

### Export
- `GET /api/v1/notes/{id}/export/pdf` - Export as PDF
- `GET /api/v1/notes/{id}/export/markdown` - Export as Markdown

## 🔐 Security Features

- JWT token authentication
- Bcrypt password hashing
- User data isolation
- CORS configuration
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (React escaping)
- Rate limiting via token system

## 🎨 UI/UX Highlights

- **Responsive Design**: Works on all screen sizes
- **Dark Mode**: System-aware theme switching
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Non-intrusive feedback
- **Smooth Animations**: Fade-ins, slide-ins
- **Modal Chat**: Floating button with clean modal interface

## 📝 Future Enhancements

- [ ] Multi-language support for UI
- [ ] Note sharing and collaboration
- [ ] Advanced search and filtering
- [ ] Custom note templates
- [ ] Browser extension
- [ ] Mobile app
- [ ] Premium tier with higher token limits
- [ ] Voice note generation
- [ ] Batch processing of videos
- [ ] Note versioning and history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenRouter for LLM API access
- ChromaDB for vector database
- Supabase for PostgreSQL hosting
- Hugging Face for sentence transformers
- React and FastAPI communities

---

**Built with ❤️ by the NotesBuddy Team**
