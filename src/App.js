import './App.css';
import React, {useState, useEffect} from 'react';
import AsyncRetry from 'async-retry';
import ReactDOM from 'react-dom/client';

function App() {
  const [username, setUsername] = useState("");
  const [collection, setCollection] = useState(null);
  const [time, setTime] = useState("30");
  const [players, setPlayers] = useState("1");
  const [complexity, setComplexity] = useState("1");

  function inputBox() {
    async function getCollection() {
      //retrieves user information
      let xmlCollection = await fetch(`https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"));

      let jsonGames = [];
      const gamesArray = [...xmlCollection.documentElement.getElementsByTagName('item')]; 
      console.log(gamesArray);
      
      async function processGameData(){
        for (let index = 0; index < gamesArray.length; index++){
          let id = gamesArray[index].getAttribute('objectid');
          
          //retrieves additional game data with up to 5 attempts to avoid 429 errors
          let extraGameData;
          await AsyncRetry(
            async () => {
              extraGameData = await fetch(`https://boardgamegeek.com/xmlapi2/things?id=${id}&stats=1`)
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"));
            }, 
            {
              retries: 10,
              minTimeout: 5000,
            }
          );
          
          if (extraGameData === null){
            return index;
          }

          jsonGames.push({
            id,
            time: extraGameData.querySelector('playingtime').getAttribute('value'),
            name: extraGameData.querySelector('name').getAttribute('value'),
            weight: extraGameData.querySelector('averageweight').getAttribute('value'),
            minplayers: extraGameData.querySelector('minplayers').getAttribute('value'),
            maxplayers: extraGameData.querySelector('maxplayers').getAttribute('value'),
            bggrating: extraGameData.querySelector('statistics').querySelector('ratings').querySelector('average').getAttribute('value'),
          });
        }
        return gamesArray.length;
      }
  
      await processGameData();
      return jsonGames;
    };

    async function handleSubmit(event) {
      event.preventDefault();
      let jsonGames = await getCollection();
      await setCollection(jsonGames);
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

    return (<div key="userprefs"><div>
              Welcome {username}! 
              Tell us about what you would like to play.
            </div><br/>
            <label htmlFor="time">How much time do you have?</label><br/>
            <select name="time" value={time} onChange={(e) => handleChange(e, setTime)}>
              <option value="30">30 mins</option>
              <option value="60">1 hr</option>
              <option value="90">1 hr 30 mins</option>
              <option value="120">2 hrs</option>
              <option value="150">2 hr 30 mins</option>
              <option value="180">3 hrs</option>
              <option value="210">3 hr 30 mins</option>
              <option value="240">4 hrs</option>
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

            <button type="button" onClick={handleClick}>Find Games!</button></div>);
  }

  function collectionTable() {
    let filteredGames = structuredClone(collection);
    return (
      <table key="collection">
        <thead>
          <tr>
            <th>Game</th>
            <th>Playing Time</th>
            <th>Players</th>
            <th>Weight</th>
            <th>BGG Rating</th>
          </tr>
        </thead>
        {filteredGames.map((game, index) => {
          let id = game["id"];
          let name = game["name"];
          let playTime = game["time"];
          let weight = game["weight"];
          let minplayers = game["minplayers"];
          let maxplayers = game["maxplayers"];
          let bggrating = game["bggrating"]

          if (Number(playTime) > Number(time) || Number(weight) > Number(complexity) || Number(minplayers) > Number(players) || Number(maxplayers) < Number(players)){
            return (<></>);
          }
          return (<tbody key={id}>
            <tr key={index}>
              <td>{name}</td>
              <td>{playTime}</td>
              <td>{minplayers} - {maxplayers}</td>
              <td>{weight}</td>
              <td>{bggrating}</td>
            </tr>
          </tbody>);
        })}
      </table>
    );
    
  }

  if (collection !== null) {
    console.log(collection);
    return ([userPrefs(), collectionTable()]);
  }
  else {
    return (inputBox());
  }
}

export default App;
