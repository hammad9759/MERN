const express = require('express');
const dbConnect = require('./database/index');
const { PORT } = require('./config/index');
const router = require('./router/index');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require("cors");

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000"],
};

const app = express();

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));



dbConnect();

app.use(router); 

app.use(express.json());
app.use(cookieParser());


app.use('/storage', express.static('storage')); 

app.use(errorHandler); 


app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});

// 4:52