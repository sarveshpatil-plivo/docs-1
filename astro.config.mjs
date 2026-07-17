// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://cheshire-cat-ai.github.io',
  base: '/docs/',
  integrations: [
    // astro-mermaid must come before Starlight so its markdown plugins run.
    mermaid({ theme: 'default', autoTheme: true }),
    starlight({
      title: 'Cheshire Cat AI docs',
      logo: {
        src: './src/assets/cheshire-cat-logo.svg',
        alt: 'Cheshire Cat AI',
      },
      favicon: '/favicon.ico',
      customCss: ['./src/styles/custom.css'],
      components: {
        // Inject the version switcher above the default sidebar.
        Sidebar: './src/components/Sidebar.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/cheshire-cat-ai/core' },
      ],
      editLink: {
        baseUrl: 'https://github.com/cheshire-cat-ai/docs/edit/main/',
      },
      sidebar: [
        {
          label: 'Quickstart',
          items: [
            { label: 'Install', slug: 'quickstart/installation-configuration' },
            { label: 'Message the Cat', slug: 'quickstart/message' },
            { label: 'Plugin Tutorial', slug: 'quickstart/prepare-plugin' },
          ],
        },
        {
          label: 'Plugins',
          items: [
            { label: 'Main concepts', slug: 'plugins/concepts' },
            { label: 'Install a Plugin', slug: 'quickstart/installing-plugin' },
            { label: 'How to Write a Plugin', slug: 'plugins/plugins' },
            { label: 'Write an Agent', slug: 'plugins/agents' },
            { label: 'Tools', slug: 'plugins/tools' },
            { label: 'Directives', slug: 'plugins/directives' },
            { label: 'Hooks', slug: 'plugins/hooks' },
            { label: 'Endpoints', slug: 'plugins/endpoints' },
            { label: 'Persistence', slug: 'plugins/persistence' },
            { label: 'Settings', slug: 'plugins/settings' },
            { label: 'Logging', slug: 'plugins/logging' },
            { label: 'Dependencies', slug: 'plugins/dependencies' },
            {
              label: 'Registry',
              items: [
                { label: 'Using the Plugin Template', slug: 'plugins/plugins-registry/plugin-from-template' },
                { label: 'Publishing a Plugin', slug: 'plugins/plugins-registry/publishing-plugin' },
              ],
            },
          ],
        },
        {
          label: 'Auth',
          items: [
            { label: 'Authentication', slug: 'production/auth/authentication' },
            { label: 'Authorization', slug: 'production/auth/authorization' },
            { label: 'User Management', slug: 'production/auth/user-management' },
            { label: 'Custom Auth', slug: 'production/auth/custom-auth' },
          ],
        },
        {
          label: 'Deploy',
          items: [
            { label: 'Make the Cat Private', slug: 'production/administrators/make_the_cat_private' },
            { label: 'Configuration', slug: 'production/administrators/env-variables' },
            { label: 'Automatic Tests', slug: 'production/administrators/tests' },
            { label: 'Backups and Updates', slug: 'production/administrators/backups-updates' },
          ],
        },
        {
          label: 'FAQ',
          items: [
            { label: 'General', slug: 'faq/general' },
            { label: 'Basic Info', slug: 'faq/basic_info' },
            { label: 'Errors', slug: 'faq/errors' },
            { label: 'Customization', slug: 'faq/customization' },
            { label: 'Security & Spending', slug: 'faq/security_and_spending' },
          ],
        },
      ],
    }),
  ],
});
