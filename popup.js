chrome.storage.sync.get({redirectTemplate: '', enabled: true}).then(data => {
  document.getElementById('status').textContent = !data.redirectTemplate ? 'No destination configured.' : data.enabled ? 'Redirects enabled.' : 'Redirects paused.';
});
document.getElementById('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
