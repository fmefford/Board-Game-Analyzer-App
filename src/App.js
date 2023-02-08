import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [username, setUsername] = useState("");
  const [collection, setCollection] = useState(null);
  const [time, setTime] = useState(.5);
  const [players, setPlayers] = useState(1);
  const [complexity, setComplexity] = useState(1);

  function inputBox() {
    async function getCollection() {
      return await fetch(`https://boardgamegeek.com/xmlapi/collection/${username}`)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    };

    async function handleSubmit(event) {
      event.preventDefault();
      const data = await getCollection();
      setCollection(data);
      console.log(data);
    }
  
    function handleChange(event) {
      setUsername(event.target.value);
    }

    return (
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" onChange={handleChange}/>
        <input type="submit"/>
      </form>
    );
  }

  function userPrefs() {
    function handleChange(event, setter) {
      setter(Number(event.target.value));
    }

    function handleClick() {
      console.log(time, players, complexity);
    }

    return (<><div>
              Welcome {username}! 
              Tell us about what you would like to play.
            </div><br/>
            <label htmlFor="time">How much time do you have?</label><br/>
            <select name="time" value={time} onChange={(e) => handleChange(e, setTime)}>
              <option value="0.5">30 mins</option>
              <option value="1">1 hr</option>
              <option value="1.5">1 hr 30 mins</option>
              <option value="2">2 hrs</option>
              <option value="2.5">2 hr 30 mins</option>
              <option value="3">3 hrs</option>
              <option value="3.5">3 hr 30 mins</option>
              <option value="4">4 hrs</option>
            </select><br/>
            
            <label htmlFor="players">How many players do you have?</label><br/>
            <select name="time" value={players} onChange={(e) => handleChange(e, setPlayers)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select><br/>
            
            <label htmlFor="complexity">How complex of a game would you like to play?</label><br/>
            <select name="time" value={complexity} onChange={(e) => handleChange(e, setComplexity)}>
              <option value="1">Very simple</option>
              <option value="2">Somewhat simple</option>
              <option value="3">Slightly Complex</option>
              <option value="4">Somewhat complex</option>
              <option value="5">Very complex</option>
            </select><br/><br/>

            <button type="button" onClick={handleClick}>Find Games!</button></>);
  }

  if (collection !== null) {
    return (userPrefs());
  }
  return (inputBox());
}

export default App;
