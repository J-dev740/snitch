import { Dispatch, FormEvent, useState, DragEvent, SetStateAction } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiTrash } from "react-icons/fi";


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
  const [active, setActive] = useState(false);
  const handleDragOver = (e: DragEvent) => {
    // prevent overload
    e.preventDefault();
    // set the highlighter for the closest element 
    highlight(e);
    setActive(true);
  }
  const highlight = (e: DragEvent) => {
    // get all the indicators for cards for a particular column
    const indicators = getIndicatorsforcol();
    clearHighlights(indicators);
    // console.log('indicators',indicators);
    // get the closest element to the cursor grabbed element 
    const el = getclosest(e, indicators);
    // set the indicator of the closest element;

    el.element.style.opacity = "1";


  }
  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els ?? getIndicatorsforcol();
    indicators.forEach((i) => {
      i.style.opacity = '0';
    })

  }
  const getclosest = (e: DragEvent, ar: HTMLElement[]) => {
    const OFFSET = 50;
    const el = ar.reduce(
      (closest, child) => {
        const ofset = e.clientY - (child.getBoundingClientRect().top + OFFSET);
        if (ofset < 0 && ofset > closest.offset) {
          return {
            offset: ofset,
            element: child,
          }
        }
        else {
          return closest;
        }

      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: ar[ar.length - 1],
      }
    )
    return el;

  }

  const getIndicatorsforcol = () => {
    return Array.from((document.querySelectorAll(`[data-column="${column.toString()}"]`) as unknown as HTMLElement[]))
  }
  const handleDragStart = (e: DragEvent, tsk: tasktype) => {
    // e.preventDefault();
    e.dataTransfer.setData('taskId', tsk.id);

  }
  const handleOnDrop = (e: DragEvent) => {
    e.preventDefault();
    console.log('drop')
    const taskid = e.dataTransfer.getData('taskId');
    setActive(false);
    const indicators = getIndicatorsforcol();
    clearHighlights(indicators);
    const { element } = getclosest(e, indicators);
    const before = element.dataset.before || "-1";
    console.log(before, taskid)
    if (before !== taskid) {
      let tasksCopy: tasktype[] = [...tasks];
      // console.log(tasksCopy)
      let foundTask = tasksCopy.find((task) => task.id == taskid);
      if (!foundTask) { alert("No task found"); return; }
      else if(foundTask.taskstate==COLUMN.COMPLETED) return;
      else foundTask = { ...foundTask, taskstate: column }
      tasksCopy = tasksCopy.filter((task) => task.id !== taskid);
      if (before == "-1") tasksCopy.push(foundTask);
      else {
        console.log('before', tasksCopy)
        let idx = tasksCopy.findIndex((task) => task.id == before);
        tasksCopy.splice(idx, 0, foundTask);
        console.log('after', tasksCopy)

      }
      setTasks(tasksCopy);
    }


  }
  const handleOnLeave = () => {
    clearHighlights();
    setActive(false);
  }
  const [adding, setAdding] = useState(false);
  // taskfilter according to the columns
  const taskfilter: tasktype[] = tasks.filter((t) => t.taskstate == column);
  return (
    // list column
    <div className='flex flex-col  gap-1  items-center h-screen  bg-slate-400/25 w-72 shrink-0'>
      {/* list header */}
      <div className='flex flex-row w-full h-fit justify-between  p-2 items-center mb-4 text-gray-700 bg-slate-400'>
        <div className='flex flex-row justify-center  items-center gap-2'>
          <h3 className={`flex w-fit shrink-0 font-medium`}>{title}</h3>
          <span className='flex font-bold tracking-wide leading-normal ml-2'>{taskfilter.length}</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className='flex w-fit  p-1 ml-2 mr-1 hover:cursor-pointer'> <FiPlus /></button>
      </div>
      {/* tasks list */}
      <div
        onDrop={handleOnDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleOnLeave}
        className={`h-full w-full transition-colors ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"
          }`}>
        {
          taskfilter.length > 0 && taskfilter.map((tsk) => {
            return (
              <Card key={tsk.id} tsk={tsk} tasks={tasks} setTask={setTasks} start={handleDragStart} />
            )
          })
        }
        <DropIndicator column={column} bid={null} />
        <Add adding={adding} column={column} setadding={setAdding} settasks={setTasks} />

      </div>

    </div>
  )

}
interface tprops {
  tasks:tasktype[],
  tsk: tasktype,
  start: Function,
  setTask:Dispatch<SetStateAction<tasktype[]>>
}


