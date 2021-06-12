const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

// 미들웨어
// app.use((req,res,next)=>{
//   console.log(req.method, req.path)
//  if(req.method === 'GET'){
//   res.send('Get requests are disabled')
//  }else{
//    next()
//  }
// })

// app.use((req,res,next)=>{
//   res.status(503).send('Site is currenlty down. Check back soon!')
// })



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
  console.log('Server is up on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')

// const main = async ()=>{
//   // const task = await Task.findById('60bcc3a32b908f3420677042')
//   // await task.populate('owner').execPopulate()
//   // console.log(task.owner)

//   const user = await User.findById('60bcc39d2b908f3420677040')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }

// main()