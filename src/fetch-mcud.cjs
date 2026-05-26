const https = require("https");
https.get("https://mcud.gov.mn/", (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while(match = regex.exec(body)) {
      console.log(match[1]);
    }
  });
});
