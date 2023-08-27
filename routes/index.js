var express = require('express');
var router = express.Router();
const userModule = require('./users')
const expressSession = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const multer = require('multer');
passport.use(new localStrategy(userModule.authenticate()));

// THEN STORAGE AND DISK STORAGE CODE COPY FROM DOCUMENTATION AND PATSE IT 
const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/images/uploads')
        },
        filename: function(req, file, cb) {
            var filename = Date.now() + Math.floor(Math.random() * 1000000) + file.originalname;
            cb(null, filename)

        }
    })
    // for file filtering 
function fileFilter(req, file, cb) {

    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
        cb(null, true)
    } else {
        cb(new Error('Bhai tejj mt chal ....'));
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

/* GET home page. */
// FOR PROFILE PHOTO UPLOAD
// profile ROUTE RENDERING
router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile');
});
router.post('/image', isLoggedIn, upload.single('image'), function(req, res) {
    userModule.findOne({ username: req.session.passport.user })
        .then(function(user) {
            user.dpimage = req.file.filename;
            user.save()
                .then(function() {
                    res.redirect("/read")
                })
        })
});

// MAIN PAGE
router.get('/', function(req, res) {
    res.render('index');
});
// Login ROUTE RENDERING
router.get('/login', function(req, res) {
    res.render('login');
});

// for regitering a user or create new user account
router.post('/register', function(req, res) {
    var newUser = new userModule({
        name: req.body.name,
        username: req.body.username,
        // dpimage :req.body.dpimage
    })
    userModule.register(newUser, req.body.password)
        .then(function(registeredUser) {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/read')
            })
        })
});

// after creating a user login by using username and password
router.post('/login', passport.authenticate('local', {
    successRedirect: '/read',
    failureRedirect: '/login'
}), function(req, res, next) {});


// IsLoggedIn Middleware for not accesing the details by route
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}
// For Read and Show All cards
router.get('/read', isLoggedIn, function(req, res) {
    //  userModule.findOne({username:req.session.passport.user})
    userModule.find()
        .then(function(data) {
            res.render("read", { data: data })
        })
});

// For Edit Icon
router.get('/edit/:edited', isLoggedIn, function(req, res) {
    userModule.findOne({ _id: req.params.edited })
        .then(function(data) {
            res.render("update", { data: data })

        })
});

//For Update Page And details
router.post('/update/:idd', isLoggedIn, upload.single('image'), function(req, res) {
    userModule.findOneAndUpdate({ _id: req.params.idd }, { name: req.body.name, dpimage: req.file.filename })
        .then(function(data) {
            res.redirect("/read")

        })
});

// For Delete User
router.get('/delete/:del', isLoggedIn, function(req, res) {

    userModule.findOneAndDelete({ _id: req.params.del })
        .then(function() {
            res.redirect("/")
        })

});

// For Favorite 

router.get('/favrite/:fav', isLoggedIn, function(req, res) {

    // userModule.findOne({_id:req.params.fav})
    // .then(function(data){  
    //   data.favrioutes++;
    //   data.save().then(function(savedata){
    //     res.redirect("/read")
    //   })

    // }) 
    userModule.findOne({ username: req.session.passport.user })
        .then(function(loggedInUser) {
            userModule.findOne({ _id: req.params.fav })
                .then(function(post) {
                    // console.log(post.favourites.indexOf(loggedInUser.username));
                    if (post.favourites.indexOf(loggedInUser.username) === -1) {
                        post.favourites.push(loggedInUser.username);
                    } else {
                        post.favourites.splice(post.favourites.indexOf(loggedInUser.username), 1);
                    }
                    post.save()
                        .then(function(savedata) {
                            res.redirect("/read");
                        })
                })
        })
});

// For comment add and Show Date and Time ......
router.get('/comment/:cmts', isLoggedIn, function(req, res) {
    userModule.findOne({ _id: req.params.cmts })
        .then(function(data) {
            var time = new Date();
            data.comments.push({ comment: req.query.comment, time: `${ time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()} - ${time.getHours()}/${time.getMinutes()}` })
            data.save().then(function(abc) {
                res.redirect("/read")
            })
        })
});

// for logout 
router.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
})

module.exports = router;