import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import introImage from '../../pubg5.jpg';

export default function IntroScreen() {
  const { setGameState, setPlayer, playerName } = useGameStore();
  const [scene, setScene] = useState(0);
  const [name, setName] = useState(playerName);
  const scenes = [
    { overline: 'Nepal Championship · Final Day', title: 'Tournament results locked', body: 'The PUBG operations database failed before publication.' },
    { overline: 'Profile recovered', title: 'One player is missing', body: 'Enter your name to claim ID 784219. Your progress stays on this device.' },
    { overline: 'System alert', title: 'Your data is corrupted', body: 'Duplicate identity. Broken inventory. Unreliable match history.' },
    { overline: 'Survival mission', title: 'Reach final extraction', body: 'Repair your profile data zone by zone. Publish the tournament results.' },
  ];
  const current = scenes[Math.min(scene, scenes.length - 1)];

  return (
    <div className="cinematic-intro">
      <div className="cinematic-image" style={{ backgroundImage: `url(${introImage})` }} aria-hidden="true" />
      <div className="cinematic-grid" aria-hidden="true" />
      <div className="cinematic-content" key={scene}>
        {scene < scenes.length ? (
          <>
            <p>{current.overline}</p>
            <h1>{current.title}</h1>
            <div>{current.body}</div>
            <button type="button" onClick={() => setScene((value) => value + 1)}>
              Continue
            </button>
          </>
        ) : (
          <>
            <p>Create your survivor profile</p>
            <h1>{name.trim() || 'Your name'}</h1>
            <div className="survivor-profile">
              <div><span>ID</span><strong>784219</strong></div>
              <div><span>Level</span><strong>62</strong></div>
              <div><span>Matches</span><strong>428</strong></div>
              <div><span>Wins</span><strong>37</strong></div>
              <div><span>K/D</span><strong>4.82</strong></div>
              <div><span>Rank</span><strong>Crown III</strong></div>
              <div><span>Season</span><strong>22</strong></div>
              <div><span>Clan</span><strong>SHADOW</strong></div>
            </div>
            <form
              className="player-name-form"
              onSubmit={(event) => {
                event.preventDefault();
                setPlayer(name.trim());
                setGameState('MAP');
              }}
            >
              <label htmlFor="player-name">Enter your real name</label>
              <input
                id="player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={30}
                placeholder="Example: Shubham"
                autoComplete="name"
                required
              />
              <button type="submit" className="launch-button">
                Open the training mission
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
