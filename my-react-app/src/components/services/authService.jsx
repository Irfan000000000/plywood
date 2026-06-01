import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL+'/';

const register = (username, password, userType, campus) => {
  return axios.post(API_URL + 'register', { username, password, userType, campus });
};

const login = (username, password) => {
  return axios
    .post(API_URL + "api/login", { username, password })
    .then((response) => {
      if (response.data.token) {
        // console.log(response);
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem(
          "user_id",
          JSON.stringify(response.data.user.user_id)
        );
        localStorage.setItem(
          "campus_id",
          JSON.stringify(response.data.user.campus_id)
        );
        localStorage.setItem(
          "campus_name",
          JSON.stringify(response.data.user.campus_name)
        );
        localStorage.setItem(
          "campus_code",
          JSON.stringify(response.data.user.campus_code)
        );
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('user_id');
  localStorage.removeItem('username');
  localStorage.removeItem('campus_id');
  localStorage.removeItem('campus_name');

};

export default {
  register,
  login,
  logout
};
