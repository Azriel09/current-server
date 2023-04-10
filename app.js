const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const dbConnect = require("./db/dbConnect");
const News = require("./db/newsModel");
const Symbols = require("./db/countrySymbols");
const User = require("./db/userModel");
const auth = require("./auth");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const db = dbConnect();
const mail_user = require("./db/userConfig");
const cors = require("cors");


const allowedOrigins = ['https://azriel--endearing-faun-3002c7.netlify.app'];
app.use(cors({
	  origin: function(origin, callback){
		      if(!origin) return callback(null, true);
		      if(allowedOrigins.indexOf(origin) === -1){
			            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
			            return callback(new Error(msg), false);
			          }
		      return callback(null, true);
		    }

}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://main--melodic-cheesecake-214a6e.netlify.app");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


// app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sendResetPasswordMail = (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "azrieleuryale@gmail.com",
        pass: "hhtjpuefvzqfdcfn",
      },
    });

    const mailOptions = {
      from: "azrieleuryale@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `Hello ${name}, please open the following link to reset your password: http://localhost:3000/reset?token=${token}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
// register
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/forgot", (request, response) => {
  const randomToken = randomstring.generate();
  User.findOneAndUpdate(
    { email: request.body.email },
    { $set: { token: randomToken } }
  )

    .then((user) => {
      sendResetPasswordMail(user.name, user.email, randomToken);

      response.status(200).send({
        message: "Email found",
      });
    })
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
      });
    });
});

app.post("/reset", (request, response) => {
  const token = request.body.token;
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      User.findOneAndUpdate(
        { token: token },
        { $set: { password: hashedPassword } }
      )
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error resetting password",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login
app.post("/login", (request, response) => {
  // check if email exists
  const rem = request.body.remember;
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      console.log(user.id);
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          function expiree() {
            if (request.body.remember == true) {
              return "30d";
            } else {
              return "1h";
            }
          }
          console.log(expiree());
          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",

            { expiresIn: expiree() }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

app.get("/news", (request, response) => {
  News.find({ number: { $lte: 9 } }).then((data) => {
    const data1 = [data[0], data[1], data[2]];
    const data2 = [data[3], data[4], data[5]];
    const data3 = [data[6], data[7], data[8]];
    response.json({ data1, data2, data3 });
  });
});

app.get("/", (request, response) => {
  console.log(request);
  Symbols.find({ id: { $gte: 0 } }).then((data) => {
    response.json({ data });
  });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  const id = request.user.userId;
  const selected = request.headers.currency;

  if (selected) {
    User.findOneAndUpdate(
      { email: request.user.userEmail },
      { $set: { rates: selected } },
      { new: true }
    )
      .then((user) => {
        response.json(user.rates);
      })
      // catch erroe if the new user wasn't added successfully to the database
      .catch((error) => {
        response.status(500).send({
          message: "Error",
          error,
        });
      });
  } else {
    User.findOne({ email: request.user.userEmail })
      .then((user) => {})
      // catch erroe if the new user wasn't added successfully to the database
      .catch((error) => {
        response.status(500).send({
          message: "Error",
          error,
        });
      });
  }
});

app.get("/account", auth, (request, response) => {
  console.log("accessed account");

  User.findOne({ email: request.user.userEmail })
    .then((user) => {
      response.json({ email: user.email, name: user.name });
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get("/dashboard", auth, (request, response) => {
  console.log("accessed dashboard");

  User.findOne({ email: request.user.userEmail })
    .then((user) => {
      console.log(user.rates);
      response.json(user.rates);
    })
    .catch((e) => {
      console.log(e);
    });
});

module.exports = app;
