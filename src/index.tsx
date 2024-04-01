import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const App = () => {
  return (
    <div className="cursor-default flex flex-col space-y-4 items-center justify-center h-screen">
      <h1 id="title" className="text-4xl">
        GoXLR Mic Light
      </h1>
      <p id="notice" className="text-xl">
        Configuring app... please wait
      </p>
      <div className="hidden text-white text-8xl"></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
