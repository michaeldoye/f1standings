# Offline Support

This application uses Angular Service Worker to provide offline functionality and improve performance through intelligent caching.

## How It Works

### Asset Caching

The service worker automatically caches all application assets:

1. **App Shell** (prefetch):
   - HTML files (index.html, index.csr.html)
   - CSS and JavaScript bundles
   - favicon and manifest
   - Cached immediately on installation

2. **Static Assets** (lazy):
   - Images, fonts, and icons
   - Cached on first request
   - Updated when app updates

### API Caching Strategy

The app uses a dual-strategy approach for API calls:

#### Jolpica F1 API (Ergast)
- **Primary Strategy**: Freshness (network-first with 10s timeout)
  - Tries to fetch fresh data from the network
  - Falls back to cache if network fails or times out
  - Cache expires after 1 hour
  - Max 100 cached responses

- **Fallback Strategy**: Performance (cache-first)
  - Long-term cache (7 days) for when network is unavailable
  - Serves stale data when fresh data cannot be retrieved

#### OpenF1 API
- **Primary Strategy**: Freshness (network-first with 10s timeout)
  - Tries to fetch fresh data from the network
  - Falls back to cache if network fails or times out
  - Cache expires after 1 hour
  - Max 50 cached responses

- **Fallback Strategy**: Performance (cache-first)
  - Long-term cache (7 days) for when network is unavailable
  - Serves stale data when fresh data cannot be retrieved

## User Experience

### Online
- Fresh data is fetched from APIs
- Updates happen in the background
- Responses are cached for offline use

### Offline
- App shell loads instantly from cache
- Previously viewed data displays immediately
- Cached API responses serve standings and race data
- User sees data that's up to 7 days old

### Network Issues
- 10-second timeout prevents long waits
- Automatically falls back to cached data
- Seamless transition between online/offline states

## Cache Management

### Automatic Updates
- Service worker checks for updates when app is stable (after 30 seconds)
- New versions prompt user to refresh
- Cache is automatically cleaned when full

### Manual Cache Clear
Users can clear the cache by:
1. Going to browser settings
2. Clearing site data for the application
3. Refreshing the page

## Development

### Testing Offline Mode

In development, the service worker is disabled. To test offline functionality:

1. Build for production:
   ```bash
   npm run build
   ```

2. Serve the production build:
   ```bash
   npx http-server -p 4200 -c-1 dist/f1standings/browser
   ```

3. Open the app in your browser
4. Open DevTools > Application > Service Workers
5. Check "Offline" to simulate offline mode
6. Refresh the page to see offline functionality

### Debugging

View service worker status and cached data:
1. Open Chrome DevTools
2. Go to Application tab
3. Check:
   - Service Workers section for registration status
   - Cache Storage for cached assets and API responses
   - Network tab (offline mode) to verify cache usage

## Configuration

Service worker configuration is in `ngsw-config.json`:

```json
{
  "dataGroups": [
    {
      "name": "api-jolpica",
      "urls": ["https://api.jolpi.ca/ergast/f1/**"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s",
        "strategy": "freshness"
      }
    }
  ]
}
```

### Cache Strategies

- **freshness**: Network-first with cache fallback (best for frequently updated data)
- **performance**: Cache-first with network update (best for static or rarely changing data)

### Cache Configuration Options

- `maxSize`: Maximum number of cached responses
- `maxAge`: How long cached data is considered valid (e.g., "1h", "7d", "30m")
- `timeout`: Network request timeout before falling back to cache
- `strategy`: Caching strategy (freshness or performance)

## Deployment

The service worker is automatically included in production builds when deploying via:

```bash
npm run build
npm run deploy
```

The service worker will be registered and activated when users visit the deployed application.
