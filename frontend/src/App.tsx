import React,{Dispatch,FormEvent,useState,DragEvent,SetStateAction} from 'react'
// import './App.css'
// import './index.css'

function App() {

  return (
    <div className='flex items-center justify-center  w-full ring-2 h-screen bg-slate-300 text-black'>
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
    id:Math.random().toString(),
    title:"go gym",
    desc:"go to the gym",
    ttime:new Date(),
    taskstate:COLUMN.PENDING
  },
  {
    id:Math.random().toString(),
    title:"go football",
    desc:"play the match",
    ttime:new Date(),
    taskstate:COLUMN.INPROGRESS

  },
  {
    id:Math.random().toString(),
    title:"play chess",
    desc:"tournament",
    ttime:new Date(),
    taskstate:COLUMN.PENDING

  }
]
const Taskboard=()=>{
  const [task,setTasks]=useState(dummy);
  return (
    <div className='flex item-center justify-center  w-full h-full bg-slate-300 p-8 gap-3  overflow-scroll  '>
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
  id:string,
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
  // taskfilter according to the columns
  const taskfilter:tasktype[]=tasks.filter((t)=>t.taskstate==column);
  return (
    // list column
    <div className='flex flex-col justify-start gap-2 items-center h-screen  bg-slate-400/25 w-72 shrink-0'>
      {/* list header */}
      <div className='flex flex-row w-full h-fit  justify-center items-center mb-4 text-gray-700 bg-slate-400'>
        <h3 className={` font-medium`}>{title}</h3>
        <span className='font-bold tracking-wide leading-normal ml-2'>{taskfilter.length}</span>
      </div>
      {/* tasks list */}
      <div className={`flex flex-col gap-1 w-full h-fit`}>
      {
       taskfilter.length>0 && taskfilter.map((tsk)=>{
          return (
            <Card key={tsk.id} tsk={tsk}/>
          )
        })
      }
      </div>

    </div>
  )

}
interface tprops{
  tsk:tasktype,
}

const Card=({tsk}:tprops)=>{
  return (
    <div

    draggable="true"
    className='flex w-full bg-slate-500 h-fit gap-2 flex-col items-start justify-center p-3 cursor-grab active:cursor-grabbing rounded-md  border-neutral-500 border-[1px] '>
      {/* title  */}
      <span className='flex w-full text-start items-center '>Title: {tsk.title}</span>
      {/* description */}
      {tsk.desc?(tsk.desc.length>0?(<div className=' flex w-full font-normal text-wrap text-left'>
        {tsk.desc}
      </div>):''):''}
      {/* timestamp */}
      {tsk.taskstate==COLUMN.COMPLETED?(<span className='flex w-full place-content-end'>{tsk.ttime.getDate()}</span>):''}
    </div>
  )
}