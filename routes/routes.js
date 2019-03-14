var express = require('express');
var User = require('../models/user');
var router = express.Router();
var passport = require('passport');


//config routes
router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});
router.get("/signup", (req, res, next) => {
    res.render("signup");
});

router.get("/login", (req, res, next) => {
    res.render("login");
});
// get list user
router.get("/", function (req, res, next) {
    User.find()
        .sort({
            createdAt: "descending"
        })
        .exec(function (err, users) {
            if (err) {
                return next(err);
            }
            res.render("index", {
                users: users
            });
        });
});

router.post("/signup", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
        username: username
    }, (err, user) => {
        if (err) {
            return next(err);
        }
        if (user) {
            req.flash("error", "User Already Exist");
            return res.redirect("/signup");
        }
        console.log("Da chay");
        var newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);
    });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));
router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));
router.get("/users/:username", (req, res, next) => {
    User.findOne({
        username: req.params.username
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(404);
        }
        res.render("profile", {
            user: user
        });
    });
});
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
function ensureAuthenticated (req,res,next) {
    if(req.isAuthenticated){
        next();
    }
    else{
        req.flash("info","You must be logged in to see this page ");
        res.redirect("/login");
    }
}
router.get("/edit",ensureAuthenticated,(req,res,next) => {
    res.render('edit');
});
router.post("/edit",ensureAuthenticated,(req,res,next) => {
    req.user.displayName = req.body.displayname;
    req.user.bio = req.body.bio;
    req.user.save(function (err) {
        if(err){
            next(err);
            return;
        }
        req.flash("info","Profile updated");
        res.redirect("edit");
    });
});
module.exports = router;