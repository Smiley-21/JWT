const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

const users = [
  {
    id: "1",
    username: "Saurabh",
    password: "Saurabh1234",
    isAdmin: true,
  },
  {
    id: "2",
    username: "Jane",
    password: "Jane123",
    isAdmin: false,
  },
  {
    id:"3",
    username:"John",
    password:"John321",
    isAdmin:true,
  }
];

let refreshtokenarray=[];

app.post("/api/refresh", (req,res)=>{
  // take token from the user
  const refreshtoken=req.body.token;

  // send error if token is not valid 
  if(!refreshtoken)
  return res.status(401).json("User is not authenticated anymore");
  if(!refreshtokenarray.includes(refreshtoken))
  return res.status(403).json("Refresh Token is not valid after refreshing ")


  // everything fine then create a new token called as refresh token 
  // give it to user

  jwt.verify(refreshtoken,"MyRefreshedSecretKey",(err,user)=>{
    try{
      refreshtokenarray=refreshtokenarray.filter( (token)=>token!==refreshtoken);      
      const newAccessToken=generateAccessToken(user);
      const newRefreshAccessToken=generateRefreshAccessToken(user);

      refreshtokenarray.push(newRefreshAccessToken);

      res.status(200).json({
        accessToken:newAccessToken,
        refreshtoken:newRefreshAccessToken

      });
    }catch(err)
    {
      res.status(500).json("Error is found in refreshing token");
    }
  });
});


const generateAccessToken=(user)=>{
  const token=jwt.sign({
    id:user.id,
    isAdmin:user.isAdmin,
  },
  "MySecretKey",{expiresIn:"5s"}
  );

  return token;
}

const generateRefreshAccessToken=(user)=>{
  const token=jwt.sign({
    id:user.id,
    isAdmin:user.isAdmin,
  },
  "MyRefreshedSecretKey",{expiresIn:"20m"});

  return token;
}


app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => {
    return u.username == username && u.password == password;
  });

  if (user) {
    // res.json(user);

    //Generate Access token
   const accessToken= generateAccessToken(user);
   const RefreshAccessToken= generateRefreshAccessToken(user);
   refreshtokenarray.push(RefreshAccessToken)

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      password: user.password,
      accessToken,
      RefreshAccessToken,
    });
  } else {
    res.status(400).json("Username or Password is incorrect");
  }
});

const verify = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      
      jwt.verify(token, "MySecretKey", (err, user) => {
        if (err) {
          
          return res.status(403).json("Token is not valid");
        } else {
          req.user = user; // assigning the saved user as current user
          next();
        }
      });
    } else {
      res.status(401).json("You are not authenticated!!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Error in the verification");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id == req.params.userId || req.user.isAdmin) {
    res.status(200).json("You are authencticed and user has been deleted");
  } else {
    res.status(403).json("You are not a valid user");
  }
});


app.post("/api/logout", verify,(req,res)=>{
  const refreshToken=req.body.token;
  refreshtokenarray=refreshtokenarray.filter((token)=>token!==refreshToken);
  res.status(200).json("You are successfully Logged Out !!!")
})

app.listen(5000, () => console.log("Backend Server Started Successfully"));
