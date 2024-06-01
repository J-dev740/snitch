import { Dispatch, FormEvent, useState, DragEvent, SetStateAction } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, } from "react-icons/fi";

enum COLUMN {
  PENDING = "pending",
  INPROGRESS = "inprogress",
  COMPLETED = "completed"
}

// interface of a task card 

interface tasktype {
  id: string,
  title: String,
  desc?: String,
  ttime: Date,
  taskstate: COLUMN
}
// interface of column props or params
interface cprops {
  title: String,
  column: COLUMN,
  tasks: tasktype[],
  setTasks: Dispatch<SetStateAction<tasktype[]>>

}
// interface of drop indicator 

interface indicatorProps {
  bid: string | null,
  column: COLUMN
}

// interface of a taskcard 
interface tprops {
  tasks: tasktype[],
  tsk: tasktype,
  start: Function,
  setTask: Dispatch<SetStateAction<tasktype[]>>
}

// interface of add task component
interface addprops {
  // adding: boolean
  column: COLUMN
  settasks: Dispatch<SetStateAction<tasktype[]>>
}
// main piece of code 
function App() {

  return (
    <div className='flex items-center justify-center  w-full  h-screen bg-white text-black'>
      <Taskboard />
    </div>
  )
}

export default App

// this is the taskboard component enclosing the whole dynamic todo list board 
const Taskboard = () => {
  const [task, setTasks] = useState<tasktype[]>([]);
  return (
    <div className='flex item-center justify-center  w-full md:min-h-[500px] lg:min-h-[700px] h-full bg-white p-8 gap-3  overflow-scroll  '>
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

// this shows the drop indicator for the drop place of a particular task
const DropIndicator = ({ bid, column }: indicatorProps) => {
  return (
    <div
      data-before={bid || '-1'}
      data-column={column}
      className=' my-0.5 h-[2px] bg-blue-500 flex  w-full opacity-0 '>
    </div>
  )
}
// column component is the compoent that is used to render the to inprogress and completed sections 
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
      else if (foundTask.taskstate == COLUMN.COMPLETED || (foundTask.taskstate == COLUMN.INPROGRESS && column == COLUMN.PENDING)) return;
      else foundTask = { ...foundTask, taskstate: column }
      tasksCopy = tasksCopy.filter((task) => task.id !== taskid);
      if (foundTask.taskstate == COLUMN.COMPLETED) foundTask.ttime = new Date(Date.now());

      // code to update the list of tasks with the updated task states;
      if (before == "-1") tasksCopy.push(foundTask);
      else {
        // console.log('before', tasksCopy)
        let idx = tasksCopy.findIndex((task) => task.id == before);
        tasksCopy.splice(idx, 0, foundTask);
        // console.log('after', tasksCopy)

      }
      setTasks(tasksCopy);
    }


  }
  const handleOnLeave = () => {
    clearHighlights();
    setActive(false);
  }
  // taskfilter according to the columns
  const taskfilter: tasktype[] = tasks.filter((t) => t.taskstate == column);
  return (
    // list column
    <div className='flex flex-col  gap-1  items-center h-full py-2 md:min-h-[500px] min-h-[200px]  bg-stone-200 p-[3px] shadodw drop-shadow-lg hover:shadow-xl md:w-72 w-56 lg:w-80 xl:w-[400px] shrink-0'>
      {/* list header */}
      <div className='flex flex-row w-full h-fit justify-between  p-2 items-center mb-4 bg-stone-300 text-stone-600'>
        <div className='flex flex-row justify-center  items-center gap-2'>
          <h3 className={`flex w-fit shrink-0 font-medium`}>{title}</h3>
          <span className='flex font-semibold tracking-wide leading-normal ml-2'>{taskfilter.length}{' '}{' '}{taskfilter.length > 1 ? 'ISSUES' : 'ISSUE'}</span>
        </div>
      </div>
      {/* tasks list */}
      <div
        onDrop={handleOnDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleOnLeave}
        className={`h-full w-full transition-colors  ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"
          }`}>
        {
          taskfilter.length > 0 && taskfilter.map((tsk) => {
            return (
              <Card key={tsk.id} tsk={tsk} tasks={tasks} setTask={setTasks} start={handleDragStart} />
            )
          })
        }
        <DropIndicator column={column} bid={null} />
        {column == COLUMN.PENDING && <Add column={column} settasks={setTasks} />}

      </div>

    </div>
  )

}

// card is the template to render each task according to it's column type
const Card = ({ tsk, start, tasks, setTask }: tprops) => {

  const handleCheck = (tsk: tasktype) => {
    const id = tsk.id;
    let cpy = [...tasks];
    cpy = cpy.filter((task) => task.id !== id);
    let state = tsk.taskstate;
    if (state == COLUMN.PENDING) state = COLUMN.INPROGRESS;
    else state = COLUMN.COMPLETED;
    const updatedtask: tasktype = { ...tsk, taskstate: state };
    if (updatedtask.taskstate == COLUMN.COMPLETED) updatedtask.ttime = new Date(Date.now());
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
        className='flex w-full bg-white shadow-md hover:shadow-xl     h-fit gap-2 flex-col items-start justify-center p-3 cursor-grab active:cursor-grabbing rounded-md  border-stone-300 border-[1px] '>
        {/* title  */}
        <span className='flex w-full text-start font-semibold text-wrap items-center '> {tsk.title}</span>
        {/* description */}
        {tsk.desc ? (tsk.desc.length > 0 ? (<div className=' flex w-full  font-normal text-wrap text-left'>
          {tsk.desc}
        </div>) : '') : ''}
        {tsk.taskstate !== COLUMN.COMPLETED && (<div
          onClick={() => {
            setTimeout(() => handleCheck(tsk), 300);
          }
          }
          className='flex w-full justify-end'>
          <Check />
        </div>)}
        {/* timestamp */}
        {tsk.taskstate == COLUMN.COMPLETED ? (<span className='flex w-full place-content-end'>{new Date(tsk.ttime).toLocaleString().trimEnd()}</span>) : ''}
      </motion.div>
    </>
  )
}



// this component lets you add a new task to the list 
const Add = ({  settasks }: addprops) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim().length) return;
    const newtask: tasktype = {
      taskstate: COLUMN.PENDING,
      title: title,
      desc: desc ?? '',
      id: Math.random().toString(),
      ttime: new Date(Date.now())
    }
    settasks((prev) => [...prev, newtask]);
    setTitle('');
    setDesc('');
    setAdding(false);
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
                onClick={() => { setTitle(''); setDesc(''); setAdding(false) }}
                className="px-3 py-1.5 text-xs text-stone-700 transition-colors hover:text-neutral-50"
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
        ) : (<motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <FiPlus className='text-black' />
          <span className='text-black font-semibold tracking-widest'>Create Issue</span>
        </motion.button>)
      }

    </div>
  )
}



// this is a tailwind componenet that I created to produce a seamless ux for chekbox part 
const Check = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div
      className={`flex items-center p-1 rounded-lg cursor-pointer transition-colors duration-300 shadow-lg ${isChecked ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
      onClick={handleToggle}
    >
      <div
        className={`w-3 h-3 md:w-6 md:h-6 flex items-center justify-center border-2 rounded-md transition-colors duration-300 ${isChecked ? 'bg-white border-white' : 'bg-white border-blue-500'}`}
      >
        {isChecked && <span className="text-green-500">&#10003;</span>}
      </div>
      {/* <span className="ml-2 md:ml-4 font-medium">
              {isChecked ? 'Completed' : 'Mark as Completed'}
          </span> */}
    </div>
  );
};

