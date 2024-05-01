const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");

// Assuming you have a config.js or some similar file that exports your configurations
const { 
  SERVER_ROOT_URI, 
  GOOGLE_CLIENT_ID, 
  JWT_SECRET, 
  GOOGLE_CLIENT_SECRET, 
  COOKIE_NAME, 
  UI_ROOT_URI 
} = require("./config");

const port = 4000;
const app = express();

app.use(
  cors({
    origin: UI_ROOT_URI,
    credentials: true,
  })
);

app.use(cookieParser());

const redirectURI = "auth/google";

function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${SERVER_ROOT_URI}/${redirectURI}`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  return `${rootUrl}?${querystring.stringify(options)}`;
}

app.get("/auth/google/url", (req, res) => {
  return res.send(getGoogleAuthURL());
});

function getTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
}) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  return axios
    .post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch auth tokens`);
      throw new Error(error.message);
    });
}

app.get(`/${redirectURI}`, async (req, res) => {
  const code = req.query.code;

  const { id_token, access_token } = await getTokens({
    code,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: `${SERVER_ROOT_URI}/${redirectURI}`,
  });

  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });

  const token = jwt.sign(googleUser, JWT_SECRET);

  res.cookie(COOKIE_NAME, token, {
    maxAge: 900000,
    httpOnly: true,
    secure: false,  // Note: Set to true if using HTTPS
  });

  res.redirect(UI_ROOT_URI);
});

app.get("/auth/me", (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies[COOKIE_NAME], JWT_SECRET);
    return res.send(decoded);
  } catch (err) {
    console.log(err);
    res.send(null);
  }
});

function main() {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

main();
