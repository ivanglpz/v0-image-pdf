import Head from "next/head";
import { FC } from "react";

type Props = {
  title: string;
  description: string;
  image: string;
  content: string;
};

const SeoComponent: FC<Props> = (props) => {
  const { title, content, description, image } = props;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/x-icon" href={`/favicon.ico`} />
        <link rel="icon" href="/public/favicon.ico" type="image/x-icon" />

        <link rel="icon" sizes="16x16" href="/public/favicon-16x16.png" />
        <link rel="icon" sizes="32x32" href="/public/favicon-32x32.png" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/public/apple-touch-icon.png"
        />

        <link
          rel="icon"
          sizes="192x192"
          href="/public/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          sizes="512x512"
          href="/public/android-chrome-512x512.png"
        />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <meta name="theme-color" content="#18181C" />

        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=7" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content={description} />
        {/* <link rel="canonical" href={`${URL_PAGE_DOMAIN}${path}`} /> */}
        <meta name="keywords" content={content} />
        <meta name="google-site-verification" content="" />
        {/* Googlebot settings */}
        <meta name="googlebot" content="index,follow" />

        {/* Open Graph and Twitter meta tags for social sharing */}
        <meta property="og:locale" content="es_ES" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {/* <meta property="og:url" content={`${URL_PAGE_DOMAIN}${path}`} /> */}
        <meta property="og:site_name" content={title} />
        <meta property="og:image" content={image} />
        <meta property="og:image:secure_url" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />

        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:image" content={image} />

        {/* Schema.org for Google Rich Snippets */}
        <script type="application/ld+json">
          {`
          {
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "${title}",
            "url": "",
            "description": "${description}",
            "image": "${image}"
          }
        `}
        </script>
        {/* Add more Open Graph and Twitter meta tags if needed, e.g., for additional social sharing features. */}
      </Head>
    </>
  );
};

export default SeoComponent;
