import { useEffect, useState } from "react";

type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: false;
};

export type AppProps = {
  message: string;
}

function App({ message }: AppProps) {
  const [count, setCount] = useState(20);
  const [data, setData] = useState<Todo | undefined>();

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos/4")
      .then((response) => response.json())
      .then((json) => setData(json));
  }, []);

  return (
    <>
      <h2 className="text-xl mb-8">{message}</h2>
      <button className="btn" onClick={() => setCount((prev) => prev + 1)}>
        Click me! - {count}
      </button>
      {data ? (
        <div className="flex justify-center items-center mt-2">
          <header>
            {data.title}
          </header>
          <input type="checkbox" checked={data.completed} onChange={() => {}} />
        </div>
      ) : <p>Loading...</p>}
    </>
  );
}

export default App;
