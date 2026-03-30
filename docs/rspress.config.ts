import * as path from 'node:path';
import { defineConfig, type UserConfig } from '@rspress/core';
import { pluginPreview } from '@rspress/plugin-preview';

export default defineConfig({
  route: {
    cleanUrls: true,
  },
  ssg: false,
  locales: [
    {
      lang: 'zh',
      label: '简体中文',
      title: 'Rspress',
      description: '静态网站生成器',
    },
  ],
  lang: 'zh',
  base: process.env.NODE_ENV === 'production' ? '/fairys-mocker/' : '/',
  root: path.join(__dirname, 'docs'),
  title: 'Fairys Mocker',
  icon: '/logo.png',
  globalStyles: path.join(__dirname, 'styles/index.css'),
  logo: {
    light: '/logo.png',
    dark: '/logo.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/autumn-fairy-tales/fairys-mocker',
      },
    ],
  },
  plugins: [pluginPreview({ defaultRenderMode: 'pure' })],
} as unknown as UserConfig);
