#!/bin/bash

set -eu

# Загрузка из .env, если существует
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Проверка переменных
: "${DATABASE_URL:?DATABASE_URL is not set}"
: "${SECRET_KEY:?SECRET_KEY is not set}"
: "${BASE_URL:?BASE_URL is not set}"

# Node.js env
export NODE_ENV=production

# Инициализация БД
node db/init.js

# Запуск сервера
exec node app.js --prod
