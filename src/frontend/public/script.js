document.getElementById('button1').addEventListener('click', () => {
  fetch('/api/button1')
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
      console.error('Error clicking button 1:', error);
      alert('An error occurred while clicking button 1');
    });
});

document.getElementById('button2').addEventListener('click', () => {
  fetch('/api/button2')
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
      console.error('Error clicking button 2:', error);
      alert('An error occurred while clicking button 2');
    });
});

document.getElementById('button3').addEventListener('click', () => {
  fetch('/api/button3')
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
      console.error('Error clicking button 3:', error);
      alert('An error occurred while clicking button 3');
    });
});
