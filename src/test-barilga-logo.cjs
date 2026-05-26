const https = require("https");
const url = "https://barilgaexpo.mn/wp-content/uploads/2024/06/Barilga.mn-shuud-ashiglah-logo-Copy-Copy-2-1.png";
https.get(url, res => {
  console.log(res.statusCode);
});
