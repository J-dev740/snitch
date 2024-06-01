import React, { Dispatch, FormEvent, useState, DragEvent, SetStateAction } from 'react'
// import './App.css'
// import './index.css'

function App() {

  return (
    <div className='flex items-center justify-center  w-full ring-2 h-screen bg-slate-300 text-black'>
      <Taskboard />
    </div>
  )
}

export default App
enum COLUMN {
  PENDING = "pending",
  INPROGRESS = "inprogress",
  COMPLETED = "completed"
}
const dummy: tasktype[] = [
  {
    id: Math.random().toString(),
    title: "go gym",
    desc: "go to the gym",
    ttime: new Date(),
    taskstate: COLUMN.PENDING
  },
  {
    id: Math.random().toString(),
    title: "go football",
    desc: "play the match",
    ttime: new Date(),
    taskstate: COLUMN.INPROGRESS

  },
  {
    id: Math.random().toString(),
    title: "play chess",
    desc: "tournament",
    ttime: new Date(),
    taskstate: COLUMN.INPROGRESS

  }
]
const Taskboard = () => {
  const [task, setTasks] = useState(dummy);
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

interface tasktype {
  id: string,
  title: String,
  desc?: String,
  ttime: Date,
  taskstate: COLUMN
}
interface cprops {
  title: String,
  column: COLUMN,
  tasks: tasktype[],
  setTasks: Dispatch<SetStateAction<tasktype[]>>

}
interface indicatorProps {
  bid: string | null,
  column: COLUMN
}
const DropIndicator = ({ bid, column }: indicatorProps) => {
  return (
    <div
      data-before={bid || '-1'}
      data-column={column}
      className=' my-0.5 h-[2px] bg-blue-500 flex  w-full opacity-0 '>
    </div>
  )
}
const Column = ({ title, column, tasks, setTasks }: cprops) => {
  const [active,setActive]=useState(false);
  const handleDragOver=(e:DragEvent)=>{
    // prevent overload
    e.preventDefault();
    // set the highlighter for the closest element 
    highlight(e);
    setActive(true);
  }
  const highlight=(e:DragEvent)=>{
    // get all the indicators for cards for a particular column
    const indicators=getIndicatorsforcol();
    clearHighlights(indicators);
    // console.log('indicators',indicators);
    // get the closest element to the cursor grabbed element 
    const el=getclosest(e,indicators);
    // set the indicator of the closest element;
    
    el.element.style.opacity="1";


  }
  const clearHighlights=(els?:HTMLElement[])=>{
    const indicators=els??getIndicatorsforcol();
    indicators.forEach((i)=>{
      i.style.opacity='0';
    })
    
  }
  const getclosest=(e:DragEvent,ar:HTMLElement[])=>{
    const OFFSET=50;
    const el=ar.reduce(
      (closest,child)=>{
        const ofset=e.clientY-(child.getBoundingClientRect().top+OFFSET);
        if(ofset<0 && ofset>closest.offset){
          return {
            offset:ofset,
            element:child,
          }
        }
          else {
            return closest;
          }

      },
      {
        offset:Number.NEGATIVE_INFINITY,
        element:ar[ar.length-1],
      }
    )
    return el;

  }

  const getIndicatorsforcol=()=>{
    return Array.from((document.querySelectorAll(`[data-column="${column.toString()}"]`) as unknown as HTMLElement[]))
  }
  const handleDragStart=(e:DragEvent,tsk:tasktype)=>{
    // e.preventDefault();
    e.dataTransfer.setData('taskId',tsk.id);

  }
  const handleOnDrop=(e:DragEvent)=>{
    e.preventDefault();
    console.log('drop')
    const taskid=e.dataTransfer.getData('taskId');
    setActive(false);
    const indicators=getIndicatorsforcol();
    clearHighlights(indicators);
    const {element}=getclosest(e,indicators);
    const before=element.dataset.before || "-1";
    console.log(before,taskid)
    if(before!==taskid){
      let tasksCopy:tasktype[]=[...tasks];
      console.log(tasksCopy)
      let foundTask=tasksCopy.find((task)=>task.id==taskid);
      if(!foundTask){alert("No task found"); return ;}
      else foundTask={...foundTask,taskstate:column}
      tasksCopy=tasksCopy.filter((task)=>task.id!==taskid);
      if(before=="-1") tasksCopy.push(foundTask);
      else {
        console.log('before',tasksCopy)
        let idx=tasksCopy.findIndex((task)=>task.id==before);
        tasksCopy.splice(idx,0,foundTask);
        console.log('after',tasksCopy)

      }
      setTasks(tasksCopy);
    }


  }
  const handleOnLeave=()=>{
    clearHighlights();
    setActive(false);
  }
  // taskfilter according to the columns
  const taskfilter: tasktype[] = tasks.filter((t) => t.taskstate == column);
  return (
    // list column
    <div className='flex flex-col justify-start gap-2 items-center h-screen  bg-slate-400/25 w-72 shrink-0'>
      {/* list header */}
      <div className='flex flex-row w-full h-fit  justify-center items-center mb-4 text-gray-700 bg-slate-400'>
        <h3 className={` font-medium`}>{title}</h3>
        <span className='font-bold tracking-wide leading-normal ml-2'>{taskfilter.length}</span>
      </div>
      {/* tasks list */}
      <div
      onDrop={handleOnDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleOnLeave}
       className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}>
        {
          taskfilter.length > 0 && taskfilter.map((tsk) => {
            return (
              <Card key={tsk.id} tsk={tsk} start={handleDragStart} />
            )
          })
        }
        <DropIndicator column={column} bid={null} />

      </div>

    </div>
  )

}
interface tprops {
  tsk: tasktype,
  start:Function,
}

const Card = ({ tsk,start }: tprops) => {

  return (
    <>
      <DropIndicator column={tsk.taskstate} bid={tsk.id} />
      <div
        draggable="true"
        onDragStart={(e)=>{
          console.log('start')
          start(e,tsk)}}
        className='flex w-full bg-slate-500 h-fit gap-2 flex-col items-start justify-center p-3 cursor-grab active:cursor-grabbing rounded-md  border-neutral-500 border-[1px] '>
        {/* title  */}
        <span className='flex w-full text-start items-center '>Title: {tsk.title}</span>
        {/* description */}
        {tsk.desc ? (tsk.desc.length > 0 ? (<div className=' flex w-full font-normal text-wrap text-left'>
          {tsk.desc}
        </div>) : '') : ''}
        {/* timestamp */}
        {tsk.taskstate == COLUMN.COMPLETED ? (<span className='flex w-full place-content-end'>{tsk.ttime.toDateString()}</span>) : ''}
      </div>
    </>
  )
}

