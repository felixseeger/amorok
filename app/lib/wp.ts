const DEFAULT_WP_API_URL = 'https://amorok-back.felixseeger.de/wp-json/wp/v2';

function normalizeWpApiUrl(rawUrl: string): string {
    const candidate = (rawUrl || '').trim() || DEFAULT_WP_API_URL;
    try {
        const url = new URL(candidate);
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.protocol === 'http:') {
            url.protocol = 'https:';
        }
        return url.toString().replace(/\/$/, '');
    } catch {
        return DEFAULT_WP_API_URL;
    }
}

const WP_API_URL = normalizeWpApiUrl(import.meta.env.VITE_WP_API_URL || DEFAULT_WP_API_URL);

export interface WPPage {
    id: number;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    acf?: {
        // Hero Section
        hero_title?: string;
        hero_subtitle?: string;
        hero_zitat?: string;

        // Mission / Music Section
        mission_title?: string;
        mission_text?: string;
        music_title?: string;
        music_text?: string;
        music_iframe?: string;  // Spotify/player embed HTML

        // Interior / About Section
        interior_title?: string;
        interior_text?: string;
        about_title?: string;
        about_text?: string;
        about_subtitle?: string;
        about_image?: string | { url: string };
        about_quote?: string;
        about_description?: string;
        about_stat_1?: string;
        about_stat_2?: string;
        about_stat_3?: string;
        about_content?: string;
        about_text_extra?: string;   // Section below About
        about_extra_title?: string;

        // Stats Section
        stat_1_label?: string;
        stat_1_value?: string;
        stat_2_label?: string;
        stat_2_value?: string;
        stat_3_label?: string;
        stat_3_value?: string;
        stat_4_label?: string;
        stat_4_value?: string;
        player_iframe?: string;

        // Follow & Join Section
        follow_join_title?: string;
        follow_join_subtitle?: string;
        followjoin_text?: string;
        follow_join_cta_primary?: string;
        follow_join_cta_secondary?: string;
        follow_join_video_url?: string;
        follow_join_poster_url?: string;

        // Contact
        contact_email?: string;
        contact_phone?: string;

        [key: string]: unknown;
    };
}

/** Normalize raw API response into WPPage (handles content as object or string, merges ACF from single-page if needed) */
function normalizePage(raw: unknown): WPPage | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    const id = typeof o.id === 'number' ? o.id : null;
    const slug = typeof o.slug === 'string' ? o.slug : '';
    const title = o.title as { rendered?: string } | undefined;
    let content = o.content as { rendered?: string } | string | undefined;
    if (typeof content === 'string') content = { rendered: content };
    const acf = (o.acf as WPPage['acf']) ?? (o.meta as WPPage['acf']) ?? undefined;
    return {
        id: id ?? 0,
        slug,
        title: title && typeof title === 'object' ? { rendered: title.rendered ?? '' } : { rendered: '' },
        content: content && typeof content === 'object' ? { rendered: content.rendered ?? '' } : { rendered: '' },
        acf: acf && typeof acf === 'object' ? acf : undefined,
    };
}

/**
 * Fetch a single page by slug.
 * Tries list endpoint first, then single-page by ID if ACF is missing (some WP/ACF setups only expose ACF on single resource).
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
    try {
        const res = await fetch(`${WP_API_URL}/pages?slug=${encodeURIComponent(slug)}&_embed`);
        if (!res.ok) throw new Error('Failed to fetch page');
        const data = await res.json();
        const first = Array.isArray(data) ? data[0] : data;
        if (!first) return null;

        let page = normalizePage(first);
        if (!page) return null;

        const hasAcf = page.acf && typeof page.acf === 'object' && Object.keys(page.acf).length > 0;
        if (!hasAcf && page.id) {
            try {
                const singleRes = await fetch(`${WP_API_URL}/pages/${page.id}?_embed`);
                if (singleRes.ok) {
                    const single = await singleRes.json();
                    const singlePage = normalizePage(single);
                    if (singlePage?.acf && Object.keys(singlePage.acf).length > 0) {
                        page = { ...page, acf: singlePage.acf };
                    }
                }
            } catch {
                // ignore; use list response only
            }
        }
        return page;
    } catch (error) {
        console.error('WP Fetch Error:', error);
        return null;
    }
}

/**
 * Fetch generic posts or custom post types.
 * Returns [] on 404 (e.g. CPT slug "video" when only "videos" exists) so the app keeps working.
 */
export async function getPosts(postType: string = 'posts') {
    try {
        const res = await fetch(`${WP_API_URL}/${postType}?_embed`);
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error('WP Fetch Error:', error);
        return [];
    }
}

