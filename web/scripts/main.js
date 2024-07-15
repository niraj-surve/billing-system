async function addToBill() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const selectedItems = document.getElementById("selected-items");
  selectedItems.innerHTML = ""; // Clear previous selected items

  checkboxes.forEach((checkbox) => {
    const item = checkbox.value;
    const price = parseFloat(checkbox.dataset.price); // Use dataset to get the price
    const li = document.createElement("li");
    li.textContent = `${item} - &#8377;${price}`; // Replace $ with ₹ using HTML entity
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = 1; // Minimum quantity allowed
    quantityInput.value = 1; // Default quantity
    quantityInput.addEventListener("change", () => calculateTotal());
    li.appendChild(quantityInput);
    selectedItems.appendChild(li);
  });

  calculateTotal(); // Update the total price
}

async function fetchMenu() {
  try {
    const menu = await eel.get_menu()();
    const menuDiv = document.getElementById("menu");
    menu.forEach((item) => {
      const card = document.createElement("div");
      card.className = "shadow-lg w-[200px]";
      card.innerHTML = `
            <label class="flex items-center bg-dark text-white font-mulish p-4 cursor-pointer rounded-lg">
              <input type="checkbox" value="${item[0]}" data-price="${item[1]}" onchange="toggleItem('${item[0]}', ${item[1]})" class="mr-2 invisible">
              ${item[0]} - &#8377;${item[1]}
            </label>
          `;
      menuDiv.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
  }
}

function toggleItem(item, price) {
  const checkbox = document.querySelector(`input[type="checkbox"][value="${item}"]`);
  const card = checkbox.closest(".p-4"); // Get the closest parent div with class "p-4"

  if (checkbox.checked) {
    card.classList.add("bg-danger");
  } else {
    card.classList.remove("bg-danger");
  }

  const selectedItems = document.getElementById("selected-items");
  if (checkbox.checked) {
    const li = document.createElement("li");
    li.className = "grid grid-cols-2 items-center";
    const span = document.createElement("span");
    span.className = "text-center w-full";
    span.innerHTML = `${item} - &#8377;${price}`; // Replace $ with ₹ using HTML entity
    li.appendChild(span);
    const quantityInput = document.createElement("input");
    quantityInput.className = "text-center w-full border outline-none py-2 rounded-lg";
    quantityInput.type = "number";
    quantityInput.min = 1; // Minimum quantity allowed
    quantityInput.value = 1; // Default quantity
    quantityInput.addEventListener("change", () => calculateTotal());
    li.appendChild(quantityInput);
    li.id = item.replace(/\s/g, ""); // Replace spaces with an empty string to make it a valid ID
    selectedItems.appendChild(li);
  } else {
    const li = document.getElementById(item.replace(/\s/g, "")); // Retrieve the corresponding list item by its ID
    li.parentNode.removeChild(li);
  }

  calculateTotal(); // Recalculate total price
}

function calculateTotal() {
  const selectedItems = document.querySelectorAll("#selected-items li");
  let totalPrice = 0;

  selectedItems.forEach((li) => {
    const span = li.querySelector("span");
    if (span) {
      const textContent = span.textContent.trim();
      const priceMatch = textContent.match(/₹([0-9.]+)/); // Update regex to match ₹ symbol
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const quantity = parseInt(li.querySelector('input[type="number"]').value);
        totalPrice += price * quantity;
      }
    }
  });

  document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}

document.getElementById("generate-receipt-btn").addEventListener("click", function () {
  generateReceipt();
});

function generateReceipt() {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  const title = "Receipt";
  const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
  doc.text(title, titleX, 10);

  // Selected items
  const selectedItems = document.querySelectorAll("#selected-items li");
  let y = 30;
  selectedItems.forEach((li, index) => {
    const span = li.querySelector("span");
    const quantity = li.querySelector('input[type="number"]').value;
    let textContent = span.textContent.trim();
    textContent = textContent.replace(/₹/g, "Rs. "); // Replace ₹ with "Rupees"
    const itemWidth = doc.getStringUnitWidth(textContent + " x" + quantity) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const itemX = (doc.internal.pageSize.width - itemWidth) / 2;
    doc.text(textContent + " x" + quantity, itemX, y);
    y += 10;
  });

  // Total bill
  const totalPrice = document.getElementById("total-price").textContent;
  const totalPriceWidth = doc.getStringUnitWidth("Total Bill: Rs. " + totalPrice) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  const totalPriceX = (doc.internal.pageSize.width - totalPriceWidth) / 2;
  doc.setFontSize(14);
  doc.text("Total Bill: Rs. " + totalPrice, totalPriceX, y + 10);

  // Thank you message
  const thankYouMsg = "Thank you for visiting us!";
  const thankYouWidth = doc.getStringUnitWidth(thankYouMsg) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  const thankYouX = (doc.internal.pageSize.width - thankYouWidth) / 2;
  doc.text(thankYouMsg, thankYouX, y + 20);

  // Save the PDF
  doc.save("receipt.pdf");
}


window.onload = fetchMenu;