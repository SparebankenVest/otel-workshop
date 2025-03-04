document.getElementById('button1').addEventListener('click', () => {
  fetch('https://otel-api.svai.dev/fact')
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
      console.error('Error clicking button 1:', error);
      alert('An error occurred while clicking button 1');
    });
});
