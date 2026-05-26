const https = require("https");
['02-01.png', '02-02.png', '02-03.png'].forEach(file => {
  https.get(`https://barilgaexpo.mn/wp-content/uploads/2024/06/${file}`, res => {
    console.log(file, res.statusCode);
  });
});
