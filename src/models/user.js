const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    trim:true  
  },
  email:{
    type:String,
    unique:true,
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
  },
  tokens:[{
    token:{
      type:String,
      required: true
    }
  }],
  avatar:{
    type : Buffer
  }
}, {
  timestamps:true
})

userSchema.virtual('tasks', {
  ref:'Task',
  localField:'_id',
  foreignField:'owner'
})



// res.send 할때 JSON.stringfy 하기때문에,  우리가 toJSON으로 조작할수 있다.
userSchema.methods.toJSON = function (){
  const user = this
  const userObject = user.toObject()
  
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}


userSchema.methods.generateAuthToken = async function (){
  // 여기서 this는 저장될 document와 같다, this는 저장될 individual user에 접근 할 수 있게 해준다
  const user = this
  // 첫번째 파라미터는 유니크한거
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
  
  user.tokens = user.tokens.concat({token})
  await user.save()

  return token
}



userSchema.statics.findByCredentials = async (email, password) =>{
  
  const user = await User.findOne({ email })
  if(!user){
    //즉시 실행 중단후 메세지 날림
    throw new Error('Unable to login')
  }
  
  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch){
    throw new Error('Unable to login')
  }

  return user
}




// Hash the plain text password before saving - middleware 
userSchema.pre('save',async function (next){
  // 여기서 this는 저장될 document와 같다, this는 저장될 individual user에 접근 할 수 있게 해준다
  const user = this 

  // 처음 비번 생성하거나 업데이트 할때만 true
  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next){
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})



const User = mongoose.model('User', userSchema)

module.exports = User