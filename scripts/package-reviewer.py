"""Bundle a prebuilt Docker image and compiled plugin, without development files."""
import argparse, hashlib, pathlib, re, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]

def package(image, tag, arch, output):
    if not re.fullmatch(r'sobrano-review:[a-z0-9][a-z0-9.-]{0,80}', tag):
        raise ValueError('Expected a versioned local sobrano-review image tag')
    image = pathlib.Path(image)
    if not image.is_file(): raise ValueError('Missing Docker image archive')
    output = pathlib.Path(output); output.mkdir(parents=True, exist_ok=True)
    compose = f'''name: sobrano-review
services:
  sobrano:
    image: {tag}
    platform: linux/{arch}
    pull_policy: never
    ports:
      - "127.0.0.1:18763:18763"
    environment:
      OPENROUTER_API_KEY: ${{OPENROUTER_API_KEY:-}}
      OPENROUTER_MODEL: ${{OPENROUTER_MODEL:-particle-ai/particle-1:free}}
    init: true
    network_mode: bridge
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:18763/health', timeout=3)"]
      interval: 3s
      timeout: 5s
      retries: 30
      start_period: 10s
    restart: "no"
'''
    readme = f'''Собрано · готовый локальный комплект ({arch})

Нужен установленный и запущенный Docker Desktop (Linux: Docker Engine + Compose v2).
Рекомендуется 4 ГБ свободной RAM, 4 ГБ свободного диска для архива и распакованного образа.
Модель уже внутри. После получения архива запуск не требует интернета, ключей или сборки.

1. Распакуйте ВЕСЬ ZIP. Windows: дважды щёлкните START.cmd.
   macOS/Linux: запустите START.command или выполните в этой папке: sh START.command
2. Дождитесь Ready. Откроется http://127.0.0.1:18763 (можно открыть вручную).
3. Редактор уже открыт в браузере. Телефон и пазлы — на холсте.
   Выберите раскладку под холстом, перетащите предмет, поверните и скачайте SVG.
4. «По смыслу»: введите «Найти общий язык» → «Подобрать предметы» →
   «Собрать эти предметы». Модель работает локально на CPU без ключа.
5. «Проект» → «Как проверить за 2 минуты» — краткий маршрут и три примера.
   Значок палитры → «Загрузить палитру JSON»; образец скачивается там же.
   В «Проекте» можно сохранить JSON, открыть его снова и скачать PNG.

Figma, Node, Python, Git и отдельная установка модели для проверки не нужны.
SVG содержит исходные контуры и открывается в Figma, Illustrator и Inkscape.
Дополнительный экспериментальный Figma-плагин включён в plugin/, но основной
готовый результат задания — браузерный редактор.
Остановка: STOP.cmd / sh STOP.command или docker compose down.
Повторный запуск в этой папке: docker compose up -d --wait
Если запуск не удался: docker compose logs. Порт 18763 должен быть свободен.
Windows/Linux x64 и Intel Mac: amd64. Apple Silicon / Linux ARM64: arm64.
Другая архитектура требует другого ZIP. Windows ARM и Windows containers не проверены.

Проверки: Linux-контейнер с моделью без сети — amd64 и arm64; браузерный
редактор — desktop1440x1024 и узкий экран390x844. Нативные START.cmd на Windows
и START.command на macOS не запускались на этих ОС; ограничения указаны честно.
Бесплатный облачный подбор необязателен и требует личного ключа владельца
установки. Чужой ключ в комплект не включён. Основной режим работает без него.

Исходники, архитектура, ограничения и AI-инструменты:
https://github.com/VadimMukabenov/studia-ochen-plugin
Модель intfloat/multilingual-e5-small, MIT, model card включена в образ.
Иллюстрации принадлежат авторам задания; новые рисунки модель не генерирует.
'''
    archive = output/f'sobrano-{arch}.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('sobrano/compose.yaml', compose)
        z.writestr('sobrano/README.txt', readme)
        z.write(image, 'sobrano/image.tar.gz', compress_type=zipfile.ZIP_STORED)
        for name in ('manifest.json', 'code.js', 'ui.html'):
            z.write(ROOT/'dist'/name, 'sobrano/plugin/'+name)
        for name in ('START.command', 'STOP.command', 'START.cmd', 'STOP.cmd'):
            info = zipfile.ZipInfo('sobrano/'+name)
            info.create_system = 3
            info.external_attr = (0o100755 if name.endswith('.command') else 0o100644) << 16
            data = (ROOT/'installer'/name).read_bytes()
            if name.endswith('.cmd'): data = data.replace(b'\r\n', b'\n').replace(b'\n', b'\r\n')
            z.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED)
    with archive.open('rb') as stream: digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    archive.with_suffix('.zip.sha256').write_text(f'{digest}  {archive.name}\n')
    print(archive)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--image', required=True)
    parser.add_argument('--tag', required=True)
    parser.add_argument('--arch', choices=('amd64','arm64'), required=True)
    parser.add_argument('--output', default='dist/reviewer')
    args = parser.parse_args()
    package(args.image, args.tag, args.arch, args.output)
