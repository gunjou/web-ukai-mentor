export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Browser tidak mendukung fitur lokasi."));

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = "Gagal mendapatkan lokasi.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Izin lokasi ditolak.";
            break;

          case error.POSITION_UNAVAILABLE:
            message = "Lokasi tidak tersedia.";
            break;

          case error.TIMEOUT:
            message = "Waktu pengambilan lokasi habis.";
            break;

          default:
            break;
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
