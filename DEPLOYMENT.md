# GitHub Pages / Vercel Deployment Guide

This guide explains how to deploy a front-end application that uses this repository as a data source.

## Option 1: GitHub Pages (Static Site)

### Using Jekyll (No Build Step)

1. Enable GitHub Pages in repository settings
2. Create an `index.html` that fetches JSON from the repository
3. GitHub Pages will serve the HTML directly

### Using a Build Tool (React, Vue, Next.js, etc.)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./web
      
      - name: Build
        run: npm run build
        working-directory: ./web
        env:
          NODE_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./web/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Option 2: Vercel

### Method 1: Direct Vercel Deployment

1. Connect your repository to Vercel
2. Configure build settings:
   - Framework: Choose your framework (Next.js, React, etc.)
   - Build Command: `npm run build`
   - Output Directory: `dist` or `build`
   - Install Command: `npm install`

### Method 2: Vercel Configuration File

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "vite",
  "regions": ["iad1"]
}
```

## Example Front-End Projects

### React + Vite Example

```bash
# Create new React project
npm create vite@latest bel-lit-web -- --template react
cd bel-lit-web
npm install
```

`src/App.jsx`:
```jsx
import { useState, useEffect } from 'react';

const REPO_URL = 'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main';

function App() {
  const [authors, setAuthors] = useState([]);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [language]);

  async function loadContent() {
    setLoading(true);
    try {
      const indexRes = await fetch(`${REPO_URL}/metadata/index.json`);
      const index = await indexRes.json();
      
      const authorsData = await Promise.all(
        index.authors.map(async (authorData) => {
          const infoRes = await fetch(
            `${REPO_URL}/authors/${authorData.id}/info.json`
          );
          const info = await infoRes.json();
          
          const works = await Promise.all(
            authorData.works.map(async (work) => {
              const contentRes = await fetch(
                `${REPO_URL}/authors/${authorData.id}/works/${work.id}/content/${language}.json`
              ).catch(() => 
                fetch(`${REPO_URL}/authors/${authorData.id}/works/${work.id}/content/be.json`)
              );
              return await contentRes.json();
            })
          );
          
          return { ...info, works };
        })
      );
      
      setAuthors(authorsData);
    } catch (error) {
      console.error('Error loading content:', error);
    }
    setLoading(false);
  }

  return (
    <div className="app">
      <header>
        <h1>🇧🇾 Awesome Belarusian Literature</h1>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="be">🇧🇾 Belarusian</option>
          <option value="en">🇬🇧 English</option>
          <option value="ru">🇷🇺 Russian</option>
        </select>
      </header>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <main>
          {authors.map((author) => (
            <div key={author.id}>
              <h2>{author.names[language] || author.names.en}</h2>
              <p>{author.biography[language] || author.biography.en}</p>
              
              {author.works.map((work) => (
                <article key={work.work_id}>
                  <h3>{work.title}</h3>
                  {work.content.map((stanza, i) => (
                    <div key={i} className="stanza">
                      {stanza.lines.map((line, j) => (
                        <p key={j}>{line}</p>
                      ))}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          ))}
        </main>
      )}
    </div>
  );
}

export default App;
```

### Next.js Example

```bash
npx create-next-app@latest bel-lit-web
cd bel-lit-web
```

`app/page.js`:
```jsx
async function getContent() {
  const REPO_URL = 'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main';
  const indexRes = await fetch(`${REPO_URL}/metadata/index.json`);
  const index = await indexRes.json();
  return index;
}

export default async function Home() {
  const index = await getContent();
  
  return (
    <main>
      <h1>Belarusian Literature</h1>
      {/* Render content */}
    </main>
  );
}
```

## Caching Strategies

### Browser Caching

For static deployments, GitHub raw content is cached by browsers. Consider:

1. **Service Workers** for offline access
2. **Local Storage** for user preferences
3. **CDN** for faster global delivery

### Build-Time Generation

For better performance, fetch and build content at build time:

```javascript
// build-script.js
const fs = require('fs');
const path = require('path');

async function buildStaticData() {
  const response = await fetch(
    'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/metadata/index.json'
  );
  const data = await response.json();
  
  fs.writeFileSync(
    path.join(__dirname, 'src', 'data.json'),
    JSON.stringify(data, null, 2)
  );
}

buildStaticData();
```

Add to `package.json`:
```json
{
  "scripts": {
    "prebuild": "node build-script.js",
    "build": "vite build"
  }
}
```

## SEO Optimization

For better SEO, use Server-Side Rendering (SSR) or Static Site Generation (SSG):

### Next.js (SSG)

```jsx
export async function generateStaticParams() {
  const response = await fetch(
    'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/metadata/index.json'
  );
  const index = await response.json();
  
  return index.authors.flatMap(author =>
    author.works.map(work => ({
      authorId: author.id,
      workId: work.id,
    }))
  );
}
```

## Performance Tips

1. **Lazy Loading**: Load content on demand
2. **Code Splitting**: Split by author or language
3. **Image Optimization**: Use CDN for author images
4. **Compression**: Enable gzip/brotli compression
5. **Caching**: Use appropriate cache headers

## Analytics

Track usage with Google Analytics, Plausible, or similar:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## Error Handling

Always implement proper error handling:

```javascript
async function loadContent() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load content:', error);
    // Show user-friendly error message
    return null;
  }
}
```

## Testing

Test your deployment:

1. **Local Development**: Use `npm run dev`
2. **Preview Deployment**: Use Vercel preview deployments
3. **Performance**: Use Lighthouse
4. **Accessibility**: Use axe DevTools
5. **Cross-browser**: Test in Chrome, Firefox, Safari

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev/)
