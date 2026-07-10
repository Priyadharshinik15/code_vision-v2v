document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sosBtn = document.getElementById('sosBtn');
  const sosStatus = document.getElementById('sosStatus');
  const safeBtn = document.getElementById('safeBtn');
  const signalBanner = document.getElementById('signalBanner');
  const signalText = document.getElementById('signalText');

  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  if (sosBtn) {
    sosBtn.addEventListener('click', async () => {
      if (sosBtn.classList.contains('active')) return;
      sosBtn.disabled = true;
      sosStatus.textContent = 'Getting your location…';
      try {
        const { lat, lng } = await getLocation();
        const res = await fetch('/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
        const data = await res.json();
        if (data.ok) {
          sosBtn.classList.add('active');
          sosBtn.textContent = 'ACTIVE';
          sosStatus.innerHTML = data.notified.length
            ? `<span class="status-pill active">Notified: ${data.notified.join(', ')}</span>`
            : `<span class="status-pill open">${data.message}</span>`;
          setTimeout(() => window.location.reload(), 1200);
        } else {
          sosStatus.textContent = data.error || 'Something went wrong.';
        }
      } catch (e) {
        sosStatus.textContent = 'Could not get your location — please allow location access and try again.';
      } finally {
        sosBtn.disabled = false;
      }
    });
  }

  if (safeBtn) {
    safeBtn.addEventListener('click', async () => {
      const alertId = safeBtn.dataset.alertId;
      safeBtn.disabled = true;
      await fetch(`/api/sos/${alertId}/resolve`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken } });
      window.location.reload();
    });
  }

  // Live Safety Signal — poll every 8s
  async function pollSignal() {
    try {
      const { lat, lng } = await getLocation();
      const res = await fetch(`/api/danger-alerts/nearby?latitude=${lat}&longitude=${lng}`);
      const data = await res.json();
      if (data.alerts && data.alerts.length > 0) {
        signalBanner.classList.add('show');
        signalText.textContent = `${data.alerts.length} safety signal(s) within ${data.radius_km} km — stay alert.`;
      } else {
        signalBanner.classList.remove('show');
      }
    } catch (e) {
      // Silently skip a cycle if location isn't available yet.
    }
  }

  pollSignal();
  setInterval(pollSignal, 8000);
});
