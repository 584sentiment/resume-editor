import { MetadataRoute } from 'next';
import { templates } from '@/lib/templates/index';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-domain.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const templatePages: MetadataRoute.Sitemap = templates.map((template, index) => ({
    url: `${baseUrl}/editor?template=${index}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...templatePages];
}
