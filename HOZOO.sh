#!/bin/bash
# HOZOO MD - TikTok CLI Toolkit v2.1
# QR Login ASLI via TikTok OAuth v2 + Module System
# Run: bash hozoo.sh

clear
tput civis 2>/dev/null || true

# ============ COLORS ============
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'
P='\033[0;35m'; C='\033[0;36m'; W='\033[1;37m'; NC='\033[0m'
DIM='\033[2m'; BOLD='\033[1m'

# ============ CONFIG ============
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
COOKIE_FILE="$APP_DIR/cookie.txt"
PROXY_FILE="$APP_DIR/proxy.txt"
LOG_FILE="$APP_DIR/log.txt"
REPORT_LOG="$APP_DIR/report.log"
QR_SESSION="$APP_DIR/qr_session.json"
MODULE_DIR="$APP_DIR/modules"

mkdir -p "$MODULE_DIR"
touch "$COOKIE_FILE" "$PROXY_FILE" "$LOG_FILE" "$REPORT_LOG"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

# ============ MODULE SYSTEM (ERROR HANDLING) ============
check_deps() {
    local missing=()
    command -v curl >/dev/null 2>&1 || missing+=("curl")
    command -v jq >/dev/null 2>&1 || missing+=("jq")
    command -v qrencode >/dev/null 2>&1 || missing+=("qrencode")

    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "  ${R}[!] Dependency kurang: ${missing[*]}${NC}"
        echo -e "  ${Y}[...] Auto-install...${NC}"
        sudo apt update -qq 2>/dev/null
        for pkg in "${missing[@]}"; do
            case "$pkg" in
                curl) sudo apt install -y curl >/dev/null 2>&1 ;;
                jq) sudo apt install -y jq >/dev/null 2>&1 ;;
                qrencode) sudo apt install -y qrencode >/dev/null 2>&1 ;;
            esac
        done
        # Recheck
        for pkg in "${missing[@]}"; do
            if ! command -v "$pkg" >/dev/null 2>&1; then
                echo -e "  ${R}[✗] Gagal install: $pkg${NC}"
                echo -e "  ${DIM}Install manual: sudo apt install $pkg${NC}"
                return 1
            fi
        done
    fi
    echo -e "  ${G}[✓] Semua dependency siap.${NC}"
    return 0
}

