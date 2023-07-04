import "./App.css";
import { useState } from "react";
import axios from "axios";
import jwtdecodeder from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { username, password });
      setUser(res.data);
    } catch (err) {
      setError(true);
      console.log(err);
    }
  };

  const axiosJWT=axios.create();

  const handleDelete = async (id) => {
    try {
      await axiosJWT.delete("/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
      console.log(err);
    }
  };

  const handleRefreshToken = async (req, res) => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshtoken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshtoken: res.data.refreshtoken,
      });
      return res.data;
    } catch (err) {
      
      console.log(err);
    }
  };

  

  axiosJWT.interceptors.request.use(
    // do something
    async (config) => {
      let currentDate = new Date();

     const decodedToken=jwtdecodeder(user.accessToken);
     if(decodedToken.exp*1000<currentDate.getTime())
     {
      const data=await handleRefreshToken();
      config.headers["authorization"]="Bearer "+data.accessToken;
     }
     return config;
    },
    (error)=>{
      return Promise.reject(error);
    }
  );

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete Saurabh
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Jane
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle"> Login</span>
            <input
              type="text"
              id="username"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required="true"
            />
            <input
              type="password"
              placeholder="Password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required="true"
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
