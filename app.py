from fastapi import FastAPI, UploadFile, File
import os
import time
import json
import shutil
import numpy as np



app = FastAPI()

# ==============================
# CONFIG
# ==============================

DATASET_METADATA = "data/metadata.json"
UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==============================
# STORAGE (Issue 2)
# ==============================

metadata_store = {}
fingerprint_store = {}
index_store = {}

system_ready = False

# ==============================
# ISSUE 1: METADATA INGESTION
# ==============================

def load_metadata():
    global metadata_store

    try:
        with open(DATASET_METADATA, "r") as f:
            records = json.load(f)

        for record in records:
            metadata_store[record["id"]] = record

        print(f"[INFO] Loaded {len(metadata_store)} records")

    except Exception as e:
        print(f"[ERROR] Metadata load failed: {e}")

# ==============================
# ISSUE 3 & 4: FEATURE + FP
# ==============================

def build_fingerprints():
    extractor = fingerprints.spectrogram_extractor.SpectrogramExtractor()
    generator = FingerprintGenerator()

    for song_id, meta in metadata_store.items():
        try:
            path = os.path.join(UPLOAD_FOLDER, meta["file"])

            features = extractor.extract(path)
            fp = generator.generate(features)

            fingerprint_store[song_id] = fp

        except Exception as e:
            print(f"[WARN] Failed {song_id}: {e}")

    print(f"[INFO] Fingerprints ready: {len(fingerprint_store)}")

# ==============================
# ISSUE 6: INDEX
# ==============================

def hash_fp(fp):
    return int(np.sum(fp) % 10000)

def build_index():
    for song_id, fp in fingerprint_store.items():
        h = hash_fp(fp)

        if h not in index_store:
            index_store[h] = []

        index_store[h].append(song_id)

    print(f"[INFO] Index size: {len(index_store)}")

# ==============================
# ISSUE 7-9: MATCHING
# ==============================

def similarity(fp1, fp2):
    min_len = min(fp1.shape[0], fp2.shape[0])
    return np.sum(fp1[:min_len] == fp2[:min_len]) / min_len

def match(fp):
    h = hash_fp(fp)
    candidates = index_store.get(h, [])

    best = None
    best_score = 0

    for song_id in candidates:
        score = similarity(fp, fingerprint_store[song_id])

        if score > best_score:
            best_score = score
            best = song_id

    if best is None:
        return {"result": "Unknown", "confidence": 0}

    return {
        "result": metadata_store[best]["title"],
        "confidence": round(best_score, 3)
    }

# ==============================
# ISSUE 5 & 12: QUERY PIPELINE
# ==============================

def process_query(file_path):
    extractor = fingerprints.spectrogram_extractor.SpectrogramExtractor()
    generator = FingerprintGenerator()

    features = extractor.extract(file_path)
    fp = generator.generate(features)

    return fp

# ==============================
# API ROUTES
# ==============================

@app.on_event("startup")
def startup():
    global system_ready

    print("[INIT] Starting system...")

    load_metadata()
    build_fingerprints()
    build_index()

    system_ready = True
    print("[INIT] System Ready")

# ------------------------------
# Health Check (Issue 18)
# ------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "system_ready": system_ready,
        "songs": len(metadata_store),
        "fingerprints": len(fingerprint_store)
    }

# ------------------------------
# Identify API (Main Feature)
# ------------------------------

@app.post("/identify")
async def identify(file: UploadFile = File(...)):
    start = time.time()

    if not file.filename.endswith((".wav", ".mp3")):
        return {"error": "Unsupported format"}

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        fp = process_query(file_path)
        result = match(fp)

        latency = time.time() - start
        result["latency_sec"] = round(latency, 3)

        return result

    except Exception as e:
        return {"error": str(e)}