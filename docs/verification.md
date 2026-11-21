# Проверки и границы доказательств

## Готовые установщики, 22 ноября 2026

- [GitHub Actions run 44952509351](https://github.com/VadimMukabenov/studia-ochen-plugin/actions/runs/44952509351) успешно собрал **Linux amd64 и Linux arm64** на нативных runner. На каждой архитектуре прошли 21 Node test, TypeScript check/build, упаковочный контракт и 10 реальных HTTP/model случаев. Контейнеры запускались с `--network none`, без model volume: модель уже внутри образа. Это не тест Windows/macOS Docker Desktop.
- Публичный preview [v0.2.0-preview](https://github.com/VadimMukabenov/studia-ochen-plugin/releases/tag/v0.2.0-preview): `sobrano-amd64.zip` 434055921 байт; `sobrano-arm64.zip` 426770955 байт; отдельные SHA256. Собранный исходный commit `24129cf01805135a70168c3ce0513ee4bb9c4433`, совпадает с target выпуска и тегами образов. Внутри — образ с моделью, Compose без build/pull, compiled plugin и launchers; секреты и окружение разработки не включены.
- AMD64 ZIP скачан заново из draft выпуска, SHA256 совпала, распакован в путь с пробелами. Настоящий `sh START.command` создал новый контейнер, дождался healthy; затем реальные 10/10 model cases и ZIP/SVG checks прошли. При замере 9.71 сек Docker уже был запущен, образ предварительно загружен через `docker load`. Это **не** замер скачивания ZIP или первой установки Docker/образа на чистом компьютере.
- Startup logs: все три model-файла Cached, путь `/opt/sobrano-model`; отдельный volume модели не нужен. Рекомендуется 4 ГБ свободной RAM и 4 ГБ диска для архива, образа и Docker. Не обещаем одинаковое время на других машинах.
- Независимое ревью установщика выявило риск перезаписи опубликованных выпусков и несовпадения source target. Исправлено: опубликованный version повторно не используется, draft target обновляется до текущего SHA, workflow запускается вручную. Три regression cases RED→GREEN; повторное ревью без Important findings. Контракт ZIP также RED→GREEN.
- Windows START.cmd, macOS START.command и полный нативный Figma plugin пока не проверены на соответствующих ОС. В README и самом установщике явно указан preview-статус. Для Figma один development-import и полная редактируемая копия библиотеки всё ещё обязательны.

21 ноября 2026. Этот файл обновляется по фактическим результатам, не по ожиданиям.

- 21 Node core/sandbox tests проходят; TypeScript strict check и build проходят.
- 4 Playwright UI tests проходят: значения создания, busy/error, импорт JSON, скачанный SVG, безопасный текст ошибки, результат helper и его недоступность.
- 8 Python unit/HTTP tests проходят: схема/лимиты, masked normalized pooling, threshold/ambiguity, allowlisted ranking, настоящий loopback HTTP, явный отказ от отрицаний.
- Три SVG из оригинальных L exports с provenance созданы; отрендерены Chromium и визуально просмотрены PNG. 80/212/222 paths, без image/foreignObject/data:image. Это offline-примеры, не запуск нативного плагина.
- Аудит Figma40оригиналов ранее подтверждён MCP в аккаунте Vadim. Во время сборки примеров MCP ответил «tool call limit on Starter». Новые native сцены НЕ созданы, т.к. мутация отклонена лимитом. Платный upgrade не выполнялся. Скрипт native API покрыт sandbox double, однако запуск plugin UI → реальные native layers → SVG **ещё не подтверждён в Figma Desktop**.
- Docker clean build, первый старт с пустым model volume, реальные HTTP-запросы и перезапуск подтверждены; см. результаты ниже.
- Windows/macOS Docker Desktop не проверялись. Импортировать manifest в свою Figma должен проверяющий; работодателю ничего не отправляли и сроки не принимали.

Итог ревью: независимый reviewer gpt-6.1-sol, два Important finding. Cross-palette и целостность выходных потомков исправлены, regression RED→GREEN. Source baseline фиксируется только при первом использовании; модификации исходной библиотеки до этого не распознаются полностью. Требуется неизменённая копия. Итог текущих suites:21 Node,4 Playwright,8 Python проходят. Неоднозначные общие цвета разных схем явно отклоняются. Нет отложенных Minor findings.
Официальный classic plugin development-import требует macOS/Windows Desktop (Figma Help). Linux-проверка ниже — исключительно Docker/model/browser UI, не запуск плагина в официальном Linux Desktop (такого окружения здесь не проверяли).

## Фактический Docker runtime

- `docker compose up --build -d`: image собран (Node tests/typecheck/build внутри), новый пустой volume скачал ONNX/tokenizer, SHA256 проверены, HTTP healthy на127.0.0.1:18763. Python/Node на хосте не участвуют в runtime. Linux amd64, Docker27.3.1, Compose2.29.7.
- `python3 tests/model_smoke.py`:10/10 настоящих HTTP/model cases pass, ZIP с3файлами/manifest и3SVG проверены. Подробные входы, outputs/scores/latencies: model-evaluation.json. Шесть поддерживаемых тем и четыре негативных случая — это небольшая проверочная выборка, не независимый benchmark общего понимания языка. Порог был подобран после первого прогона этой выборки.
- `npm run test:live`:1/1 browser integration pass с настоящим сервисом:3запроса/отказ/скачиваниеZIP; docs/runtime.png просмотрен. `docs/model-demo.webm` — короткая автоматизированная запись локальной страницы/model retrieval, не запуск Figma plugin.
- Cache/offline: основной контейнер остановлен, новый `docker run --network none -v sobrano_model-cache:/models ...` успешно проверил кэш SHA, загрузил Engine и вернул coin для «Копить на мечту». Затем Compose снова поднят, healthy. Сетевые вызовы после кэширования не нужны.
- Idle runtime память около819MiB на этой машине; ресурсы и время первого скачивания зависят от компьютера/канала. Рекомендация4ГБ свободной RAM остаётся запасом, а не измеренным минимумом.
- CUA: локальная страница открыта во встроенном браузере, нажатие «Подобрать» показало «Книга» для учебного запроса, вкладка сохранена.
- Финальный source ZIP распакован в новый временный каталог без node_modules/.venv/helper/model. `docker compose up --build -d` из него успешно выполнил сборку и запустил сервис с постоянным Docker-кэшем; повторные10/10HTTPcases проходят. Это проверка доставляемого архива, не только рабочего каталога.

## Публикация в отдельном GitHub, 22 ноября 2026

Репозиторий `VadimMukabenov/studia-ochen-plugin`, main; сначала создан private, затем 22 ноября по прямому запросу владельца переведён в public. История career-search и внутренние план/ledger не переносились. Чистый клон исходного коммита f59c61e в новую папку успешно собран/запущен через `docker compose up --build -d`; настоящий HTTP/model smoke test10/10 и ZIP/SVG проверки прошли с существующим Docker-кэшем модели. Нативные Figma ограничения выше сохраняются.
