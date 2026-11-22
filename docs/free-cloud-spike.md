# Optional free cloud API: connectivity spike

On 22 November 2026 the user authorized obtaining an OpenRouter key for this
take-home and testing free inference. A separate expiring key was saved outside
the repository, with a $0 credit limit. Its value is not in source, images,
archives or this document. Existing account keys were left unchanged.

The authenticated API accepted the key and reported a free-tier account. The
fixed model `particle-ai/particle-1:free` was checked against OpenRouter's live
model catalog (zero input/output prices), then called with the task's ten-item
text catalog. No illustration vectors or images were sent.

| Actual request | Returned original object IDs | Reported API cost |
| --- | --- | --- |
| Найти общий язык | puzzle, phone | $0 |
| Отложить деньги на обучение | coin, wallet, book | $0 |
| Книга и кошелёк без телефона | book, wallet | $0 |

These are three manual smoke checks, not a general semantic accuracy benchmark.
The automatic `openrouter/free` router previously selected a different model
and gave a less useful answer to the first query. One concurrent fixed-model
request received HTTP 429; a later single manual retry succeeded. Free provider
capacity therefore remains a practical limitation. There was no paid fallback,
credit purchase or change to the $0 key limit.

This is **not yet integrated into the application**. The browser editor's direct
object → edit → SVG workflow comes first. Later optional cloud integration must
read a locally supplied credential on the server, permit only verified free
models, preserve work on errors and avoid silent paid fallbacks. Default reviewer
operation must still work with the local CPU model and no API registration.

The public reviewer package will not contain the author's key. `.env` and local
variants are excluded from Git and Docker build context. Source packaging uses
its existing explicit allowlist.

Official references: [free models](https://openrouter.ai/collections/free-models),
[free model routing and fallback charges](https://openrouter.ai/docs/guides/routing/model-variants/free).
