# Проверки и границы доказательств

21 ноября 2026. Этот файл обновляется по фактическим результатам, не по ожиданиям.

- 21 Node core/sandbox tests проходят; TypeScript strict check и build проходят.
- 4 Playwright UI tests проходят: значения создания, busy/error, импорт JSON, скачанный SVG, безопасный текст ошибки, результат helper и его недоступность.
- 8 Python unit/HTTP tests проходят: схема/лимиты, masked normalized pooling, threshold/ambiguity, allowlisted ranking, настоящий loopback HTTP, явный отказ от отрицаний.
- Три SVG из оригинальных L exports с provenance созданы; отрендерены Chromium и визуально просмотрены PNG. 80/212/222 paths, без image/foreignObject/data:image. Это offline-примеры, не запуск нативного плагина.
- Аудит Figma40оригиналов ранее подтверждён MCP в аккаунте Vadim. Во время сборки примеров MCP ответил «tool call limit on Starter». Новые native сцены НЕ созданы, т.к. мутация отклонена лимитом. Платный upgrade не выполнялся. Скрипт native API покрыт sandbox double, однако запуск plugin UI → реальные native layers → SVG **ещё не подтверждён в Figma Desktop**.
- Docker clean build, первый старт с пустым model volume, реальные HTTP-запросы и перезапуск подтверждены; см. результаты ниже.
- Windows/macOS Docker Desktop не проверялись. Открыть private source работодателю и импортировать manifest в его Figma должен человек; работодателю ничего не отправляли и сроки не принимали.

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

Репозиторий `VadimMukabenov/studia-ochen-plugin`, private, main. История career-search и внутренние план/ledger не переносились. Чистый клон исходного коммита f59c61e в новую папку успешно собран/запущен через `docker compose up --build -d`; настоящий HTTP/model smoke test10/10 и ZIP/SVG проверки прошли с существующим Docker-кэшем модели. Нативные Figma ограничения выше сохраняются.
