function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  return (
    <div className="flex w-screen h-screen bg-gray-500">
      <div className="items-center justify-center">Bizuário</div>
      <button onClick={ipcHandle}>ping</button>
    </div>
  );
}

export default App;
