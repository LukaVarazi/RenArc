document.addEventListener("DOMContentLoaded", function () {
  // Initialize page-specific features only
  initServiceManagement();
  initFileUpload();
  initAddressAutocomplete();
  initFormSubmission();
});

/* ===== FORM SUBMISSION ===== */
function initFormSubmission() {
  const form = document.getElementById("projectForm");
  const thankYouMessage = document.getElementById("thank-you-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    try {
      // Create form data object
      const formData = new FormData();

      // Add all form fields to formData
      const formElements = form.elements;
      for (let element of formElements) {
        if (element.name && element.type !== "file") {
          if (element.type === "checkbox" || element.type === "radio") {
            if (element.checked) {
              formData.append(element.name, element.value);
            }
          } else {
            formData.append(element.name, element.value);
          }
        }
      }

      // Add files to formData
      const fileInput = document.getElementById("fileInput");
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append("files", fileInput.files[i]);
      }

      // Add services data
      const services = [];
      document.querySelectorAll(".service-item").forEach((serviceItem) => {
        const serviceId = serviceItem.id.split("-")[1];
        const service = {
          roomType: document.getElementById(`roomType${serviceId}`).value,
          roomTypeOther:
            document.getElementById(`roomTypeOther${serviceId}`)?.value || "",
          squareFootage: document.getElementById(`squareFootage${serviceId}`)
            .value,
          serviceTypes: [],
        };

        // Get checked service types
        serviceItem
          .querySelectorAll(".service-type:checked")
          .forEach((checkbox) => {
            if (checkbox.value === "other") {
              service.serviceTypes.push(
                document.getElementById(`serviceOther${serviceId}`).value
              );
            } else {
              service.serviceTypes.push(checkbox.value);
            }
          });

        services.push(service);
      });

      formData.append("services", JSON.stringify(services));

      // Submit form data to server
      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Show thank you message
      form.style.display = "none";
      thankYouMessage.style.display = "block";

      // Scroll to thank you message
      thankYouMessage.scrollIntoView({ behavior: "smooth" });

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        document.getElementById("filePreview").innerHTML = "";
        document.getElementById("area").value = "";
        form.style.display = "block";
        thankYouMessage.style.display = "none";
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    }
  });
}

