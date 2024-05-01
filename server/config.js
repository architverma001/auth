// Use dotenv package to load environment variables from .env file (if you're using it)
require('dotenv').config();

// Define your constants with fallbacks or direct assignments
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "982077881063-uoscl7enlo0742khrqvsnhtrjh7aoml4.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET 
const SERVER_ROOT_URI = "http://localhost:4000";
const UI_ROOT_URI = "http://localhost:3000";
const JWT_SECRET = "shhhhh";
const COOKIE_NAME = "auth_token";

// Export all constants using module.exports
module.exports = {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    SERVER_ROOT_URI,
    UI_ROOT_URI,
    JWT_SECRET,
    COOKIE_NAME
};
