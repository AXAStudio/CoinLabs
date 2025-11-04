pip install -r requirements.txt

# dev
uvicorn app.main:app --host 0.0.0.0 --port 8000 --loop uvloop --http httptools --workers 1

# prod (gunicorn manages multiple workers)
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --workers 2 --threads 1 \
  --bind 0.0.0.0:8000 \
  --keep-alive 120 --max-requests 5000 --max-requests-jitter 500
