const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    trim:true  
  },
  email:{
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('Email is invalid')
      }
    }
  },
  password:{
    type: String,
    required: true,
    trim:true,
    minLength:7,
    validate(value){
      if(value.toLowerCase().includes('password')){
        throw new Error('Do not include "password" in your password')
      }
    }
  },
  age:{
    type: Number,
    default: 0,
    validate(value){
      if(value < 0){
        throw new Error('Age must be a positive number')
      }
    }
  }
})

// 미들웨어
userSchema.pre('save',async function (next){
  const user = this

  // 처음 비번 생성하거나 업데이트 할때만 true
  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User