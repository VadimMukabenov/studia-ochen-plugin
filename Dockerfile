FROM node:22-bookworm-slim AS plugin
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY code.ts ui.html manifest.json tsconfig.json ./
COPY source ./source
COPY scripts ./scripts
COPY tests/*.test.cjs ./tests/
RUN npm test && npm run check && npm run build

FROM python:3.12-slim-bookworm
ENV PIP_DEFAULT_TIMEOUT=180 PIP_RETRIES=8 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 SOB_BIND=0.0.0.0 SOB_MODEL_DIR=/models
WORKDIR /app
COPY helper/requirements.txt ./helper/requirements.txt
RUN pip install --no-cache-dir -r helper/requirements.txt && useradd --uid 10001 --create-home sobrano && mkdir /models && chown sobrano /models
COPY helper ./helper
COPY --from=plugin /build/dist ./dist
COPY examples ./examples
USER sobrano
EXPOSE 18763
CMD ["sh","-c","python -m helper.download_model && python -m helper.server"]
