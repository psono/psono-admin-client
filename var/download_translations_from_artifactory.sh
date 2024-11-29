#!/usr/bin/env bash
# poeditor language codes: https://poeditor.com/docs/languages
apt-get update && \
apt-get install -y curl && \
curl -o public/locales/da/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-da.json && \
curl -o public/locales/ca/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ca.json && \
curl -o public/locales/sv/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-sv.json && \
curl -o public/locales/no/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-no.json && \
curl -o public/locales/he/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-he.json && \
curl -o public/locales/ar/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ar.json && \
curl -o public/locales/hi/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hi.json && \
curl -o public/locales/hu/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hu.json && \
curl -o public/locales/bn/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-bn.json && \
curl -o public/locales/cs/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-cs.json && \
curl -o public/locales/de/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-de.json && \
curl -o public/locales/en/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-en.json && \
curl -o public/locales/es/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-es.json && \
curl -o public/locales/fi/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-fi.json && \
curl -o public/locales/fr/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-fr.json && \
curl -o public/locales/hr/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hr.json && \
curl -o public/locales/it/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-it.json && \
curl -o public/locales/ja/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ja.json && \
curl -o public/locales/ko/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ko.json && \
curl -o public/locales/nl/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-nl.json && \
curl -o public/locales/pt/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pt.json && \
curl -o public/locales/pt-br/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pt-br.json && \
curl -o public/locales/pl/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pl.json && \
curl -o public/locales/ru/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ru.json && \
curl -o public/locales/sk/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-sk.json && \
curl -o public/locales/vi/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-vi.json && \
curl -o public/locales/zh-Hant/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-zh-Hant.json
curl -o public/locales/zh-Hans/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-zh-Hans.json
