import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, keywords, image, url }) => {
  const defaults = {
    title: "Hexode - Collaborative Cloud IDE",
    description:
      "Collaborate in real-time with a powerful cloud-based IDE. Polyglot support, instant execution, and seamless teamwork.",
    image: "/logo.png",
    url: "https://hexode.vercel.app/",
    type: "website",
  };

  const meta = {
    title: title ? `${title} | Hexode` : defaults.title,
    description: description || defaults.description,
    image: image || defaults.image,
    url: url || defaults.url,
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={meta.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={defaults.type} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={meta.url} />
      <meta property="twitter:title" content={meta.title} />
      <meta property="twitter:description" content={meta.description} />
      <meta property="twitter:image" content={meta.image} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
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
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
