(() => {
  let template = "";
  let enabled = true;
  let navigating = false;

  const readSettings = () => chrome.storage.sync.get({
    redirectTemplate: "",
    enabled: true
  }).then(data => {
    template = data.redirectTemplate;
    enabled = data.enabled;
    redirectCurrentVideo();
  });

  function getVideoId(rawUrl) {
    try {
      const url = new URL(rawUrl, location.href);
      if (!['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(url.hostname)) return null;
      if (url.pathname === '/watch') return url.searchParams.get('v');
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null;
      if (url.pathname.startsWith('/live/')) return url.pathname.split('/')[2] || null;
    } catch (_) {}
    return null;
  }

  function targetFor(videoId) {
    if (!enabled || !template || !videoId) return null;
    try {
      const result = template.replaceAll('{videoId}', encodeURIComponent(videoId));
      const url = new URL(result);
      if (!['https:', 'http:'].includes(url.protocol)) return null;
      return url.href;
    } catch (_) { return null; }
  }

  function redirectTo(target) {
    if (!target || navigating) return;
    navigating = true;
    location.replace(target);
  }

  function redirectCurrentVideo() {
    redirectTo(targetFor(getVideoId(location.href)));
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0) return;
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const target = targetFor(getVideoId(link.href));
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.metaKey || event.ctrlKey) {
      window.open(target, '_blank', 'noopener');
    } else {
      redirectTo(target);
    }
  }, true);

  // YouTube navigates without full page reloads; catch those transitions too.
  window.addEventListener('yt-navigate-finish', redirectCurrentVideo, true);
  window.addEventListener('popstate', () => setTimeout(redirectCurrentVideo, 0), true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.redirectTemplate) template = changes.redirectTemplate.newValue || '';
    if (changes.enabled) enabled = changes.enabled.newValue !== false;
    redirectCurrentVideo();
  });

  readSettings();
})();
