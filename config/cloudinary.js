// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// const cloudinary = require("cloudinary").v2;
// const https = require("https");
// const tls = require("tls");

// // Use system CA certificates for Cloudinary requests
// const agent = new https.Agent({
//   ca: tls.rootCertificates,
// });

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
//   agent: agent, // ← this fixes the SSL error
// });

// module.exports = cloudinary;
