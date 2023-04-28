const router = require('express').Router();
const user = require('../models/user');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation, verifyRefresh } = require('../validation');
const bcrypt = require('bcrypt');

//registration


router.post("/register", async (req, res) => {
    //code

    //validate the user input
    const { error } = registerValidation(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0] });
    }

    //check if the email is already registered
    const emailExists = await user.findOne({ email: req.body.email });

    if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
    }


    //hash the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);


    console.log("Salt:" + salt);
    console.log("Password:" + password);

    //create a user object and save in the DB
    const userObject = new user({
        name: req.body.name,
        email: req.body.email,
        password
    });

    try {
        const savedUser = await userObject.save();
        res.json({ error: null, data: savedUser._id });
    }
    catch (error) {
        res.status(400).json({ error })
    }
});

router.post("/login", async (req, res) => {

    //validate user login info
    const { error } = loginValidation(req.body);

    //if login info is valid, find the user
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    //throw error if email is wrong (user does not exist in DB)
    const userObject = await user.findOne({ email: req.body.email });

    if (!userObject) {
        return res.status(400).json({ error: "Email is wrong" });
    }


    //user exists - check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, userObject.password);

    //throw error if password is wrong
    if (!validPassword) {
        return res.status(400).json({ error: "Password is wrong" });
    }


    //create authentication token with username and id
    const accessToken = jwt.sign(
        //payload
        {
            name: userObject.name,
            email: userObject.email
        },
        //TOKEN_SECRET
        process.env.TOKEN_SECRET,

        //EXPIRATION TIME
        { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    //create authentication token with username and id
    const refreshToken = jwt.sign(
        //payload
        {
            name: userObject.name,
            email: userObject.email
        },
        //TOKEN_SECRET
        process.env.TOKEN_SECRET,

        //EXPIRATION TIME
        { expiresIn: '24h' },
    );

    //attach auth token to header
    res.header("auth-token", accessToken).json({
        error: null,
        data: { accessToken, refreshToken }
    });
});

router.post("/refresh", (req, res) => {
    const { email, refreshToken } = req.body;
    const isValid = verifyRefresh(email, refreshToken);
    if (!isValid) {
        return res
            .status(401)
            .json({ success: false, error: "Invalid token,try login again" });
    }
    const accessToken = jwt.sign({ email: email }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return res.status(200).json({ success: true, accessToken });
});


module.exports = router;