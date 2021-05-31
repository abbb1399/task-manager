require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.findByIdAndDelete('60b30ee0dad38b0bbc85c292').then((task)=>{
//   console.log(task)
//   return Task.countDocuments({ completed : false})
// }).then((result)=>{
//   console.log(result)
// }).catch((e)=>{
//   console.log(e)
// })


const deleteTaskAndCount = async (id)=>{
  const task = await Task.findByIdAndDelete(id)
  const count = await Task.countDocuments({completed:false}) //promise를 리턴해야만 await를 쓸 수 있다.
  return count
}

deleteTaskAndCount('60b237871a7437375c535032').then((count)=>{
  console.log(count)
}).catch(e=>{
  console.log(e)
})