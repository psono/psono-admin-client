#!/usr/bin/env bash
set -e

mkdir -p dist/webclient
(
    cd build
    zip -r ../dist/webclient/psono.webclient.zip .
)
