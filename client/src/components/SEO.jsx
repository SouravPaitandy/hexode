import React from "react";
import { Helmet } from "react-helmet-async";

const BASE_URL = "https://hexode.vercel.app";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  noindex,
  schemaType,
}) => {
  const defaults = {
    title: "Hexode - Collaborative Cloud IDE",
    description:
      "Collaborate in real-time with a powerful cloud-based IDE. Polyglot support, instant execution, and seamless teamwork.",
    // Absolute URL — required by all social crawlers (Twitter, Discord, Facebook, WhatsApp)
    image: `${BASE_URL}/og-image.png`,
    url: `${BASE_URL}/`,
    type: "website",
  };

  const meta = {
    title: title ? `${title} | Hexode` : defaults.title,
    description: description || defaults.description,
    // Always resolve to absolute URL
    image: image
      ? image.startsWith("http")
        ? image
        : `${BASE_URL}${image}`
      : defaults.image,
    url: url
      ? url.startsWith("http")
        ? url
        : `${BASE_URL}${url}`
      : defaults.url,
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={meta.url} />
      {/* Prevent indexing of pages that pass noindex=true (e.g. /editor/:roomId) */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={defaults.type} />
      <meta property="og:site_name" content="Hexode" />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Hexode - Collaborative Cloud IDE"
      />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={meta.url} />
      <meta property="twitter:title" content={meta.title} />
      <meta property="twitter:description" content={meta.description} />
      <meta property="twitter:image" content={meta.image} />
      <meta name="twitter:creator" content="@PaitandySourav" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": schemaType || "SoftwareApplication",
          name: "Hexode",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          description: meta.description,
          url: meta.url,
          image: meta.image,
          author: {
            "@type": "Person",
            name: "Sourav Paitandy",
            url: "https://github.com/SouravPaitandy",
            sameAs: [
              "https://souravpaitandy.me",
              "https://linkedin.com/in/sourav-paitandy",
              "https://x.com/PaitandySourav",
            ],
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
