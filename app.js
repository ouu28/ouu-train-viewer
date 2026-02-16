const map = L.map('map').setView([40.2, 140.4], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

function toMinutes(time) {
  const parts = time.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function getCurrentPosition(schedule) {

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < schedule.length - 1; i++) {

    const t1 = toMinutes(schedule[i].time);
    const t2 = toMinutes(schedule[i + 1].time);

    if (current >= t1 && current <= t2) {

      const ratio = (current - t1) / (t2 - t1);

      return {
        lat: schedule[i].lat + (schedule[i+1].lat - schedule[i].lat) * ratio,
        lng: schedule[i].lng + (schedule[i+1].lng - schedule[i].lng) * ratio
      };
    }
  }
  return null;
}

function drawTrains() {

  trains.forEach(train => {

    const pos = getCurrentPosition(train.schedule);

    if (pos) {
      L.marker([pos.lat, pos.lng])
        .addTo(map)
        .bindPopup(train.id);
    }

  });
}

drawTrains();
setInterval(() => location.reload(), 60000);

