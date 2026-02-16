const map = L.map('map').setView([40.2, 140.4], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

function getCurrentPosition(schedule) {

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  function toMinutes(time) {
    const parts = time.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  for (let i = 0; i < schedule.length; i++) {

    const station = schedule[i];

    // 停車中判定
    if (station.arr) {
      const arrTime = toMinutes(station.arr);
      const depTime = station.dep ? toMinutes(station.dep) : arrTime;

      if (current >= arrTime && current <= depTime) {
        return {
          lat: station.lat,
          lng: station.lng,
          status: "stop",
          station: station.name
        };
      }
    }

    // 駅間移動
    if (i < schedule.length - 1) {

      const currentDep = schedule[i].dep
        ? toMinutes(schedule[i].dep)
        : toMinutes(schedule[i].arr);

      const nextArr = toMinutes(schedule[i + 1].arr);

      if (current >= currentDep && current <= nextArr) {

        const ratio = (current - currentDep) / (nextArr - currentDep);

        return {
          lat: schedule[i].lat +
               (schedule[i + 1].lat - schedule[i].lat) * ratio,
          lng: schedule[i].lng +
               (schedule[i + 1].lng - schedule[i].lng) * ratio,
          status: "move",
          station: schedule[i + 1].name
        };
      }
    }
  }

  return null;
}
