# ACF Fields Plan: Video Posts (YouTube URLs)

This plan defines the recommended ACF field group for the **Video** custom post type so the frontend can display YouTube links and metadata correctly.

---

## 1. Keep “Homepage Sections” for pages only

- **Field group:** “Homepage Sections” (as in your screenshot).
- **Use for:** Page-level content (hero, mission, about, follow & join, etc.), **not** for individual video posts.
- **Recommendation:** If `video_url` / `video_file` in “Homepage Sections” were meant for a **single** homepage video (e.g. one featured video), leave them there. For **per-video** YouTube URLs, use the dedicated Video CPT field group below instead.

---

## 2. New field group: “Video Post Fields”

Create a **separate** ACF field group that applies only to the **Video** post type.

| Setting        | Value        |
|----------------|-------------|
| **Field group name** | Video Post Fields |
| **Location**   | Post Type — is equal to — **Video** (or **Videos**, match your CPT slug) |
| **Position**   | Normal (after content) |

---

## 3. Fields for Video posts (YouTube-focused)

All videos are YouTube-hosted; the card links to the YouTube URL. The app reads these ACF field names exactly.

| Order | Field label     | Field name   | Field type | Required | Notes |
|-------|-----------------|-------------|------------|----------|--------|
| 1     | Video URL       | `video_url` | **URL**    | Yes      | YouTube watch or share link (e.g. `https://www.youtube.com/watch?v=...` or `https://youtu.be/...`). Frontend normalizes to watch URL and uses this for the card link. |
| 2     | Poster image    | `poster_url`| **URL** or **Image** | No | Thumbnail for the card. If empty, app falls back to ACF `poster` / `thumbnail` or featured image. |
| 3     | Poster (image)  | `poster`    | **Image**  | No       | Alternative to `poster_url`; app accepts object with `url` or string. |
| 4     | Caption         | `caption`   | **Text** or **Textarea** | No | Short line under the title on the card. |
| 5     | Description     | `description` | **Textarea** | No     | Longer text; used as fallback if `caption` is empty. |
| 6     | Featured video  | `featured`  | **True / False** | No | If checked, this video’s optional section title/subtitle are used for the Videos section heading. |
| 7     | Section title   | `section_title`   | **Text** | No | Override the section heading (e.g. “Videos”) when this post is the featured one. |
| 8     | Section subtitle| `section_subtitle`| **Text** | No | Override the section subheading when this post is featured. |

---

## 4. Field details (copy into ACF)

- **video_url** (URL)  
  - Label: Video URL  
  - Name: `video_url`  
  - Default: (none)  
  - Instructions: “YouTube watch or share URL. The whole card will link to this URL.”

- **poster_url** (URL) [optional]  
  - Label: Poster URL  
  - Name: `poster_url`  
  - Instructions: “Thumbnail image URL for the video card (e.g. from YouTube).”

- **poster** (Image) [optional]  
  - Label: Poster image  
  - Name: `poster`  
  - Return format: Image URL or Image Array (app supports both via `url`).

- **caption** (Text) [optional]  
  - Label: Caption  
  - Name: `caption`  

- **description** (Textarea) [optional]  
  - Label: Description  
  - Name: `description`  

- **featured** (True / False) [optional]  
  - Label: Featured video  
  - Name: `featured`  
  - Instructions: “Use this video’s section title/subtitle for the Videos block heading.”

- **section_title** (Text) [optional]  
  - Label: Section title  
  - Name: `section_title`  

- **section_subtitle** (Text) [optional]  
  - Label: Section subtitle  
  - Name: `section_subtitle`  

---

## 5. What to remove or avoid on Video posts

- **video_file:** Not needed if every video is YouTube (app still supports it as fallback after `video_url`). You can omit it in the “Video Post Fields” group to avoid confusion; only `video_url` is required for YouTube.

---

## 6. Summary

| Purpose              | Where to configure                          |
|----------------------|---------------------------------------------|
| One homepage video   | “Homepage Sections” — keep `video_url` / `video_file` there if used by a page template. |
| Per-video YouTube URL| New field group “Video Post Fields” — **Video** post type, required **URL** field `video_url`. |
| Card thumbnail/text  | Same group: `poster_url` or `poster`, `caption`, `description`. |
| Section heading      | Same group: `featured`, `section_title`, `section_subtitle`. |

The frontend already reads these ACF names (`video_url`, `poster_url`, `poster`, `caption`, `description`, `featured`, `section_title`, `section_subtitle`); no app code changes are required once this ACF setup is in place.
