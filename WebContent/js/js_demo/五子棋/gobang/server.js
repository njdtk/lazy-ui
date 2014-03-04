HOST = '0.0.0.0'; // localhost
PORT = 80;

var fu = require("./fu"),
    sys = require("util"),
    url = require("url"),
    qs = require("querystring");

fu.listen(Number(process.env.PORT || PORT), HOST);

fu.get("/", fu.staticHandler("index.html"));
fu.get("/dev", fu.staticHandler("dev.html"));
fu.get("/style.css", fu.staticHandler("style.css"));
fu.get("/client.js", fu.staticHandler("client.js"));
fu.get("/jquery-1.7.1.min.js", fu.staticHandler("jquery-1.7.1.min.js"));
fu.get("/Maple.js/lib/bison.js", fu.staticHandler("Maple.js/lib/bison.js"));
fu.get("/Maple.js/lib/Class.js", fu.staticHandler("Maple.js/lib/Class.js"));
fu.get("/Maple.js/lib/Twist.js", fu.staticHandler("Maple.js/lib/Twist.js"));
fu.get("/Maple.js/Maple.js", fu.staticHandler("Maple.js/Maple.js"));
fu.get("/Maple.js/Client.js", fu.staticHandler("Maple.js/Client.js"));

