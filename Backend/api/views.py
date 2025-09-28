from django.shortcuts import render
from .llm import suggest_regex
# Create your views here.
import os
import uuid
import json
import re
from pathlib import Path

import pandas as pd
from django.conf import settings
from django.http import JsonResponse, FileResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt

# Project base directory to build tmp paths.
BASE_DIR: Path = settings.BASE_DIR
TMP_DIR: Path = BASE_DIR / "tmp"
TMP_DIR.mkdir(parents=True, exist_ok=True)

FILE_STORE: dict[str, str] = {}

# preview responses at most 20
PREVIEW_ROWS: int = 20
# declare data format incase it fails 
SUPPORT_ENCODING_FORMAT = ["utf-8", "utf-8-sig", "cp1252", "latin1", "gb18030"]

# load a file into a DataFrame.
def _read_dataframe(path: str) -> pd.DataFrame:

    pth = path.lower()
    if pth.endswith(".xlsx"):
        return pd.read_excel(path)

    # CSV：try each encoding
    last_err = None
    for enc in SUPPORT_ENCODING_FORMAT:
        try:
            return pd.read_csv(path, encoding=enc)
        except UnicodeDecodeError as e:
            last_err = e
            continue

    raise UnicodeDecodeError(
        "csv", b"", 0, 1,
        f"All encodings tried failed; last error: {last_err}"
    )

@csrf_exempt
def upload(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST only")

    f = request.FILES.get("file")
    if not f:
        return HttpResponseBadRequest("no file")

    token = uuid.uuid4().hex
    ext = ".xlsx" if f.name.lower().endswith(".xlsx") else ".csv"

	# put everythign tg
    raw_path = TMP_DIR / f"{token}{ext}"
    with open(raw_path, "wb") as out:
        for chunk in f.chunks():
            out.write(chunk)

    FILE_STORE[token] = str(raw_path)

    try:
        df = _read_dataframe(str(raw_path))
    except Exception as e:
        return HttpResponseBadRequest(f"read error: {e}")

    columns = list(df.columns)
    preview = df.head(PREVIEW_ROWS).fillna("").to_dict(orient="records")

    return JsonResponse(
        {"file_token": token, "columns": columns, "preview": preview}
    )

@csrf_exempt
def preview(request):

    if request.method != "POST":
        return HttpResponseBadRequest("POST only")

    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("invalid json")

    token = body.get("file_token", "")
    column = body.get("column", "")
    pattern = body.get("regex", "")
    replacement = body.get("replacement", "")

    path = FILE_STORE.get(token)
    if not path:
        return HttpResponseBadRequest("invalid file_token")

    try:
        df = _read_dataframe(path)
    except Exception as e:
        return HttpResponseBadRequest(f"read error: {e}")

    if column not in df.columns:
        return HttpResponseBadRequest("column not found")

    try:
        df[column] = df[column].astype(str).str.replace(
            pattern, replacement, regex=True
        )
    except re.error as e:
        return HttpResponseBadRequest(f"invalid regex: {e}")

    preview_after = df.head(PREVIEW_ROWS).fillna("").to_dict(orient="records")
    return JsonResponse({"preview_after": preview_after})


@csrf_exempt
def conversion(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST only")

    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("invalid json")

    token = body.get("file_token", "")
    column = body.get("column", "")
    pattern = body.get("regex", "")
    replacement = body.get("replacement", "")

    path = FILE_STORE.get(token)
    if not path:
        return HttpResponseBadRequest("invalid file_token")

    try:
        df = _read_dataframe(path)
    except Exception as e:
        return HttpResponseBadRequest(f"read error: {e}")

    if column not in df.columns:
        return HttpResponseBadRequest("column not found")

    try:
        df[column] = df[column].astype(str).str.replace(
            pattern, replacement, regex=True
        )
    except re.error as e:
        return HttpResponseBadRequest(f"invalid regex: {e}")

    result_dir = TMP_DIR / "results"
    result_dir.mkdir(parents=True, exist_ok=True)
    result_path = result_dir / f"{token}-result.csv"
    try:
        df.to_csv(result_path, index=False, encoding="utf-8")
    except Exception as e:
        return HttpResponseBadRequest(f"write error: {e}")

    download_url = f"/api/files/{token}/result.csv"
    return JsonResponse({"download_url": download_url})

def download(request, token: str):
    result_path = TMP_DIR / "results" / f"{token}-result.csv"
    if not result_path.exists():
        return HttpResponseBadRequest("file not ready")

    return FileResponse(
        open(result_path, "rb"), as_attachment=True, filename="result.csv"
    )


@csrf_exempt
def suggest(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST only")

    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("invalid json")

    instruction = body.get("instruction", "")
    column = body.get("column")
    if not instruction:
        return HttpResponseBadRequest("missing instruction")

    result = suggest_regex(instruction, column)
    return JsonResponse(result)