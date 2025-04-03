#!/usr/bin/env bash
set -e

# poeditor language codes: https://poeditor.com/docs/languages

apt-get update && \
apt-get install -y curl && \
curl -f -o public/locales/locale-da.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-da.json && \
curl -f -o public/locales/locale-ca.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ca.json && \
curl -f -o public/locales/locale-sv.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-sv.json && \
curl -f -o public/locales/locale-no.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-no.json && \
curl -f -o public/locales/locale-he.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-he.json && \
curl -f -o public/locales/locale-ar.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ar.json && \
curl -f -o public/locales/locale-hi.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hi.json && \
curl -f -o public/locales/locale-hu.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hu.json && \
curl -f -o public/locales/locale-bn.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-bn.json && \
curl -f -o public/locales/locale-cs.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-cs.json && \
curl -f -o public/locales/locale-de.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-de.json && \
curl -f -o public/locales/locale-en.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-en.json && \
curl -f -o public/locales/locale-es.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-es.json && \
curl -f -o public/locales/locale-fi.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-fi.json && \
curl -f -o public/locales/locale-fr.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-fr.json && \
curl -f -o public/locales/locale-hr.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hr.json && \
curl -f -o public/locales/locale-it.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-it.json && \
curl -f -o public/locales/locale-ja.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ja.json && \
curl -f -o public/locales/locale-ko.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ko.json && \
curl -f -o public/locales/locale-nl.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-nl.json && \
curl -f -o public/locales/locale-pt.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pt.json && \
curl -f -o public/locales/locale-pt-BR.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pt-br.json && \
curl -f -o public/locales/locale-pl.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pl.json && \
curl -f -o public/locales/locale-ru.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ru.json && \
curl -f -o public/locales/locale-sk.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-sk.json && \
curl -f -o public/locales/locale-vi.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-vi.json && \
curl -f -o public/locales/locale-zh-Hant.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-zh-Hant.json && \
curl -f -o public/locales/locale-zh-Hans.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-zh-Hans.json
