# Audio Identification & Source Detection System

## Team Information
- **Team Name**: [CompileHers]
- **Year**: [1]
- **All-Female Team**: [Yes]

## Architecture Overview

#### Describe your approach here. Keep it short and clear.



-This project is a real-time Audio Identification System that recognizes songs from short audio snippets using audio fingerprinting techniques. The backend is developed using **FastAPI** and deployed with **Uvicorn**, while **Librosa** is used for audio loading, preprocessing, spectrogram generation, and feature extraction.

-The system currently implements and solves the following issues:

* Dataset metadata ingestion
* Audio feature extraction interface
* Baseline fingerprinting logic
* Query ingestion pipeline
* Fast retrieval indexing
* Exact match evaluation
* Robust fuzzy matching
* Confidence score calculation
* Invalid query handling

-Song metadata and audio files are loaded during startup, and fingerprints are generated using spectrogram peak hashing. An indexed fingerprint structure enables fast candidate retrieval and efficient matching. The system supports both exact and fuzzy matching to improve robustness against noisy or distorted audio snippets.

-The frontend is built using HTML, CSS, and JavaScript with a modern responsive interface supporting drag-and-drop audio uploads, confidence visualization, health monitoring, and real-time API interaction.

-The project focuses on scalability, low latency, robustness, and accurate song identification across large audio datasets while maintaining efficient real-time performance.

**Note:** Please do not change the format or spelling of anything in this README. The fields are extracted using a script, so any changes to the structure or formatting may break the extraction process.
