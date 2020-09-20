const request = require("request");

const fetchMyIP = (callback) => {
  // use request to fetch IP from JSON API
  request("https://api.ipify.org?format=json", (err, res, body) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (res.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

const fetchCoordsByIP = (ip, callback) => {
  request(`https://ipvigilante.com/${ip}`, (error, res, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (res.statusCode !== 200) {
      callback(
        Error(
          `Status Code ${res.statusCode} when fetching Coordinates for IP: ${body}`
        ),
        null
      );
      return;
    }

    const { latitude, longitude } = JSON.parse(body).data;

    callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = (coors, callback) => {
  const lon = coors.longitude;
  const lat = coors.latitude;

  request(
    `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}`,
    (err, res, body) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (res.statusCode !== 200) {
        callback(
          Error(
            `Status Code ${res.statusCode} when fetching pass times: ${body}`
          ),
          null
        );
        return;
      }
      const passes = JSON.parse(body).response;
      callback(null, passes);
    }
  );
};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {
  nextISSTimesForMyLocation,
};
