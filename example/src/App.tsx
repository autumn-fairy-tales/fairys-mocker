import './App.css';


const App = () => {

  const onClick = () => {
    fetch("http://localhost:3000/api/test", { 'method': 'POST' }).then(res => res.json()).then(data => console.log(data));
  }


  return (
    <div className="content">
      <button onClick={onClick}>点击</button>
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
