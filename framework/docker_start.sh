#!/bin/sh

# This file is used by Docker containers to get latest version of EAF with all dependencies

npm install -g stromdao-eaf

cd /app
stromdao-eaf