# ============ BANNER ============
show_banner() {
    clear
    echo -e "${P}"
    cat << "EOF"
    ██╗  ██╗ ██████╗ ███████╗ ██████╗  ██████╗     ███╗   ███╗██████╗ 
    ██║  ██║██╔═══██╗╚══███╔╝██╔═══██╗██╔═══██╗    ████╗ ████║██╔══██╗
    ███████║██║   ██║  ███╔╝ ██║   ██║██║   ██║    ██╔████╔██║██║  ██║
    ██╔══██║██║   ██║ ███╔╝  ██║   ██║██║   ██║    ██║╚██╔╝██║██║  ██║
    ██║  ██║╚██████╔╝███████╗╚██████╔╝╚██████╔╝    ██║ ╚═╝ ██║██████╔╝
    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝     ╚═╝     ╚═╝╚═════╝ 
EOF
    echo -e "${NC}"
    echo -e "  ${DIM}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${C}       TIKTOK CLI TOOLKIT  ${W}v2.1${NC}  ${DIM}|${NC}  ${G}QR LOGIN ASLI${NC}"
    echo -e "  ${DIM}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# ============ STATUS BAR ============
status_bar() {
    local cookie_status="${R}✗ No Cookie${NC}"
    local proxy_count="0" report_count="0"
    [ -s "$COOKIE_FILE" ] && cookie_status="${G}✓ Cookie Loaded${NC}"
    [ -f "$PROXY_FILE" ] && proxy_count=$(grep -c -v '^$' "$PROXY_FILE" 2>/dev/null || echo "0")
    [ -f "$REPORT_LOG" ] && report_count=$(wc -l < "$REPORT_LOG" 2>/dev/null || echo "0")

    echo -e "  ${DIM}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "  ${DIM}│${NC}  ${W}STATUS:${NC} $cookie_status  ${DIM}|${NC}  ${W}PROXY:${NC} $proxy_count  ${DIM}|${NC}  ${W}REPORTS:${NC} $report_count  ${DIM}│${NC}"
    echo -e "  ${DIM}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# ============ QR LOGIN ASLI ============
qr_login_tiktok() {
    clear
    show_banner
    echo -e "  ${BOLD}${W}[ QR LOGIN TIKTOK - API v2 ASLI ]${NC}\n"
    echo -e "  ${DIM}Butuh client_key dari https://developers.tiktok.com${NC}"
    echo -e "  ${DIM}Endpoint: POST https://open.tiktokapis.com/v2/oauth/get_qrcode/${NC}\n"

    # Cek dependency
    if ! command -v qrencode >/dev/null 2>&1; then
        echo -e "  ${R}[!] qrencode ga ada. Install dulu: sudo apt install qrencode${NC}"
        read -r -p "  Enter..."
        return 1
    fi

    echo -ne "  ${C}Client Key>${NC} "
    read -r ckey
    if [ -z "$ckey" ]; then
        echo -e "  ${R}[!] Client key kosong.${NC}"
        sleep 2
        return 1
    fi

    echo -ne "  ${C}Scope (default: user.info.basic,user.info.username)>${NC} "
    read -r scope
    [ -z "$scope" ] && scope="user.info.basic,user.info.username"

    # Generate client_ticket unik
    local client_ticket
    client_ticket=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 12 | head -n 1)

    echo -e "\n  ${Y}[...] Request QR dari TikTok API v2...${NC}"

    # Request QR asli
    local qr_resp
    qr_resp=$(curl -s -X POST "https://open.tiktokapis.com/v2/oauth/get_qrcode/" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        --data-urlencode "client_key=$ckey" \
        --data-urlencode "scope=$scope" \
        --data-urlencode "state=hozoo_$(date +%s)")

    # Parse response
    local qr_url qr_token
    qr_url=$(echo "$qr_resp" | jq -r '.data.scan_qrcode_url // empty' 2>/dev/null)
    qr_token=$(echo "$qr_resp" | jq -r '.data.token // empty' 2>/dev/null)

    # Fallback parsing kalau struktur beda
    if [ -z "$qr_url" ]; then
        qr_url=$(echo "$qr_resp" | grep -o '"scan_qrcode_url":"[^"]*"' | cut -d'"' -f4)
    fi
    if [ -z "$qr_token" ]; then
        qr_token=$(echo "$qr_resp" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ -z "$qr_url" ]; then
        echo -e "  ${R}[✗] Gagal dapet QR URL. Response:${NC}"
        echo -e "  ${DIM}$qr_resp${NC}"
        echo -e "\n  ${Y}[!] Pastikan:${NC}"
        echo -e "  ${DIM}  - client_key valid & app udah di-approve TikTok${NC}"
        echo -e "  ${DIM}  - scope sesuai yang diizinkan app lo${NC}"
        read -r -p "  Enter..."
        return 1
    fi

    # Ganti client_ticket placeholder dengan ticket unik
    qr_url="${qr_url/client_ticket=tobefilled/client_ticket=$client_ticket}"
    qr_url="${qr_url/client_ticket=/client_ticket=$client_ticket}"

    echo -e "  ${G}[✓] QR URL didapat!${NC}"
    echo -e "  ${DIM}Ticket: $client_ticket${NC}"
    echo -e "  ${DIM}Token: ${qr_token:-N/A}${NC}\n"

    # Render QR ke terminal
    echo -e "  ${BOLD}${W}SCAN QR INI PAKE APLIKASI TIKTOK:${NC}\n"
    echo "$qr_url" | qrencode -t ANSIUTF8 -o -

    echo ""
    echo -e "  ${Y}[!] Buka TikTok di HP → Profil → Scan${NC}"
    echo -e "  ${Y}[!] Scan QR di atas, lalu konfirmasi login.${NC}\n"

    # Simpan session
    cat > "$QR_SESSION" <<EOF
{
  "qr_url": "$qr_url",
  "token": "${qr_token}",
  "client_ticket": "$client_ticket",
  "client_key": "$ckey",
  "scope": "$scope",
  "created": "$(date -Iseconds)"
}
EOF

    # Polling status
    echo -e "  ${DIM}[...] Nunggu scan (polling tiap 3 detik, max 2 menit)...${NC}"
    local max_poll=40 poll_count=0 status="new"

    while [ $poll_count -lt $max_poll ]; do
        sleep 3
        ((poll_count++))

        local check_resp
        check_resp=$(curl -s -X POST "https://open.tiktokapis.com/v2/oauth/check_qrcode/" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            --data-urlencode "client_key=$ckey" \
            --data-urlencode "token=$qr_token")

        status=$(echo "$check_resp" | jq -r '.data.status // .status // empty' 2>/dev/null)
        [ -z "$status" ] && status=$(echo "$check_resp" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

        case "$status" in
            "new") echo -ne "  ${DIM}.${NC}" ;;
            "scanned")
                echo -e "\n  ${Y}[!] QR udah di-scan. Konfirmasi di HP!${NC}"
                ;;
            "confirmed")
                echo -e "\n  ${G}[✓] LOGIN BERHASIL! Authorization code diterima.${NC}"
                local auth_code
                auth_code=$(echo "$check_resp" | jq -r '.data.authorization_code // .authorization_code // empty' 2>/dev/null)
                echo "$check_resp" > "$APP_DIR/qr_confirmed.json"
                if [ -n "$auth_code" ]; then
                    echo -e "  ${DIM}Auth code: ${auth_code:0:20}...${NC}"
                    # Simpan sebagai pseudo-cookie (auth code bukan cookie, tapi bisa di-exchange)
                    echo "AUTH_CODE=$auth_code" >> "$COOKIE_FILE"
                fi
                log "QR Login success"
                read -r -p "  Enter..."
                return 0
                ;;
            "expired")
                echo -e "\n  ${R}[✗] QR expired. Coba lagi.${NC}"
                read -r -p "  Enter..."
                return 1
                ;;
        esac
    done

    echo -e "\n  ${R}[✗] Timeout. QR expired.${NC}"
    read -r -p "  Enter..."
    return 1
}

