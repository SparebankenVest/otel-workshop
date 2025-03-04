document.getElementById('button1').addEventListener('click', () => {
  const backendUrl = process.env.BACKEND_URL || 'https://localhost:8080';
  fetch(backendUrl + '/fact')
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
      console.error('Error clicking button 1:', error);
      alert('An error occurred while clicking button 1');
    });
});
