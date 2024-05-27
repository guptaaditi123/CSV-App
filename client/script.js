const socket = io();

document.getElementById('uploadButton').addEventListener('click', () => {
  const input = document.getElementById('csvFileInput');
  const file = input.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      window.uploadedData = data; // Store data globally to manage pagination
      displayData(data, 0, rowsPerPage);
      setupPagination(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});

socket.on('progress', (data) => {
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  progressBar.value = data.percentage;
  progressPercentage.textContent = `${Math.round(data.percentage)}%`;
});

const rowsPerPage = 10;
let currentPage = 1;

function displayData(data, startIndex, endIndex) {
  const tableHeader = document.getElementById('tableHeader');
  const tableBody = document.getElementById('tableBody');

  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      tableHeader.appendChild(th);
    });

    data.slice(startIndex, endIndex).forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header];
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }
}

function setupPagination(data) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.addEventListener('click', () => paginateData(data, 'previous'));
  pagination.appendChild(prevButton);

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', () => paginateData(data, 'next'));
  pagination.appendChild(nextButton);
}

function paginateData(data, direction) {
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  if (direction === 'previous' && currentPage > 1) {
    currentPage--;
  } else if (direction === 'next' && currentPage < totalPages) {
    currentPage++;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  displayData(data, startIndex, endIndex);
}

document.getElementById('calculateButton').addEventListener('click', () => {
  const basePrice = parseFloat(document.getElementById('basePrice').value) || 50; // Default base price if not provided
  const pricePerCreditLine = parseFloat(document.getElementById('pricePerCreditLine').value) || 10; // Default price per credit line if not provided
  const pricePerCreditScorePoint = parseFloat(document.getElementById('pricePerCreditScorePoint').value) || 5; // Default price per credit score point if not provided

  const pricingList = document.getElementById('pricingList');
  pricingList.innerHTML = '';

  // Apply pagination to pricing list
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  window.uploadedData.slice(startIndex, endIndex).forEach(item => {
    const creditScore = parseInt(item.CreditScore, 10);
    const creditLines = parseInt(item.CreditLines, 10);

    if (!isNaN(creditScore) && !isNaN(creditLines)) {
      const subscriptionPrice = basePrice + (pricePerCreditLine * creditLines) + (pricePerCreditScorePoint * creditScore);
      const li = document.createElement('li');
      li.textContent = `Credit Score: ${creditScore}, Credit Lines: ${creditLines}, Subscription Price: $${subscriptionPrice.toFixed(2)}`;
      pricingList.appendChild(li);
    }
  });
});
