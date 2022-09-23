import { useState } from 'react';

import './App.css';
import Navigation from './components/navigation/navigation.component';
import Logo from './components/logo/logo.component';
import ImageLinkForm from './components/imagelinkform/imagelinkform.component';
import Rank from './components/rank/rank.component';
import FaceRecognition from './components/facerecognition/facerecognition.component';
import Clarifai from 'clarifai';

function App() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [box, setBox] = useState({});

  const handleChange = (event) => {
    const { value } = event.target;
    setInput(value);
    console.log(input);
  };

  const app = new Clarifai.App({
    apiKey: '71bfa7ea80ec433dabf62b2bb08bcefa'
  });

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  };

  const handleSubmit = () => {
    setImageUrl(input);
    app.models
      .predict(
        // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
        // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
        // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
        // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
        // is to use a different version of their model that works like the ones found here: https://github.com/Clarifai/clarifai-javascript/blob/master/src/index.js
        // so you would change from:
        // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
        // to:
        // .predict('53e1df302c079b3db8a0a36033ed2d15', this.state.input)
        Clarifai.FACE_DETECT_MODEL,
        input)
      .then(response => {
        console.log('hi', response)
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="App">
      <Navigation />
      <Logo />
      <Rank />
      <ImageLinkForm handleChange={handleChange} />
      <FaceRecognition imageUrl={imageUrl} />
    </div>
  );
}

export default App;
