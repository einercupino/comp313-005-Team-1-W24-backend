const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const secret = process.env.secret;

    const token = jwt.sign(
        {
            userId: user.id,
            isAdmin: user.isAdmin
        },
        secret,
        {expiresIn: '1d'}
    )

    return token;
}


router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'User ID not found.'})
    }
    res.status(200).send(user);
});

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if(!user)
    return res.status(404).send('User cannot be created!')

    res.send(user);
});

router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            color: req.body.color,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            apartment: req.body.apartment,
            street: req.body.street,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        {new: true}
    )

    if(!user)
    return res.status(404).send('User cannot be updated!')

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return res.status(400).send('User not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = generateToken(user);
        res.status(200).send({user: user.email, token: token});
    } else {
        res.status(400).send('Wrong password');
    }

});

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    const token = generateToken(user);
    res.status(200).send({ user: user.email, token: token });
})

router.get(`/get/count`, async (req, res) =>{
    try {
        const userCount = await User.countDocuments();

        res.send({
            userCount: userCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if(user) {
            return res.status(200).json({success: true, message: 'User deleted successfully'})
        } else {
            return res.status(404).json({success: false, message: 'User not found'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
});

module.exports =router;