/** Video custom post type ACF fields from WordPress */
export interface WPVideoACF {
    video_url?: string;          // YouTube/Vimeo URL or direct video file URL
    video_file?: string;         // Self-hosted video URL (ACF file field)
    poster_url?: string;         // Thumbnail/poster image URL
    video_poster?: unknown;      // ACF image field "video_poster" (image array, URL string, or false)
    poster?: string | { url: string };  // ACF image (url string or object)
    thumbnail?: string | { url: string };
    caption?: string;
    description?: string;
    duration?: string;
    section_title?: string;      // Override section heading
    section_subtitle?: string;   // Override section subheading
    featured?: boolean;          // Use as primary background video
    embed_code?: string;         // Raw iframe HTML
    [key: string]: unknown;      // Any additional ACF fields
}

/** Video custom post type from WordPress */
export interface WPVideo {
    id: number;
    slug: string;
    title: { rendered: string };
    content?: { rendered: string };
    excerpt?: { rendered: string };
    acf?: WPVideoACF;
    _embedded?: {
        'wp:featuredmedia'?: Array<{ source_url: string }>;
    };
}

/** Extract attachment ID from ACF image field when it's stored as ID only (number or { id } or { ID }) */
function getPosterAttachmentId(acf: WPVideoACF | undefined): number | null {
    if (!acf) return null;
    const candidates = [acf.poster, acf.thumbnail, (acf as Record<string, unknown>).poster_image, (acf as Record<string, unknown>).image];
    for (const field of candidates) {
        if (typeof field === 'number' && field > 0) return field;
        if (field && typeof field === 'object') {
            const o = field as Record<string, unknown>;
            if (typeof o.id === 'number') return o.id;
            if (typeof o.ID === 'number') return o.ID;
        }
    }
    return null;
}

/** Fetch media attachment source_url from WordPress REST API (for ACF Image ID fields) */
async function fetchMediaUrl(attachmentId: number): Promise<string | null> {
    try {
        const base = WP_API_URL.replace(/\/$/, '');
        const res = await fetch(`${base}/media/${attachmentId}`);
        if (!res.ok) return null;
        const data = (await res.json()) as Record<string, unknown>;
        const url = data.source_url;
        return typeof url === 'string' ? url : null;
    } catch {
        return null;
    }
}

/** Extract URL string from ACF image field (url string, object with url/source_url/sizes, or attachment ID) */
export function toImageUrl(val: unknown): string | null {
    if (typeof val === 'string' && val) return val;
    if (typeof val === 'number' && val > 0) return null;
    if (val && typeof val === 'object') {
        const o = val as Record<string, unknown>;
        if (typeof o.url === 'string') return o.url;
        if (typeof o.source_url === 'string') return o.source_url;
        if (typeof o.link === 'string' && /\.(jpg|jpeg|png|gif|webp)/i.test(o.link)) return o.link;
        if (typeof o.src === 'string') return o.src;
        const guid = o.guid as { rendered?: string } | undefined;
        if (guid && typeof guid === 'object' && typeof guid.rendered === 'string') return guid.rendered;
        const sizes = o.sizes as Record<string, unknown> | undefined;
        if (sizes) {
            if (typeof sizes.large === 'string') return sizes.large;
            if (typeof sizes.medium_large === 'string') return sizes.medium_large;
            if (typeof sizes.medium === 'string') return sizes.medium;
            if (typeof sizes.full === 'string') return sizes.full;
            const full = sizes.full as Record<string, unknown> | undefined;
            if (full && typeof full.url === 'string') return full.url;
            if (full && typeof full.source_url === 'string') return full.source_url;
            const large = sizes.large as Record<string, unknown> | undefined;
            if (large && typeof large.url === 'string') return large.url;
            const med = sizes.medium as Record<string, unknown> | undefined;
            if (med && typeof med.url === 'string') return med.url;
        }
    }
    return null;
}

/** Whether a normalized video has a poster URL (from acf or _embedded featured media) */
function hasPosterUrl(v: WPVideo): boolean {
    if (v.acf?.poster_url) return true;
    if (v.acf?.video_poster && v.acf.video_poster !== false && toImageUrl(v.acf.video_poster)) return true;
    if (toImageUrl(v.acf?.poster)) return true;
    if (toImageUrl(v.acf?.thumbnail)) return true;
    if (toImageUrl(v.acf?.poster_image)) return true;
    if (toImageUrl(v.acf?.image)) return true;
    if (v._embedded?.['wp:featuredmedia']?.[0]?.source_url) return true;
    return false;
}

