import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <p className='testClass'>this is App.jsx</p>
      <button className="btn btn-outline">Default</button>
      <button className="btn btn-outline btn-primary">Primary</button>
      <button className="btn btn-outline btn-secondary">Secondary</button>
      <button className="btn btn-outline btn-accent">Accent</button>
    </>
  )
}

export default App
