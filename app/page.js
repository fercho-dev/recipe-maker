"use client";

import { useState } from 'react';

// TODO: remove form after testing

function Home() {
  const [image, setImage] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        body: JSON.stringify({ url: image }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error in response: ${response.status}`);
      }

      let textResponse = "";
      const reader = response.body.getReader();
      let { done, value } = await reader.read();
      while (!done) {
        textResponse += new TextDecoder("utf-8").decode(value);
        ({ done, value } = await reader.read());
      }

      setResult(textResponse);
    } catch (error) {
      console.error('Error al hacer fetch a la API:', error);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="url" placeholder="URL de la imagen" value={image} onChange={(e) => setImage(e.target.value)} required />
        <button type="submit">Analizar imagen</button>
      </form>

      {result && <div>Resultado: {JSON.stringify(result)}</div>}
    </div>
  );
}

export default Home;