# ============ LOGIN MENU (UPDATED) ============
login_menu() {
    while true; do
        clear
        show_banner
        echo -e "  ${BOLD}${W}[ LOGIN TIKTOK ]${NC}\n"
        echo -e "  ${G}[1]${NC} ${BOLD}QR LOGIN ASLI${NC} ${DIM}(TikTok API v2)${NC}"
        echo -e "  ${G}[2]${NC} Paste Cookie (dari browser)"
        echo -e "  ${G}[3]${NC} Load Cookie dari file"
        echo -e "  ${G}[4]${NC} Lihat Cookie Tersimpan"
        echo -e "  ${G}[5]${NC} Cek Dependency"
        echo -e "  ${R}[0]${NC} Kembali"
        echo ""
        echo -ne "  ${C}Pilih>${NC} "
        read -r opt

        case "$opt" in
            1) qr_login_tiktok ;;
            2)
                clear
                echo -e "  ${Y}[!] Buka browser, login TikTok, ambil cookie dari DevTools${NC}"
                echo -ne "  ${C}Cookie>${NC} "
                read -r ck
                if [ -n "$ck" ]; then
                    echo "$ck" > "$COOKIE_FILE"
                    echo -e "  ${G}[✓] Tersimpan.${NC}"
                fi
                sleep 1
                ;;
            3)
                echo -ne "  ${C}Path file>${NC} "
                read -r path
                [ -f "$path" ] && cp "$path" "$COOKIE_FILE" && echo -e "  ${G}[✓] Loaded.${NC}" || echo -e "  ${R}[!] Ga ada.${NC}"
                sleep 1
                ;;
            4)
                clear
                echo -e "  ${BOLD}${W}[ COOKIE ]${NC}\n"
                [ -s "$COOKIE_FILE" ] && head -c 300 "$COOKIE_FILE" || echo -e "  ${R}Kosong.${NC}"
                echo ""
                read -r -p "  Enter..."
                ;;
            5)
                echo ""
                check_deps
                sleep 2
                ;;
            0) return ;;
        esac
    done
}

# ============ MAIN MENU ============
main_menu() {
    # Cek dependency sekali di awal
    if ! check_deps; then
        echo -e "  ${R}[!] Dependency ga lengkap. Beberapa fitur mungkin error.${NC}"
        sleep 2
    fi

    while true; do
        show_banner
        status_bar
        echo -e "  ${BOLD}${W}[ MENU UTAMA ]${NC}\n"
        echo -e "  ${G}[1]${NC}  Login TikTok ${DIM}(QR ASLI / Cookie)${NC}"
        echo -e "  ${G}[2]${NC}  Report Akun / Video"
        echo -e "  ${G}[3]${NC}  Manage Proxy"
        echo -e "  ${G}[4]${NC}  Upload / Load File"
        echo -e "  ${G}[5]${NC}  Lihat Log Report"
        echo -e "  ${G}[6]${NC}  Settings"
        echo -e "  ${R}[0]${NC}  Exit"
        echo ""
        echo -ne "  ${C}hozoo${NC}@${C}md${NC} ${DIM}~${NC} ${W}$${NC} "
        read -r choice

        case "$choice" in
            1) login_menu ;;
            2) report_menu ;;
            3) proxy_menu ;;
            4) file_menu ;;
            5) view_reports ;;
            6) settings_menu ;;
            0|q|Q|exit)
                echo -e "\n  ${G}Bye, Maharaj.${NC}\n"
                tput cnorm 2>/dev/null || true
                exit 0
                ;;
            *) echo -e "  ${R}[!] Ga valid.${NC}"; sleep 1 ;;
        esac
    done
}

# ============ REPORT / PROXY / FILE / SETTINGS (sama kayak sebelumnya) ============
# ... (copy dari script lama lo, ga berubah) ...

# ============ START ============
main_menu
