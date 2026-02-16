
// 地図作成
const map = L.map('map').setView([40.2, 140.4], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

// 列車アイコン（通常）
const trainIcon = L.divIcon({
  html: "🚃",
  className: "",
  iconSize: [20, 20]
});

// 停車中アイコン（大きめ）
const stopIcon = L.divIcon({
  html: "🚃",
  className: "",
  iconSize: [32, 32]
});

// 時刻を分に変換
function toMinutes(time) {
  const parts = time.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// 現在位置計算
function getCurrentPosition(schedule) {

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

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

// ★ これが drawTrains 関数です
function drawTrains() {

  const infoBox = document.getElementById("info");
  infoBox.innerHTML = "";

  trains.forEach(train => {

    const pos = getCurrentPosition(train.schedule);

    if (pos) {

      const icon = pos.status === "stop" ? stopIcon : trainIcon;

      L.marker([pos.lat, pos.lng], { icon: icon })
        .addTo(map)
        .bindPopup(train.id);

      if (pos.status === "stop") {
        infoBox.innerHTML += `${train.id}：${pos.station} 停車中<br>`;
      } else {
        infoBox.innerHTML += `${train.id}：${pos.station} 行き<br>`;
      }
    }
  });
}

// 初回実行
drawTrains();

let trainMarkers = [];

function drawTrains() {

  // 既存マーカー削除
  trainMarkers.forEach(marker => map.removeLayer(marker));
  trainMarkers = [];

  const infoBox = document.getElementById("info");
  infoBox.innerHTML = "";

  trains.forEach(train => {

    const pos = getCurrentPosition(train.schedule);

    if (pos) {

      const icon = pos.status === "stop" ? stopIcon : trainIcon;

      const marker = L.marker([pos.lat, pos.lng], { icon: icon })
        .addTo(map)
        .bindPopup(train.id);

      trainMarkers.push(marker);

      if (pos.status === "stop") {
        infoBox.innerHTML += `${train.id}：${pos.station} 停車中<br>`;
      } else {
        infoBox.innerHTML += `${train.id}：${pos.station} 行き<br>`;
      }
    }
  });
}

// 初回実行
drawTrains();

// 10秒ごと更新（リアルタイム風）
setInterval(drawTrains, 10000);

L.circleMarker([40.8222, 140.7474], {
  radius: 8
}).addTo(map);

