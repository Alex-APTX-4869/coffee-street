// The downloaded single file also works without an origin or an update service.
(() => {
  if (!/^https?:$/.test(location.protocol)) return;
  const build = document.querySelector('meta[name="coffee-build"]').content;
  const parameter = 'build';
  let checking = false;
  let navigating = false;

  async function check() {
    if (checking || navigating || document.hidden) return;
    checking = true;
    try {
      const manifest = new URL('version.json', location.href);
      manifest.searchParams.set('check', Date.now().toString(36));
      const response = await fetch(manifest, {cache: 'no-store'});
      if (!response.ok) return;
      const {build: latest} = await response.json();
      if (typeof latest !== 'string' || !/^[0-9a-f]{16}$/.test(latest) || document.hidden) return;
      const url = new URL(location.href);
      const requested = url.searchParams.get(parameter);
      if (latest !== build) {
        // A deployment can briefly serve different revisions from two edge caches.
        if (requested === latest) return;
        url.searchParams.set(parameter, latest);
        navigating = true;
        location.replace(url.href);
      } else if (requested === build) {
        // Refresh the unversioned HTTP cache entry too, including for phones that cached an older entry page.
        url.searchParams.delete(parameter);
        const entry = await fetch(url, {cache: 'reload'});
        if (!entry.ok) return;
        const html = await entry.text();
        if (html.includes('<meta name="coffee-build" content="' + build + '">')) {
          history.replaceState(history.state, '', url.href);
        }
      }
    } catch {
      // A failed update check leaves the already-loaded café usable.
    } finally {
      checking = false;
    }
  }

  window.addEventListener('pageshow', check);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
