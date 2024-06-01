import React,{Dispatch,FormEvent,useState,DragEvent,SetStateAction} from 'react'
// import './App.css'
// import './index.css'

function App() {

  return (
    <div className='flex  w-full ring-2 h-screen bg-slate-300 text-black'>
        <Taskboard/>
    </div>
  )
}

export default App
enum COLUMN {
  PENDING="pending",
  INPROGRESS="inprogress",
  COMPLETED="completed"
}
const dummy:tasktype[]=[
  {
    title:"go gym",
    desc:"go to the gym",
    ttime:new Date(),
    taskstate:COLUMN.PENDING
  },
  {
    title:"go football",
    desc:"play the match",
    ttime:new Date(),
    taskstate:COLUMN.PENDING

  }
]
const Taskboard=()=>{
  const [task,setTasks]=useState(dummy);
  return (
    <div className='flex w-full h-full bg-slate-300 p-8 gap-3  overflow-scroll  '>
     <Column
     title={"TO DO"}
     column={COLUMN.PENDING}
     tasks={task}
     setTasks={setTasks}
     />
     <Column
     title={"IN PROGRESS"}
     column={COLUMN.INPROGRESS}
     tasks={task}
     setTasks={setTasks}
     />
     <Column
     title={"DONE"}
     column={COLUMN.COMPLETED}
     tasks={task}
     setTasks={setTasks}
     />
    </div>
  )
}

interface tasktype{
  title:String,
  desc?:String,
  ttime:Date,
  taskstate:COLUMN
}
interface  cprops{
title:String,
column:COLUMN,
tasks:tasktype[],
setTasks:Dispatch<SetStateAction<tasktype[]>>

}
const Column=({title,column,tasks,setTasks}:cprops)=>{
  // 
  return (
    // list column
    <div className='h-screen  bg-slate-400/25 w-56 shrink-0'>
      {/* list header */}
      <div className='flex flex-row  justify-center items-center mb-4 text-gray-700 bg-slate-400'>
        <h3 className={` font-medium`}>{title}</h3>
      </div>
      {/* tasks list */}
    </div>
  )

}