const Card = ({ tsk, start,tasks,setTask }: tprops) => {

  const handleCheck=(tsk:tasktype)=>{
    const id=tsk.id;
    let cpy=[...tasks];
    cpy=cpy.filter((task)=>task.id!==id);
    let state=tsk.taskstate;
    if(state==COLUMN.PENDING) state=COLUMN.INPROGRESS;
    else state=COLUMN.COMPLETED;
    const updatedtask:tasktype={...tsk,taskstate:state};
    cpy.push(updatedtask);
    setTask(cpy);
  }

  return (
    <>
      <DropIndicator column={tsk.taskstate} bid={tsk.id} />
      <motion.div
        layout
        layoutId={tsk.id}
        draggable="true"
        onDragStart={(e) => {
          console.log('start')
          start(e, tsk)
        }}
        className='flex w-full bg-slate-500 h-fit gap-2 flex-col items-start justify-center p-3 cursor-grab active:cursor-grabbing rounded-md  border-neutral-500 border-[1px] '>
        {/* title  */}
        <span className='flex w-full text-start items-center '>Title: {tsk.title}</span>
        {/* description */}
        {tsk.desc ? (tsk.desc.length > 0 ? (<div className=' flex w-full font-normal text-wrap text-left'>
          {tsk.desc}
        </div>) : '') : ''}
      { tsk.taskstate!==COLUMN.COMPLETED && ( <div 
        onClick={()=>
          {
            setTimeout(()=>handleCheck(tsk),300);
          }
        }
        className='flex w-full justify-end'>
        <Check/>
        </div>)}
        {/* timestamp */}
        {tsk.taskstate == COLUMN.COMPLETED ? (<span className='flex w-full place-content-end'>{tsk.ttime.toDateString()}</span>) : ''}
      </motion.div>
    </>
  )
}

interface addprops {
  adding: boolean
  column: COLUMN
  settasks: Dispatch<SetStateAction<tasktype[]>>
  setadding: Dispatch<SetStateAction<boolean>>
}
const Add = ({ setadding, adding, column, settasks }: addprops) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim().length) return;
    const newtask: tasktype = {
      taskstate: column,
      title: title,
      desc: desc ?? '',
      id: Math.random().toString(),
      ttime: new Date(Date.now())
    }
    settasks((prev) => [...prev, newtask]);
    setTitle('');
    setDesc('');
    setadding(false);
  }
  return (
    <div className='flex w-full'>
      {
        adding ? (
          <motion.form
            onSubmit={(e) => handleSubmit(e)}
            layout
            className='flex w-full flex-col'
          >
            <input
              type="text"
              value={title}
              required={true}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-black focus:outline-0"
            />
            <textarea
              onChange={(e) => setDesc(e.target.value)}
              required={false}
              autoFocus
              placeholder="Add new task..."
              className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-black focus:outline-0"
            />
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <button
                onClick={() => { setTitle(''); setDesc(''); setadding(false) }}
                className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
              >
                <span>Add</span>
                <FiPlus />
              </button>
            </div>
          </motion.form>
        ) : (<></>)
      }

    </div>
  )
}

const Check = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
      setIsChecked(!isChecked);
  };

  return (
      <div 
          className={`flex items-center p-1 md:p-2 rounded-lg cursor-pointer transition-colors duration-300 shadow-lg ${isChecked ? 'bg-green-500 text-white' : 'bg-gray-100'}`} 
          onClick={handleToggle}
      >
          <div 
              className={`w-3 h-3 md:w-6 md:h-6 flex items-center justify-center border-2 rounded-md transition-colors duration-300 ${isChecked ? 'bg-white border-white' : 'bg-white border-green-500'}`}
          >
              {isChecked && <span className="text-green-500">&#10003;</span>}
          </div>
          {/* <span className="ml-2 md:ml-4 font-medium">
              {isChecked ? 'Completed' : 'Mark as Completed'}
          </span> */}
      </div>
  );
};
function delay(arg0: number) {
  throw new Error('Function not implemented.');
}

