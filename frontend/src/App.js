import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [daten, setDaten] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/daten');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setDaten(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Hier kannst du weitere Schritte einfügen, z.B. einen Fallback für daten setzen
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Meine Tabelle</h1>
      </header>
      <main>
        <table>
          <thead>
            <tr>
              <th>Überschrift 1</th>
              <th>Überschrift 2</th>
              <th>Überschrift 3</th>
              <th>Überschrift 4</th>
              <th>Überschrift 5</th>
              <th>Überschrift 6</th>
            </tr>
          </thead>
          <tbody>
            {daten.map((eintrag, index) => (
              <tr key={index}>
                <td>{eintrag.feld1}</td>
                <td>{eintrag.feld2}</td>
                <td>{eintrag.feld3}</td>
                <td>{eintrag.feld4}</td>
                <td>{eintrag.feld5}</td>
                <td>{eintrag.feld6}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;
