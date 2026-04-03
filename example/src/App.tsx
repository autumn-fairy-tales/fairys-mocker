import './App.css';


const App = () => {

  const onClick = () => {
    const origin = window.location.origin;
    fetch(origin + "/api/test", { 'method': 'POST' }).then(res => res.json()).then(data => console.log(data));
  }

  const onClick2 = () => {
    // fetch("http://localhost:9009/ws3t", { 'method': 'POST' }).then(res => res.json()).then(data => console.log(data));
    const origin = window.location.origin;
    console.log(origin);
    fetch(origin + "/ws3t", { 'method': 'POST' }).then(res => res.json()).then(data => console.log(data));
  }

  return (
    <div className="content">
      <button onClick={onClick}>点击</button>
      <button onClick={onClick2}>点击2</button>
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
