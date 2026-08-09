export type VideoProvider = "youtube" | "google-drive" | "google-vids";

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function youtubeEmbedUrl(url: URL) {
  const hostname = url.hostname.replace(/^www\./, "");
  let videoId = "";

  if (hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
    if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/")[2] ?? "";
    } else {
      videoId = url.searchParams.get("v") ?? "";
    }
  }

  return VIDEO_ID_PATTERN.test(videoId)
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : "";
}

function googleDriveEmbedUrl(url: URL) {
  if (url.hostname !== "drive.google.com") return "";

  const match = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : "";
}

function googleVidsEmbedUrl(url: URL) {
  if (url.hostname !== "docs.google.com") return "";

  const match = url.pathname.match(/^\/videos\/d\/([a-zA-Z0-9_-]+)\/play/);
  return match?.[1] ? `https://docs.google.com/videos/d/${match[1]}/play` : "";
}

export function getVideoEmbedUrl(rawUrl: string, provider: VideoProvider) {
  try {
    const url = new URL(rawUrl);

    if (url.protocol !== "https:") return "";
    if (provider === "youtube") return youtubeEmbedUrl(url);
    if (provider === "google-drive") return googleDriveEmbedUrl(url);
    return googleVidsEmbedUrl(url);
  } catch {
    return "";
  }
}
