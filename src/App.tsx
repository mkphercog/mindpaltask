import { FormEvent, useEffect, useState } from "react";
import { INITIAL_DATA } from "./App.constants";

import "./App.css";
import { UserDataType } from "./App.types";
import { fetchUsersData, insertUserDataToSupabase } from "./App.helpers";

function App() {
  const [userData, setUserData] = useState<UserDataType>(INITIAL_DATA);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [displayUserData, setDisplayUserData] = useState<UserDataType[] | []>(
    []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { name, surname, secret_key } = userData;

    if (!name || !surname || !secret_key) {
      setErrorMsg("All fields must be filled!");

      return;
    }

    insertUserDataToSupabase(userData);
    setUserData(INITIAL_DATA);
  };

  useEffect(() => {
    (async () => {
      const data = await fetchUsersData();
      setDisplayUserData(data);
    })();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="inputContainer">
          <label htmlFor="userName">User name</label>
          <input
            id="userName"
            type="text"
            value={userData.name}
            onChange={(e) => {
              setErrorMsg(null);
              setUserData((prev) => ({ ...prev, name: e.target.value }));
            }}
          />
        </div>
        <div className="inputContainer">
          <label htmlFor="userSurname">User surname</label>
          <input
            id="userSurname"
            type="text"
            value={userData.surname}
            onChange={(e) => {
              setErrorMsg(null);
              setUserData((prev) => ({ ...prev, surname: e.target.value }));
            }}
          />
        </div>
        <div className="inputContainer">
          <label htmlFor="userSecretKey">User secret_key</label>
          <input
            id="userSecretKey"
            type="number"
            value={userData.secret_key}
            onChange={(e) => {
              setErrorMsg(null);
              setUserData((prev) => ({ ...prev, secret_key: e.target.value }));
            }}
          />
        </div>
        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        <button>Submit form</button>
      </form>

      <ul>
        {displayUserData.map((user, index) => (
          <li key={index}>
            <p>
              User full name:{" "}
              <span>
                {user.name} {user.surname}
              </span>
            </p>
            <p>
              User secret_key: <span>{user.secret_key}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
