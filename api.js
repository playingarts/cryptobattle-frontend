import axios from "axios";

const client = axios.create({
  baseURL: `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/`,
});

const request = function (options) {
  const onSuccess = function (response) {
    // console.log(response, "response");
    console.debug("Request Successful!", response);

    const ONE_HOUR = 60 * 60 * 1000; /* ms */

    const refreshToken = localStorage.getItem("refreshToken");
    const accessTokenExpire = localStorage.getItem("accessTokenExpire");
    const expire = new Date(accessTokenExpire * 1000);
    if (refreshToken && expire - new Date() < ONE_HOUR) {
      api
        .get(`/api/rest/refresh-token?refreshtoken=${refreshToken}`)
        .then((data) => {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("accessTokenExpire", data.accessTokenExpire);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    return response.data;
  };

  const onError = function (error) {
    console.error("Request Failed:", error.config);

    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
      console.error("Status:", error.response.status);
      if (error.response.status == 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("signature");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessTokenExpire");
        setTimeout(() => {
          console.log("Session Expired. Logging out.");
          window.location.href = "/";
        }, 0);
      }
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else {
      // Something else happened while setting up the request
      // triggered the error
      console.error("Error Message:", error.message);
    }

    return Promise.reject(error.response || error.message);
  };

  return client(options).then(onSuccess).catch(onError);
};

function get(url, params) {
  return request({
    url: url,
    method: "GET",
    headers: {
      accesstoken: localStorage.getItem("accessToken"),
      "content-type": "application/json",
    },
    params
  });
}

const api = {
  get,
};

export { api };
