#!/bin/bash

echo "========================================"
echo " SofaFriends - Starting Game Server"
echo "========================================"
echo ""

echo "[1/3] Starting Docker services..."
docker-compose up -d

echo ""
echo "[2/3] Waiting for services to initialize..."
sleep 5

echo ""
echo "[3/3] Services ready!"
echo ""
echo "========================================"
echo " Access Points:"
echo "========================================"
echo ""
echo " Host Screen (TV/Laptop):"
echo "   http://localhost:3000"
echo ""
echo " Controller (Phone):"
echo "   http://localhost:3001"
echo "   or scan QR code on host screen"
echo ""
echo "========================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

docker-compose logs -f