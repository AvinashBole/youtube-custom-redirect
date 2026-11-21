const form = document.getElementById('settings');
const urlInput = document.getElementById('url');
const enabledInput = document.getElementById('enabled');
const status = document.getElementById('status');
chrome.storage.sync.get({redirectTemplate: '', enabled: true}).then(settings => {
  urlInput.value = settings.redirectTemplate;
  enabledInput.checked = settings.enabled;
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const url = new URL(urlInput.value);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS URL.');
    await chrome.storage.sync.set({redirectTemplate: urlInput.value, enabled: enabledInput.checked});
    status.textContent = 'Saved! Reload any already-open YouTube tabs to apply immediately.';
  } catch (error) { status.textContent = error.message; }
});
