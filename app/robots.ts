import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/editor', '/api/'],
      },
    ],
    sitemap: 'https://124.220.83.152/sitemap.xml',
  };
}
