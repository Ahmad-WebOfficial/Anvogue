"use client";

import { useLandingPage } from "@/hooks/useLandingPage";
import { getYoutubeEmbedUrl } from "@/lib/tenant-landing";

const LandingYoutube = () => {
  const landing = useLandingPage();
  const embedUrl = getYoutubeEmbedUrl(landing?.YoutubeEmbededLink ?? "");

  if (!embedUrl) {
    return null;
  }

  return (
    <section className="landing-youtube container md:py-16 py-10">
      <div className="aspect-video w-full overflow-hidden rounded-2xl">
        <iframe
          src={embedUrl}
          title="YouTube video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  );
};

export default LandingYoutube;