/* ===== SERVICE MANAGEMENT ===== */
function initServiceManagement() {
  const state = {
    serviceCount: 1,
    totalAreaInput: document.getElementById("area"),
    serviceContainer: document.getElementById("additional-services"),
    originalService: document.getElementById("service-1"),
  };

  setupFirstService();
  setupServiceEventListeners();

  function calculateTotalArea() {
    let total = 0;
    document.querySelectorAll('[id^="squareFootage"]').forEach((input) => {
      total += parseFloat(input.value) || 0;
    });
    state.totalAreaInput.value = total.toFixed(2);
  }

  function handleOtherSelection(e) {
    const serviceItem = e.target.closest(".service-item");
    if (!serviceItem) return;

    const serviceId = serviceItem.id.split("-")[1];

    if (
      e.target.classList.contains("service-type") &&
      e.target.value === "other"
    ) {
      toggleElementVisibility(
        serviceItem,
        `#serviceOtherContainer${serviceId}`,
        e.target.checked
      );
    } else if (e.target.id === `roomType${serviceId}`) {
      toggleElementVisibility(
        serviceItem,
        `#roomTypeOtherContainer${serviceId}`,
        e.target.value === "other"
      );
    }
  }

  function toggleElementVisibility(parent, selector, isVisible) {
    const element = parent.querySelector(selector);
    if (element) {
      element.style.display = isVisible ? "block" : "none";
      if (isVisible) element.querySelector("input")?.focus();
    }
  }

  function removeService(e) {
    if (!e.target.closest(".remove-service")) return;

    const serviceItem = e.target.closest(".service-item");
    if (!serviceItem) return;

    if (serviceItem.id !== "service-1") {
      serviceItem.remove();
      state.serviceCount--;
    } else {
      clearServiceInputs(serviceItem);
    }
    calculateTotalArea();
  }

  function clearServiceInputs(serviceItem) {
    serviceItem.querySelectorAll("input, select, textarea").forEach((input) => {
      if (input.type !== "button") input.value = "";
      if (input.type === "checkbox") input.checked = false;
    });
  }

  function addService() {
    state.serviceCount++;
    const newService = state.originalService.cloneNode(true);

    clearServiceInputs(newService);
    updateServiceIds(newService, state.serviceCount);
    hideOtherFields(newService, state.serviceCount);
    addServiceEventListeners(newService, state.serviceCount);

    state.serviceContainer.appendChild(newService);
    newService.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function updateServiceIds(serviceElement, id) {
    serviceElement.id = `service-${id}`;
    serviceElement.querySelectorAll("[id]").forEach((el) => {
      const newId = el.id.replace(/\d+$/, id);
      el.id = newId;
      if (el.labels?.length) el.labels[0].htmlFor = newId;
      if (el.name) el.name = el.name.replace(/\d+$/, id);
    });
  }

  function hideOtherFields(serviceElement, id) {
    [`#serviceOtherContainer${id}`, `#roomTypeOtherContainer${id}`].forEach(
      (selector) => {
        const field = serviceElement.querySelector(selector);
        if (field) field.style.display = "none";
      }
    );
  }

  function addServiceEventListeners(serviceElement, id) {
    const otherCheckbox = serviceElement.querySelector(`#other${id}`);
    if (otherCheckbox) {
      otherCheckbox.addEventListener("change", () => {
        toggleElementVisibility(
          serviceElement,
          `#serviceOtherContainer${id}`,
          otherCheckbox.checked
        );
      });
    }

    const roomTypeSelect = serviceElement.querySelector(`#roomType${id}`);
    if (roomTypeSelect) {
      roomTypeSelect.addEventListener("change", () => {
        toggleElementVisibility(
          serviceElement,
          `#roomTypeOtherContainer${id}`,
          roomTypeSelect.value === "other"
        );
      });
    }
  }

  function setupFirstService() {
    setupElementListener("#roomType1", "change", () => {
      toggleElementVisibility(
        document,
        "#roomTypeOtherContainer1",
        document.getElementById("roomType1").value === "other"
      );
    });

    setupElementListener("#other1", "change", () => {
      toggleElementVisibility(
        document,
        "#serviceOtherContainer1",
        document.getElementById("other1").checked
      );
    });
  }

  function setupElementListener(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, handler);
  }

  function setupServiceEventListeners() {
    document.addEventListener("change", (e) => {
      handleOtherSelection(e);
      if (e.target.matches('[id^="squareFootage"]')) calculateTotalArea();
    });

    document.addEventListener("click", removeService);
    document
      .getElementById("addServiceBtn")
      .addEventListener("click", addService);
  }
}