/** Normalize raw API video item: merge meta and root-level into acf when WP exposes ACF as meta or at root */
function normalizeVideoItem(raw: Record<string, unknown>): WPVideo {
    const meta = raw.meta as Record<string, unknown> | undefined;
    const acf = (raw.acf as WPVideoACF | undefined) ?? {};
    const mergedAcf: WPVideoACF = { ...acf };
    if (meta && typeof meta === 'object') {
        if (typeof meta.video_url === 'string' && !mergedAcf.video_url) mergedAcf.video_url = meta.video_url;
        if (typeof meta.video_file === 'string' && !mergedAcf.video_file) mergedAcf.video_file = meta.video_file;
        const metaPosterUrl = typeof meta.poster_url === 'string' ? meta.poster_url
            : toImageUrl(meta.poster) ?? toImageUrl(meta.thumbnail) ?? toImageUrl(meta.poster_image) ?? toImageUrl(meta.image)
            ?? toImageUrl(meta.featured_image) ?? toImageUrl(meta.thumb) ?? toImageUrl(meta.cover) ?? (typeof meta.image_url === 'string' ? meta.image_url : null);
        if (metaPosterUrl && !mergedAcf.poster_url) mergedAcf.poster_url = metaPosterUrl;
        if (!mergedAcf.poster && (meta.poster || meta.thumbnail || meta.poster_image || meta.image || meta.featured_image || meta.thumb || meta.cover)) {
            mergedAcf.poster = (meta.poster ?? meta.thumbnail ?? meta.poster_image ?? meta.image ?? meta.featured_image ?? meta.thumb ?? meta.cover) as WPVideoACF['poster'];
        }
        if (typeof meta.caption === 'string' && !mergedAcf.caption) mergedAcf.caption = meta.caption;
        if (typeof meta.description === 'string' && !mergedAcf.description) mergedAcf.description = meta.description;
        if (typeof meta.section_title === 'string' && !mergedAcf.section_title) mergedAcf.section_title = meta.section_title;
        if (typeof meta.section_subtitle === 'string' && !mergedAcf.section_subtitle) mergedAcf.section_subtitle = meta.section_subtitle;
        if (meta.featured !== undefined && mergedAcf.featured === undefined) mergedAcf.featured = !!meta.featured;
    }
    if (typeof raw.video_url === 'string' && !mergedAcf.video_url) mergedAcf.video_url = raw.video_url;
    if (typeof raw.video_file === 'string' && !mergedAcf.video_file) mergedAcf.video_file = raw.video_file;
    const rootPosterUrl = typeof raw.poster_url === 'string' ? raw.poster_url
        : toImageUrl(raw.poster) ?? toImageUrl(raw.thumbnail) ?? toImageUrl(raw.poster_image) ?? toImageUrl(raw.image)
        ?? toImageUrl(raw.featured_image) ?? toImageUrl(raw.thumb) ?? toImageUrl(raw.cover) ?? (typeof raw.image_url === 'string' ? raw.image_url : null);
    if (rootPosterUrl && !mergedAcf.poster_url) mergedAcf.poster_url = rootPosterUrl;
    if (!mergedAcf.poster && (raw.poster || raw.thumbnail || raw.poster_image || raw.image || raw.featured_image || raw.thumb || raw.cover)) {
        mergedAcf.poster = (raw.poster ?? raw.thumbnail ?? raw.poster_image ?? raw.image ?? raw.featured_image ?? raw.thumb ?? raw.cover) as WPVideoACF['poster'];
    }
    if (!mergedAcf.poster_url && mergedAcf.video_poster && mergedAcf.video_poster !== false) {
        const vpUrl = toImageUrl(mergedAcf.video_poster);
        if (vpUrl) mergedAcf.poster_url = vpUrl;
    }
    const embeddedMedia = raw._embedded as { 'wp:featuredmedia'?: Array<{ id?: number; source_url?: string }> } | undefined;
    const featuredUrl = embeddedMedia?.['wp:featuredmedia']?.[0]?.source_url;
    if (featuredUrl && !mergedAcf.poster_url) mergedAcf.poster_url = featuredUrl;
    const title = raw.title as { rendered?: string } | undefined;
    const content = raw.content as { rendered?: string } | undefined;
    const excerpt = raw.excerpt as { rendered?: string } | undefined;
    return {
        id: typeof raw.id === 'number' ? raw.id : 0,
        slug: typeof raw.slug === 'string' ? raw.slug : '',
        title: title && typeof title === 'object' ? { rendered: title.rendered ?? '' } : { rendered: '' },
        content,
        excerpt,
        acf: Object.keys(mergedAcf).length ? mergedAcf : undefined,
        _embedded: raw._embedded as WPVideo['_embedded'],
    };
}

/** Raw post from WordPress REST API (for mapping) */
interface WPRawPost {
    id: number;
    slug: string;
    title?: { rendered?: string };
    content?: { rendered?: string };
    excerpt?: { rendered?: string };
    acf?: WPVideoACF;
    _embedded?: {
        'wp:term'?: Array<Array<{ taxonomy: string; slug: string }>>;
        'wp:featuredmedia'?: Array<{ source_url: string }>;
    };
    [key: string]: unknown;
}

