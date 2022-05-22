import {useState} from "react";

const Progress = (done: string) => {
  const [style, setStyle] = useState({});

  setTimeout(() => {
    const newStyle = {
      opacity: 1,
      width: `${done}%`,
    };

    setStyle(newStyle);
  }, 2000);

  return (
    <div className="progress">
      <div className="progress-done" style={style}></div>
    </div>
  );
};

export default Progress;
