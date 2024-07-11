import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const App = () => {
  return (
    <div className="cursor-default flex flex-col items-center justify-center h-screen">
      <div
        id="cA"
        className="flex flex-col space-y-4 h-1/2 w-full items-center justify-center"
      >
        <h1 id="titleA" className="text-4xl">
          GoXLR Mic Light
        </h1>
        <p id="noticeA" className="text-xl">
          Configuring... A
        </p>
      </div>
      <div
        id="cB"
        className="flex flex-col space-y-4 h-1/2 w-full items-center justify-center"
      >
        <h1 id="titleB" className="text-4xl">
          GoXLR Mic Light
        </h1>
        <p id="noticeB" className="text-xl">
          Configuring... B
        </p>
      </div>
      <p className="text-8xl text-black hidden bg-red-500"></p>
      <p className="text-8xl text-white hidden bg-white-500"></p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