/* ===== FILE UPLOAD ===== */
function initFileUpload() {
  const config = {
    maxFiles: 10,
    maxSizeMB: 100,
    uploadArea: document.getElementById("uploadArea"),
    fileInput: document.getElementById("fileInput"),
    filePreview: document.getElementById("filePreview"),
  };

  setupFileUploadEventListeners();

  function handleFiles(files) {
    const currentCount =
      config.filePreview.querySelectorAll(".file-preview-item").length;
    const remainingSlots = config.maxFiles - currentCount;

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more file(s)`);
      return;
    }

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        if (file.size > config.maxSizeMB * 1024 * 1024) {
          alert(`File "${file.name}" is too large (max ${config.maxSizeMB}MB)`);
          return;
        }

        if (!isValidImage(file)) {
          alert(`File "${file.name}" is not a supported image format`);
          return;
        }

        createFilePreview(file);
      });
  }

  function isValidImage(file) {
    return (
      file.type.match("image.*") || file.name.match(/\.(jpe?g|png|heic|heif)$/i)
    );
  }

  function createFilePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewItem = document.createElement("div");
      previewItem.className = "file-preview-item";
      previewItem.innerHTML = `
        <div class="file-thumbnail">
          <img src="${e.target.result}" alt="${file.name}">
          <button type="button" class="btn btn-sm btn-danger remove-file">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="file-info">
          <span>${file.name}</span>
          <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
        </div>
      `;
      config.filePreview.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
  }

  function setupFileUploadEventListeners() {
    config.uploadArea.addEventListener("click", () => config.fileInput.click());

    config.uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      config.uploadArea.classList.add("dragover");
    });

    config.uploadArea.addEventListener("dragleave", () => {
      config.uploadArea.classList.remove("dragover");
    });

    config.uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      config.uploadArea.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        config.fileInput.files = e.dataTransfer.files;
        handleFiles(config.fileInput.files);
      }
    });

    config.fileInput.addEventListener("change", () => {
      if (config.fileInput.files.length) handleFiles(config.fileInput.files);
    });

    config.filePreview.addEventListener("click", (e) => {
      if (e.target.closest(".remove-file")) {
        e.target.closest(".file-preview-item").remove();
      }
    });
  }
}

/* ===== ADDRESS AUTOCOMPLETE ===== */
function initAddressAutocomplete() {
  const elements = {
    addressInput: document.getElementById("address"),
    autocompleteDropdown: document.getElementById("address-autocomplete"),
    cityInput: document.getElementById("city"),
    stateInput: document.getElementById("state"),
    zipInput: document.getElementById("zipCode"),
    aptInput: document.getElementById("aptSuite"),
  };

  const US_STATES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  let currentFocus = -1;

  function createStateDropdown() {
    const stateSelect = document.createElement("select");
    stateSelect.id = "state";
    stateSelect.className = "form-control";
    stateSelect.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select State";
    stateSelect.appendChild(defaultOption);

    US_STATES.forEach((state) => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    });

    elements.stateInput.replaceWith(stateSelect);
    elements.stateInput = stateSelect;
  }

  function debounce(func, delay) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), delay);
    };
  }

  async function fetchAddressSuggestions(query) {
    try {
      const response = await fetch("/api/address/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      return [];
    }
  }

  function showAutocompleteResults(results) {
    if (!results || results.length === 0) {
      elements.autocompleteDropdown.style.display = "none";
      return;
    }

    elements.autocompleteDropdown.innerHTML = "";
    elements.autocompleteDropdown.style.display = "block";

    results.forEach((result, i) => {
      const item = document.createElement("div");
      item.className = `autocomplete-item ${i === 0 ? "active" : ""}`;
      item.innerHTML = `
        <strong>${result.street || result.address}</strong>
        <div class="text-muted small">${result.city}, ${result.state} ${
        result.zip
      }</div>
      `;
      item.addEventListener("click", () => selectAddress(result));
      elements.autocompleteDropdown.appendChild(item);
    });
  }

  function selectAddress(result) {
    elements.addressInput.value =
      result.address || `${result.street_number} ${result.route}` || "";
    elements.cityInput.value = result.city || result.locality || "";
    elements.stateInput.value =
      result.state || result.administrative_area_level_1 || "";
    elements.zipInput.value = result.zip || result.postal_code || "";
    elements.aptInput.value = result.apt || result.subpremise || "";
    closeAllLists();
  }

  function setActive(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("active");
  }

  function removeActive(items) {
    items.forEach((item) => item.classList.remove("active"));
  }

  function closeAllLists() {
    elements.autocompleteDropdown.style.display = "none";
    currentFocus = -1;
  }

  function setupAutocompleteEventListeners() {
    elements.addressInput.addEventListener(
      "input",
      debounce(async function () {
        const query = this.value.trim();
        closeAllLists();

        if (query.length < 3) return;

        const results = await fetchAddressSuggestions(query);
        showAutocompleteResults(results);
      }, 300)
    );

    elements.addressInput.addEventListener("keydown", function (e) {
      const items =
        elements.autocompleteDropdown.querySelectorAll(".autocomplete-item");

      if (e.key === "ArrowDown") {
        e.preventDefault();
        currentFocus++;
        setActive(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentFocus--;
        setActive(items);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus > -1 && items.length > 0) {
          items[currentFocus].click();
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (
        !elements.addressInput.contains(e.target) &&
        !elements.autocompleteDropdown.contains(e.target)
      ) {
        closeAllLists();
      }
    });
  }

  createStateDropdown();
  setupAutocompleteEventListeners();
}
