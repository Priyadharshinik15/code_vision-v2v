document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([20.5937, 78.9629], 5); // India default view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const categoryColors = {
    harassment: '#f0888e',
    stalking: '#8b7bd8',
    unsafe_area: '#e7b96b',
    theft: '#6bb0e7',
    assault: '#d9534f',
    other: '#a78bfa',
  };

  let markers = [];
  let centered = false;

  async function loadIncidents() {
    const res = await fetch('/api/incidents');
    const data = await res.json();

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.incidents.forEach(inc => {
      const marker = L.circleMarker([inc.latitude, inc.longitude], {
        radius: 8,
        color: categoryColors[inc.category] || '#a78bfa',
        fillColor: categoryColors[inc.category] || '#a78bfa',
        fillOpacity: 0.75,
        weight: 1,
      }).addTo(map);
      marker.bindPopup(`<strong>${inc.category.replace('_', ' ')}</strong><br>${new Date(inc.created_at).toLocaleString()}`);
      markers.push(marker);
    });

    if (!centered && data.incidents.length > 0) {
      map.setView([data.incidents[0].latitude, data.incidents[0].longitude], 12);
      centered = true;
    }
  }

  async function loadSummary() {
    const res = await fetch('/api/incidents/summary');
    const data = await res.json();
    const labels = Object.keys(data);
    const values = Object.values(data);

    const ctx = document.getElementById('categoryChart');
    if (window._categoryChartInstance) window._categoryChartInstance.destroy();
    window._categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No reports yet'],
        datasets: [{
          data: values.length ? values : [1],
          backgroundColor: labels.length
            ? labels.map(l => categoryColors[l] || '#a78bfa')
            : ['#e6ddf8'],
        }],
      },
      options: { plugins: { legend: { position: 'bottom' } } },
    });
  }

  loadIncidents();
  loadSummary();
  setInterval(loadIncidents, 5000);

  // Center on the user's own location if they allow it and there's nothing else yet.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      if (!centered) {
        map.setView([pos.coords.latitude, pos.coords.longitude], 13);
        L.marker([pos.coords.latitude, pos.coords.longitude])
          .addTo(map)
          .bindPopup('You are here')
          .openPopup();
      }
    });
  }
});
