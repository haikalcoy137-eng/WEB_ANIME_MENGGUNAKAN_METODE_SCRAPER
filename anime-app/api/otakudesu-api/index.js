const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const apicache = require("apicache");

const app = express();
let cache = apicache.middleware;
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const BASE_URL = "https://otakudesu.best";

// Home (Ongoing & Completed)
app.get("/api/home", cache("5 minutes"), async (req, res) => {
    try {
        const response = await axios.get(BASE_URL);
        const $ = cheerio.load(response.data);

        const ongoing = [];
        $(".venz").eq(0).find("ul > li").each((i, el) => {
            const title = $(el).find(".jdlflm").text();
            const endpoint = $(el).find(".thumb > a").attr("href").replace(BASE_URL + "/anime/", "");
            const thumb = $(el).find(".thumbz > img").attr("src");
            const episode = $(el).find(".epz").text().trim();
            const upload_on = $(el).find(".newnime").text().trim();
            const day_updated = $(el).find(".epztipe").text().trim();

            ongoing.push({ title, endpoint, thumb, episode, upload_on, day_updated });
        });

        const completed = [];
        $(".venz").eq(1).find("ul > li").each((i, el) => {
            const title = $(el).find(".jdlflm").text();
            const endpoint = $(el).find(".thumb > a").attr("href").replace(BASE_URL + "/anime/", "");
            const thumb = $(el).find(".thumbz > img").attr("src");
            const episode = $(el).find(".epz").text().trim();
            const upload_on = $(el).find(".newnime").text().trim();
            const score = $(el).find(".epztipe").text().trim();

            completed.push({ title, endpoint, thumb, episode, upload_on, score });
        });

        res.json({
            status: true,
            message: "Berhasil mengambil data home",
            ongoing_anime: ongoing,
            complete_anime: completed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server" });
    }
});

// Search Anime
app.get("/api/search/:query", cache("5 minutes"), async (req, res) => {
    try {
        const query = req.params.query;
        const response = await axios.get(`${BASE_URL}/?s=${query}&post_type=anime`);
        const $ = cheerio.load(response.data);

        const results = [];
        $(".chivsrc > li").each((i, el) => {
            const title = $(el).find("h2 > a").text();
            const endpoint = $(el).find("h2 > a").attr("href").replace(BASE_URL + "/anime/", "");
            const thumb = $(el).find("img").attr("src");
            
            let genres = [];
            $(el).find(".set").eq(0).find("a").each((j, el2) => {
                genres.push($(el2).text());
            });

            const status = $(el).find(".set").eq(1).text().replace("Status : ", "").trim();
            const rating = $(el).find(".set").eq(2).text().replace("Rating : ", "").trim();

            results.push({ title, endpoint, thumb, genres, status, rating });
        });

        res.json({
            status: true,
            message: `Berhasil mencari anime: ${query}`,
            search_results: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server" });
    }
});

// Anime Details
app.get("/api/anime/:endpoint", cache("5 minutes"), async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const response = await axios.get(`${BASE_URL}/anime/${endpoint}`);
        const $ = cheerio.load(response.data);

        const title = $(".jdlrx > h1").text().trim();
        const thumb = $(".fotoanime > img").attr("src");
        const synopsis = $(".sinopc > p").map((i, el) => $(el).text()).get().join("\n");

        const info = {};
        $(".infozingle > p").each((i, el) => {
            const split = $(el).text().split(":");
            if (split.length > 1) {
                const key = split[0].trim().toLowerCase().replace(" ", "_");
                const val = split.slice(1).join(":").trim();
                info[key] = val;
            }
        });

        const episode_list = [];
        $(".episodelist").eq(1).find("ul > li").each((i, el) => {
            const eps_title = $(el).find("a").text().trim();
            const eps_endpoint = $(el).find("a").attr("href").replace(BASE_URL + "/episode/", "");
            const date = $(el).find(".zeebr").text().trim();
            episode_list.push({ title: eps_title, endpoint: eps_endpoint, date });
        });

        res.json({
            status: true,
            message: "Berhasil mengambil detail anime",
            anime_detail: {
                title,
                thumb,
                synopsis,
                ...info,
                episode_list
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server" });
    }
});

// Episode Details & Streaming links
app.get("/api/episode/:endpoint", cache("10 minutes"), async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const response = await axios.get(`${BASE_URL}/episode/${endpoint}`);
        const $ = cheerio.load(response.data);

        const title = $(".venutama h1").text().trim();
        const stream_link = $("#lightsVideo iframe").attr("src");

        const downloads = [];
        $(".download ul li").each((i, el) => {
            const quality = $(el).find("strong").text().trim();
            const size = $(el).find("i").text().trim();
            
            const links = [];
            $(el).find("a").each((j, el2) => {
                links.push({
                    server: $(el2).text().trim(),
                    url: $(el2).attr("href")
                });
            });

            downloads.push({ quality, size, links });
        });

        res.json({
            status: true,
            message: "Berhasil mengambil detail episode",
            episode_detail: {
                title,
                stream_link,
                downloads
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server" });
    }
});

// Default route
app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "Otakudesu API is Running. Tolong gunakan API ini dengan bijak dan pertimbangkan untuk meminta izin kepada pihak Otakudesu.",
        endpoints: {
            home: "/api/home",
            search: "/api/search/:query",
            anime_details: "/api/anime/:endpoint",
            episode: "/api/episode/:endpoint"
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
