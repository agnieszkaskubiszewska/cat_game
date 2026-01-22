import { useEffect, useState } from "react";

export default function Timer() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);
  return <div>
<h1>Timer</h1>
    <p>Time: {time}</p>
  </div>;
}