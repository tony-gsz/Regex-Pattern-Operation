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
3. [Overview](#overview)
4. [Overview](#overview)
5. [Overview](#overview)
6. [Overview](#overview)
7. [Overview](#overview)
8. [Overview](#overview)
9. [Overview](#overview)

## Demo Video
- Upload a CSV/XLSX file.
- Pick a column.
- (Optional) Type a plain-English instruction in the NL panel → click Suggest regex → the regex box gets auto-filled.
- Click Preview to see the first 20 rows (All rows will be converted but only 20 rows are avaliable for preview).
- Click Convert to convert the whole file and download result.csv.
<p align="center">
  <img src="Images/G&M_1.jpg" width="500"><br>
</p>

## Features
- Upload & preview: reads only CSV/XLSX file.
- Pick a column to operate.
- (Optional) Natural language supported. Type a plain-English instruction in the NL panel → click Suggest regex → the regex box and the replaced word gets auto-filled.
- Regex replace: runs pandas.Series.str.replace on the chosen column.
- Download: saves a clean CSV with your changes.

## NL Selection logic
Priority 1: Your local language model. Ollama model "llama3.1:8b" is used in the development.
Priority 2: OpenAI will be automatically selected if OPENAI_API_KEY is provided and your account have sufficient quota:)
Priority 3: A predefined template will be used as a fallback (email/phone/date/url/digits/etc.) if nothing above is avaliable.

## Tech Stack

- Frontend: Next.js (React), Tailwind CSS
- Backend: Django, django-cors-headers, pandas, openpyxl
- LLM (optional):
-- Ollama (local) via HTTP requests
-- OpenAI (openai SDK)
-- Template fallback (keyword → regex)