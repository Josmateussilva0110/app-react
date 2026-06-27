#!/bin/bash
# ================================================================
# Entrypoint: Build do APK Android
# Executado dentro do container Docker
# ================================================================
set -e

echo ""
echo "=========================================="
echo "  📦 Build APK - financeiro-app"
echo "=========================================="
echo ""

# ----------------------------------------------------------------
# 1. Configurar local.properties para o Android SDK
# ----------------------------------------------------------------
cd /app/financeiro-app

echo "🔧 Configurando Android SDK..."
mkdir -p android
echo "sdk.dir=${ANDROID_HOME}" > android/local.properties

# ----------------------------------------------------------------
# 2. Expo Prebuild (gera projeto Android nativo)
# ----------------------------------------------------------------
echo ""
echo "🔨 Executando expo prebuild..."
npx expo prebuild --platform android --no-install --clean

# Garantir que local.properties está presente após prebuild
echo "sdk.dir=${ANDROID_HOME}" > android/local.properties

# ----------------------------------------------------------------
# 3. Gradle Build (compila o APK)
# ----------------------------------------------------------------
echo ""
echo "🏗️  Compilando APK (isso pode levar alguns minutos)..."
cd android
chmod +x ./gradlew
./gradlew assembleRelease --no-daemon -x lint

# ----------------------------------------------------------------
# 4. Copiar APK para diretório de output
# ----------------------------------------------------------------
echo ""
echo "📋 Copiando APK..."
mkdir -p /app/build

APK_PATH=$(find /app/financeiro-app/android/app/build/outputs/apk -name "*.apk" -type f | head -1)

if [ -z "$APK_PATH" ]; then
    echo "❌ Erro: APK não encontrado!"
    exit 1
fi

cp "$APK_PATH" /app/build/financeiro-app.apk

echo ""
echo "=========================================="
echo "  ✅ APK gerado com sucesso!"
echo "  📱 Arquivo: ./build/financeiro-app.apk"
echo "  📏 Tamanho: $(du -h /app/build/financeiro-app.apk | cut -f1)"
echo "=========================================="
echo ""
