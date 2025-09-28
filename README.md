# Regex-Pattern-Operation
Rhombus Intern Skill Assessment - Web Application for Regex Pattern Matching and Replacement


## Overview
This is a tiny demo that lets you:
- Upload a CSV/XLSX file
- Preview & run regex replace on a selected column using Natural language models 
- Download the transformed file
- Auto-selects the best engine: local language model (Ollama is used in this project) → OpenAI (Only if client has a key & quota) → predefined template fallback


## Table of contents
1. [Overview](#overview)
2. [Demo Video](#demo-video)
3. [Features](#Features)
4. [NL Selection logic](#NL-Selection-logic)
5. [Tech Stack](#Tech-Stack)
6. [Setup](#Setup)
	- [Backend Django](#Backend-Django)
	- [Frontend React](#Frontend-React)
	- [Optional LLM Engines](#Optional-LLM-Engines)
7. [Common Prompt when Use](#Common-Prompt-when-Use)
8. [Common Regex when Use](#Common-Regex-when-Use)


## Demo Video
View raw and download would be ideal - video too big for preview.
<p align="center">
  <img src="Demo.mp4" width="750"><br>
</p>


## Features
- Upload & preview: reads only CSV/XLSX file.
- Pick a column to operate.
- (Optional) Natural language supported. Type a plain-English instruction in the NL panel → click Suggest regex → the regex box and the replaced word gets auto-filled.
- Regex replace: runs pandas.Series.str.replace on the chosen column.
- Download: saves a clean CSV with your changes.


## NL Selection logic
- Priority 1: Your local language model. Ollama model "llama3.1:8b" is used in the development.
- Priority 2: OpenAI will be automatically selected if OPENAI_API_KEY is provided and your account have sufficient quota:)
- Priority 3: A predefined template will be used as a fallback (email/phone/date/url/digits/etc.) if nothing above is avaliable.


## Tech Stack
- Frontend: Next.js (React), Tailwind CSS
- Backend: Django, django-cors-headers, pandas, openpyxl
- LLM (optional): Ollama (local) via HTTP requests; OpenAI (openai SDK); Template fallback (keyword → regex)

## Setup
Prereqs
- Python 3.10+ (tested with 3.11)
- Node.js 22+ (Next.js 15 works well)
- npm 11+ 
- Git (optional)
- Optional: Ollama (for local LLM) — https://ollama.com

### Backend Django
```bash
# create a virtual env to install deps
python -m venv venv
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver 8000
```
Backend is now on http://localhost:8000/.

### Frontend React
```bash
cd frontend
npm install
npm run dev
```
Frontend is now on http://localhost:3000/.

### Optional LLM Engines
- Ollama (Preferred) 
```bash
ollama pull llama3.1:8b
ollama run llama3.1:8b
```
Restart the backend; Ollama will run at http://localhost:11434. If found, suggestions will show "source": "ollama".

- OpenAI
```bash
# Windows PowerShell (current session):
$env:OPENAI_API_KEY="sk-xxxxxxxx"
```
Restart the backend. If quota is available, suggestions show "source": "openai"

- No LLM
It falls back to template suggestions (emails, phone numbers, dates, urls, digits,etc.). Enough to demo the feature.

## Common Prompt when Use
- Find email addresses
- Find names
- Find email addresses in the Email column and replace them with 'REDACTED'.
- Find names and replace them with 'Tony'.

## Common Regex when Use
- Replace whole cell: ^.*$
- Only non-empty cells: ^.+$
- Emails:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}
- Digits: \d+
- Word boundary name “Tony”: \bTony\b
- Keep first letter, mask rest: ([A-Za-z])[A-Za-z]+ → \1***
