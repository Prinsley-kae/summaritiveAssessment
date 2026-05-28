const express = require("express");
const router = express.Router();
const Signup = require('../models/Signup'); 
const passport = require('passport');

// SIGNUP PAGE (GET)
router.get('/', (req, res) => {
  res.render('signup', { 
    errors: {}, 
    fullname: '', 
    email: '', 
    phonenumber: '' 
  });
});

// SIGNUP (POST)
router.post('/', async (req, res) => {
  const { fullname, email, phonenumber, password, confirmpassword } = req.body;
  const errors = {};

  try {
    // 1. VALIDATION
    if (!fullname || fullname.trim().length < 3) errors.fullname = 'Full name must be at least 3 characters long.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) errors.email = 'Please enter a valid email address.';
    
    const fullPhoneRegex = /^\+2567\d{8}$/;
    if (!phonenumber || !fullPhoneRegex.test(phonenumber.trim())) {
      errors.phonenumber = 'Format must be +2567xxxxxxxxx (e.g., +256770000000).';
    }

    if (password !== confirmpassword) errors.confirmPassword = 'Passwords do not match.';
    
    // Password strength check
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[@$!%*?&]/.test(password)) {
      errors.password = 'Password requires 8+ chars, uppercase, lowercase, number, and special char.';
    }

    // 2. CHECK FOR VALIDATION ERRORS
    if (Object.keys(errors).length > 0) {
      return res.render('signup', { errors, fullname, email, phonenumber });
    }

    // 3. CHECK IF USER EXISTS
    let existingUser = await Signup.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.render('signup', { 
        errors: { email: 'Email is already registered.' }, 
        fullname, email, phonenumber 
      });
    }

    // 4. REGISTRATION
    const newUser = new Signup({
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      phonenumber: phonenumber.trim()
    });
    
    // Passport-local-mongoose .register method
    await Signup.register(newUser, password);
      
    // Set the success message
    req.flash('success_msg', 'Account registered successfully!');

    // Redirect triggers a new GET request
    return res.redirect("/");

  } catch (error) {
    console.error("Critical Signup Error: ", error);
    return res.render('signup', { 
      errors: { system: 'Registration failed: ' + error.message },
      fullname, email, phonenumber 
    });
  }
});

// LOGIN ROUTE
router.get('/login', (req, res) => {
  res.render('login', { errors: {}, error_msg: req.flash('error_msg') });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.render('login', { 
        errors: { 
          email: 'Invalid email address.', 
          password: 'Password does not match our records.' 
        } 
      });
    }
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      
      // SUCCESS: Redirect with the query parameter to trigger the modal
      return res.redirect('/dashboard?success=true');
    });
  })(req, res, next);
});

module.exports = router;