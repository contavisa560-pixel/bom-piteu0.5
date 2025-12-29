const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const sessionId = '6950662997beeb26ba71c2a9';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDAwYzEwN2FiYWI1MTQ3Y2NlMmUwZiIsImlhdCI6MTc2Njg3NjM3NSwiZXhwIjoxNzY3NDgxMTc1fQ.HQ7hZfdiHk-Y9JF3_xD-DLEClG3KBG8c-aKCAvJOtNc';

async function sendRecipeRequest() {
  const content = "quero cozinhar uma torta";

  const res = await fetch("http://localhost:5000/api/recipe/session/message/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId, content })
  });

  const data = await res.json();
  console.log(data);
}

sendRecipeRequest();