/** Map a raw WordPress post to WPVideo (for standard "post" type with format video or ACF video fields) */
function mapPostToVideo(raw: WPRawPost): WPVideo {
    const asRecord = raw as unknown as Record<string, unknown>;
    return normalizeVideoItem(asRecord);
}

/** Whether a post has post_format taxonomy slug "video" from _embedded wp:term */
function isVideoFormatPost(raw: WPRawPost): boolean {
    const terms = raw._embedded?.['wp:term'];
    if (!Array.isArray(terms)) return false;
    for (const group of terms) {
        if (!Array.isArray(group)) continue;
        for (const t of group) {
            if (t?.taxonomy === 'post_format' && t?.slug === 'video') return true;
        }
    }
    return false;
}

/**
 * Fetch a single video by ID from the CPT endpoint (single-resource often exposes ACF when list does not).
 */
async function fetchSingleVideoById(cptSlug: string, id: number): Promise<WPVideo | null> {
    try {
        const res = await fetch(`${WP_API_URL}/${cptSlug}/${id}?_embed`);
        if (!res.ok) return null;
        const raw = (await res.json()) as Record<string, unknown>;
        return normalizeVideoItem(raw);
    } catch {
        return null;
    }
}

/**
 * Fetch videos from the videos custom post type.
 * CPT slug must match your WordPress registration (e.g. 'videos' or 'video').
 * If the list response has no ACF (no video_url), fetches each video by ID to get ACF from the single endpoint.
 */
export async function getVideos(cptSlug: string = 'videos'): Promise<WPVideo[]> {
    try {
        const data = await getPosts(cptSlug);
        const list = Array.isArray(data) ? data : [];
        let videos = list.map((item: Record<string, unknown>) => normalizeVideoItem(item));

        const needsEnrich = (v: WPVideo) =>
            (!v.acf?.video_url && !v.acf?.video_file) || !hasPosterUrl(v);
        if (videos.some(needsEnrich)) {
            const enriched = await Promise.all(
                videos.map(async (v) => {
                    if (!needsEnrich(v)) return v;
                    const single = await fetchSingleVideoById(cptSlug, v.id);
                    if (!single) return v;
                    return {
                        ...v,
                        acf: { ...v.acf, ...single.acf },
                        _embedded: single._embedded ?? v._embedded,
                    } as WPVideo;
                })
            );
            videos = enriched;
        }

        const posterIdToResolve = videos.filter((v) => !hasPosterUrl(v) && getPosterAttachmentId(v.acf));
        if (posterIdToResolve.length > 0) {
            const resolved = await Promise.all(
                videos.map(async (v) => {
                    if (hasPosterUrl(v)) return v;
                    const attachmentId = getPosterAttachmentId(v.acf);
                    if (!attachmentId) return v;
                    const url = await fetchMediaUrl(attachmentId);
                    if (!url) return v;
                    return {
                        ...v,
                        acf: { ...v.acf, poster_url: url },
                    } as WPVideo;
                })
            );
            videos = resolved;
        }

        return videos;
    } catch (error) {
        console.error('WP Videos Fetch Error:', error);
        return [];
    }
}

/**
 * Fetch standard WordPress posts that are in "video" post format and map them to WPVideo.
 * Use when videos are stored as posts with post format "video" instead of a custom post type.
 */
export async function getVideoPosts(): Promise<WPVideo[]> {
    try {
        const res = await fetch(`${WP_API_URL}/posts?_embed&per_page=50`);
        if (!res.ok) return [];
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        return list
            .filter((p: WPRawPost) => isVideoFormatPost(p))
            .map((p: WPRawPost) => mapPostToVideo(p));
    } catch (error) {
        console.error('WP Video Posts Fetch Error:', error);
        return [];
    }
}

export interface WPMenuItem {
    ID: number;
    title: string;
    url: string;
    target?: string;
    classes?: string[];
    menu_order?: number;
    child_items?: WPMenuItem[];
}

/**
 * Fetch navigation menu items
 * Tries standard WP-REST-API V2 Menus plugin endpoint: /menus/v1/menus/{slug}
 */
export async function getNavigation(menuSlug: string = 'main-menu'): Promise<WPMenuItem[]> {
    try {
        // Construct API root from WP_API_URL (removes /wp/v2)
        const apiRoot = WP_API_URL.replace('/wp/v2', '');
        const res = await fetch(`${apiRoot}/menus/v1/menus/${menuSlug}`);

        if (!res.ok) {
            // Fallback: try finding a menu by location if slug fails, or just warn
            console.warn(`Failed to fetch menu: ${menuSlug}`);
            return [];
        }

        const data = await res.json();
        const items = data.items as WPMenuItem[];
        return Array.isArray(items) ? items : [];
    } catch (error) {
        console.error('WP Navigation Fetch Error:', error);
        return [];
    }
}

