# 🌾 Smart Agricultural Assistant

The **Smart Agricultural Assistant** is a full-stack AI-powered solution built to support small-scale farmers. It provides real-time tools for crop disease detection, pest identification, soil classification, crop recommendations, and local farming schemes — with multi-language support and an intelligent AI chatbot interface.

---

## 🚀 Features

- 🧪 Soil Classification based on user input and region
- 🌾 AI-based Crop Disease Detection (image input)
- 📋 Government Scheme & Subsidy Info
- 🌱 Intelligent Crop Recommendation System
- 🤖 AI Chatbot with voice and text capabilities
- 🌐 Language toggle: English ↔ Tamil
- 🔊 Text-to-Speech replies & 🎤 Speech-to-Text input

---

## 🛠️ Tech Stack

### Frontend
- **React.js** with **TypeScript**
- **Tailwind CSS** for responsive design
- **shadcn/ui** for component styling

### Backend
- **Node.js + Express.js** – REST API development
- **MongoDB** – Database for storing user inputs, queries, and crop info
- **Flask (Python)** – AI server for disease detection, soil classification, and crop recommendation
- **Mongoose** – ODM for MongoDB in Node.js

---

## 📂 Folder Structure

```
smart-farming-assistant/
├── agribot-frontend/      # React + Tailwind frontend
├── agribot-backend/       # Express.js backend with MongoDB
├── flask-ai-server/       # Python AI/ML model backend
└── README.md
```

---

## 🧑‍💻 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/Vimal018/smart-farming-assistant.git
cd smart-farming-assistant

# 2. Setup frontend
cd agribot-frontend
npm install
npm run dev

# 3. Setup backend
cd ../agribot-backend
npm install
npm run dev

# 4. Setup AI model server (Flask)
cd ../flask-ai-server
pip install -r requirements.txt
python app.py
```

---

## 🌐 Multi-language Support

- Interface toggle between **English** and **Tamil**
- **Speech recognition** auto-detects spoken language
- **AI chatbot replies** in selected language using text-to-speech

---

## ✅ Future Enhancements

- Weather integration (based on district)
- Yield prediction models
- More language support (Hindi, Telugu, etc.)
- Mobile-friendly PWA support
- PDF generation for reports

---
