import axios from 'axios';
import * as cheerio from 'cheerio';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let cache = { data: null, fetchedAt: 0 };

/**
 * Fetches notices/events from a college website URL.
 * Parses HTML tables with Date | Notice columns (e.g. bcetodisha.ac.in/notice.php).
 * @param {string} url - Full URL to fetch (e.g. https://bcetodisha.ac.in/notice.php)
 * @returns {Promise<Array<{date:string, title:string, url?:string}>>}
 */
export async function fetchLiveNotices(url) {
    if (!url || typeof url !== 'string') return [];

    if (cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.data;
    }

    try {
        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'CollegeAI/1.0 (admissions bot)' },
        });

        const $ = cheerio.load(html);
        const notices = [];

        // Try common table structures: Date | Notice | Download
        $('table tr').each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 2) {
                const dateCell = $(cells[0]).text().trim();
                const noticeCell = $(cells[1]);
                const link = noticeCell.find('a').first();
                const title = link.length ? link.text().trim() : noticeCell.text().trim();
                const href = link.attr('href') || '';
                if (title) {
                    notices.push({
                        date: dateCell,
                        title,
                        url: href.startsWith('http') ? href : (href ? new URL(href, url).href : ''),
                    });
                }
            }
        });

        // Fallback: any list/div with notice links
        if (notices.length === 0) {
            $('a[href*="drive.google.com"], a[href*=".pdf"]').each((_, el) => {
                const $el = $(el);
                const title = $el.text().trim();
                const href = $el.attr('href') || '';
                if (title && title.length > 5 && title.length < 200) {
                    notices.push({
                        date: '',
                        title,
                        url: href.startsWith('http') ? href : new URL(href, url).href,
                    });
                }
            });
        }

        const result = notices.slice(0, 20); // Limit to 20 most recent
        cache = { data: result, fetchedAt: Date.now() };
        return result;
    } catch (err) {
        if (cache.data) return cache.data;
        return [];
    }
}

/**
 * Clears the in-memory cache (e.g. after URL change).
 */
export function clearLiveDataCache() {
    cache = { data: null, fetchedAt: 0 };
}
