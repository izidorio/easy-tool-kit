import { Button } from '@renderer/components/ui/button'

export function Home() {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="p-2">
      <h1>Home</h1>
      <Button onClick={ipcHandle}>Ping</Button>
    </div>
  )
}
