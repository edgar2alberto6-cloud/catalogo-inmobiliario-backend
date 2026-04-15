function PropertyVideo({ video, videoUrl }) {
  const safeVideo = typeof video === "string" && video.trim() ? video.trim() : null;
  const safeVideoUrl =
    typeof videoUrl === "string" && videoUrl.trim() ? videoUrl.trim() : null;

  const getEmbedVideoUrl = (url) => {
    if (!url || typeof url !== "string") return null;

    try {
      // ✅ YouTube short link
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      // ✅ YouTube watch
      if (url.includes("youtube.com/watch")) {
        const parsed = new URL(url);
        const videoId = parsed.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      // ✅ YouTube shorts
      if (url.includes("youtube.com/shorts/")) {
        const videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      // ✅ YouTube embed
      if (url.includes("youtube.com/embed/")) {
        return url;
      }

      // ✅ Google Drive: /file/d/FILE_ID/view
      if (url.includes("drive.google.com/file/d/")) {
        const match = url.match(/\/file\/d\/([^/]+)/);
        const fileId = match?.[1];
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
      }

      // ✅ Google Drive: open?id=FILE_ID
      if (url.includes("drive.google.com/open")) {
        const parsed = new URL(url);
        const fileId = parsed.searchParams.get("id");
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
      }

      // ✅ Google Drive ya en preview
      if (url.includes("drive.google.com/file/d/") && url.includes("/preview")) {
        return url;
      }

      return null;
    } catch (error) {
      console.error("URL de video inválida:", error);
      return null;
    }
  };

  const embedVideoUrl = getEmbedVideoUrl(safeVideoUrl);

  if (!safeVideo && !safeVideoUrl) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Video</h2>

      <div className="space-y-6">
        {safeVideo && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Video subido
            </p>

            <div
              className="relative w-full overflow-hidden rounded-xl bg-black"
              style={{ paddingTop: "56.25%" }}
            >
              <video
                controls
                className="absolute top-0 left-0 w-full h-full"
                preload="metadata"
              >
                <source src={safeVideo} />
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          </div>
        )}

        {safeVideoUrl && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Video externo
            </p>

            <a
              href={safeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D7754] font-semibold break-all hover:underline"
            >
              {safeVideoUrl}
            </a>

            {embedVideoUrl ? (
              <div className="aspect-video w-full mt-4">
                <iframe
                  src={embedVideoUrl}
                  title="Vista previa del video"
                  className="w-full h-full rounded-xl border border-gray-200"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-3">
                No se pudo generar vista previa, pero el enlace sigue disponible.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyVideo;