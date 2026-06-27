#!/bin/bash
# ================================================================
# Build APK do financeiro-app via Docker
# ================================================================
# Uso:
#   ./build-apk.sh            # build padrão
#   ./build-apk.sh --no-cache # rebuild completo (sem cache Docker)
# ================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   📱 Build APK - financeiro-app          ║"
echo "║   via Docker                             ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Criar diretório de output
mkdir -p build

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Inicie o Docker e tente novamente.${NC}"
    exit 1
fi

# Verificar flag --no-cache
BUILD_ARGS=""
if [ "$1" = "--no-cache" ]; then
    echo -e "${YELLOW}🔄 Rebuild completo (sem cache Docker)${NC}"
    BUILD_ARGS="--no-cache"
fi

# Build da imagem e execução
echo -e "${BLUE}🐳 Construindo imagem Docker (primeiro build pode levar 10-15 min)...${NC}"
echo ""

docker compose build $BUILD_ARGS build-apk
docker compose run --rm build-apk

# Verificar resultado
if [ -f "./build/financeiro-app.apk" ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗"
    echo "║   ✅ Build concluído com sucesso!         ║"
    echo "╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  📱 APK: ${BLUE}./build/financeiro-app.apk${NC}"
    echo -e "  📏 Tamanho: $(du -h ./build/financeiro-app.apk | cut -f1)"
    echo ""
    echo -e "  ${YELLOW}Para instalar no dispositivo:${NC}"
    echo "  adb install ./build/financeiro-app.apk"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro: APK não foi gerado. Verifique os logs acima.${NC}"
    exit 1
fi
