const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


// 회원가입
router.post('/users', async (req,res)=>{
  const user = new User(req.body)
  try{
    await user.save()
    const token = await user.generateAuthToken()

    res.status(201).send({user,token})
  }catch(e){
    res.status(400).send(e)
  }
})

// 로그인
router.post('/users/login', async (req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken() 
    res.send({user, token})
  }catch(e){
    res.status(400).send()
  }
})

// 로그아웃
router.post('/users/logout', auth, async (req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !== req.token
    })
    await req.user.save()

    res.send()
  }catch(e){
    res.status(500).send()
  }
})

// 로그아웃 ALL
router.post('/users/logoutAll', auth, async(req,res)=>{
  try{
    req.user.tokens = []
    
    await req.user.save()
    res.send()

  }catch(e){
    res.status(500).send()
  }
})



// Read users
router.get('/users/me', auth , async (req,res)=>{
  res.send(req.user)
})





// 업데이트
router.patch('/users/me', auth, async (req,res)=>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','email','password','age']
  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
  
  if(!isValidOperation){
    return res.status(400).send({error:'Invalid updates!'})
  }
  
  try{
    updates.forEach((update)=> req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  }catch(e){
    res.status(400).send(e)
  }
})

// 삭제
router.delete('/users/me', auth, async (req,res)=>{
  try{
    await req.user.remove()
    res.send(req.user)
  }catch(e){
    res.status(500).send()
  }
})


// Avatar 업로드
const upload = multer({
  limits: {
    fileSize : 1000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('Please upload a jpg,jpeg,png files'))
    }

    cb(undefined,true)
  }
})

router.post('/users/me/avatar',auth, upload.single('avatar') , async (req,res)=>{
  const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
},(error,req,res,next)=>{
  res.status(400).send({ error : error.message })
})


router.delete('/users/me/avatar',auth, async (req,res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
  try{
    const user = await User.findById(req.params.id)
    
    if(!user || !user.avatar){
      throw new Error()
    }

    res.set('Content-Type','image/png')
    res.send(user.avatar)
  }catch(e){
    res.status(400).send()
  }
})


module.exports = router