const jwt = require("jsonwebtoken");
const User = require("./../models/userModels");
const catchAsync = require("../Utils/catchAsync");
const appError = require("./../Utils/appError");

const signToken = (idUser) =>{
  return jwt.sign(
    {id: idUser},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN}
    )
}

exports.signup = catchAsync(async(request, response, next)=>{
  const {name, email, password, passwordConfirm} = request.body
  const newUser = await User.create({name, email, password, passwordConfirm});
  const token = signToken(newUser._id);
  response.status(201).json({status: 'success', token, data: {user: newUser}});
  next();
});

exports.login = catchAsync( async (request, response, next) =>{
  const {email, password} = request.body;
  if(!email || !password){
    return next(new appError('Please provide E-mail and Password!', 400));
  }

  const user = await User.findOne({email}).select('+password');
  const isCorrectPassword = await user.correctPassword(password, user.password);
  if(!user || !isCorrectPassword){
    return next(new appError('Incorrect e-mail or password', 401));
  }
  const token = signToken(user._id);
  response.status(200).json({status: 'success', token});
  next();
});