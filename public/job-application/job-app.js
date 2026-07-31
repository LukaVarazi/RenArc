// Job Application Script
document.addEventListener("DOMContentLoaded", function () {
  // Get position from URL parameters OR from sessionStorage
  let position = "Project Manager"; // default fallback

  const urlParams = new URLSearchParams(window.location.search);
  const urlPosition = urlParams.get("position");

  // Check if we have a stored position from the careers page
  const storedPosition = sessionStorage.getItem("selectedJobPosition");

  if (urlPosition) {
    position = decodeURIComponent(urlPosition);
  } else if (storedPosition) {
    position = storedPosition;
    // Clear it after use so it doesn't persist on page refresh
    sessionStorage.removeItem("selectedJobPosition");
  }

  document.getElementById("position-title").textContent = position;

  // Handle file upload display
  document.getElementById("resume").addEventListener("change", function (e) {
    const fileName = e.target.files[0].name;
    document.getElementById(
      "resume-name"
    ).textContent = `Selected file: ${fileName}`;
  });

  // Show travel percentage field if willing to travel is yes
  document.querySelectorAll('input[name="travel"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const travelPercentageField = document.getElementById(
        "travelPercentageField"
      );
      travelPercentageField.style.display =
        this.value === "yes" ? "block" : "none";
    });
  });

  // Show veteran types if veteran status is yes
  document.querySelectorAll('input[name="veteranStatus"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const veteranTypes = document.getElementById("veteranTypes");
      veteranTypes.style.display = this.value === "veteran" ? "block" : "none";
    });
  });

  // Validate start date (cannot be in the past)
  const startDateInput = document.getElementById("startDate");
  if (startDateInput) {
    startDateInput.addEventListener("change", function () {
      validateStartDate(this);
    });
  }

  // Initialize date validation for existing entries
  const experienceEntries = document.querySelectorAll(".experience-entry");
  experienceEntries.forEach((entry) => {
    addDateValidationListeners(entry);
  });

  // Initialize step indicators
  updateStepIndicators(1);

  // Initialize and update on window resize
  updateStepIndicators(currentStep);
  window.addEventListener("resize", function () {
    updateStepIndicators(currentStep);
  });
});

// Initialize variables
let currentStep = 1;
const totalSteps = 4;
let experienceCounter = 1;
let educationCounter = 1;
let certificationCounter = 1;

// Function to validate start date (cannot be in the past)
function validateStartDate(dateInput) {
  const selectedDate = new Date(dateInput.value);
  const today = new Date();

  if (selectedDate < today) {
    dateInput.setCustomValidity("Start date cannot be in the past");
    dateInput.classList.add("is-invalid");
    return false;
  } else {
    dateInput.setCustomValidity("");
    dateInput.classList.remove("is-invalid");
    return true;
  }
}

// Function to make radio button names unique for each entry
function makeRadioNamesUnique(entry, prefix, counter) {
  const radioGroups = entry.querySelectorAll('input[type="radio"]');
  const checkboxes = entry.querySelectorAll('input[type="checkbox"]');

  radioGroups.forEach((radio) => {
    const originalName = radio.getAttribute("name");
    if (originalName) {
      radio.setAttribute("name", `${prefix}_${counter}_${originalName}`);
      // Update the for attribute of the corresponding label
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (label) {
        radio.id = `${prefix}_${counter}_${radio.id}`;
        label.setAttribute("for", radio.id);
      }
    }
  });

  checkboxes.forEach((checkbox) => {
    const originalName = checkbox.getAttribute("name");
    if (originalName) {
      checkbox.setAttribute("name", `${prefix}_${counter}_${originalName}`);
      // Update the for attribute of the corresponding label
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      if (label) {
        checkbox.id = `${prefix}_${counter}_${checkbox.id}`;
        label.setAttribute("for", checkbox.id);
      }
    }
  });
}

// Function to update the step indicators with pixel precision
function updateStepIndicators(step) {
  const indicators = document.querySelectorAll(".step-indicator");
  const lineFill = document.querySelector(".progress-line-fill");
  const container = document.querySelector(".progress-steps-container");

  if (!lineFill || !container) return;

  // Get the positions of the first and last circles
  const firstCircle = container.querySelector(".step-icon");
  const lastCircle = container.querySelector(
    ".step-indicator:last-child .step-icon"
  );

  if (!firstCircle || !lastCircle) return;

  const firstCircleRect = firstCircle.getBoundingClientRect();
  const lastCircleRect = lastCircle.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Calculate the exact start and end points for the line
  const lineStart =
    firstCircleRect.left + firstCircleRect.width / 2 - containerRect.left;
  const lineEnd =
    lastCircleRect.left + lastCircleRect.width / 2 - containerRect.left;
  const lineLength = lineEnd - lineStart;

  // Calculate the distance between each step
  const segmentLength = lineLength / (indicators.length - 1);

  // Calculate the fill width to stop at the center of each step
  let fillWidth;
  switch (step) {
    case 1:
      fillWidth = 0; // At first step
      break;
    case 2:
      fillWidth = segmentLength; // At second step
      break;
    case 3:
      fillWidth = segmentLength * 2; // At third step
      break;
    case 4:
      fillWidth = lineLength; // At fourth step
      break;
    default:
      fillWidth = 0;
  }

  // Position and size the lines correctly
  const progressLine = document.querySelector(".progress-line");
  if (progressLine) {
    progressLine.style.left = `${lineStart}px`;
    progressLine.style.width = `${lineLength}px`;
  }

  lineFill.style.left = `${lineStart}px`;
  lineFill.style.width = `${fillWidth}px`;

  // Update the step indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.remove("active", "completed");

    if (index + 1 < step) {
      indicator.classList.add("completed");
    } else if (index + 1 === step) {
      indicator.classList.add("active");
    }
  });

  // Also update progress bar if it exists
  updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", progress);
  }
}

// Function to validate experience dates
function validateExperienceDates(experienceEntry) {
  const startDateInput = experienceEntry.querySelector(
    'input[name="startDate"]'
  );
  const endDateInput = experienceEntry.querySelector('input[name="endDate"]');
  const currentJobCheckbox = experienceEntry.querySelector(
    'input[type="checkbox"][name$="currentJob"]'
  );

  // If it's not a current job and both dates are provided
  if (
    !currentJobCheckbox?.checked &&
    startDateInput.value &&
    endDateInput.value
  ) {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (endDate < startDate) {
      endDateInput.setCustomValidity("End date cannot be before start date");
      endDateInput.classList.add("is-invalid");
      return false;
    } else {
      endDateInput.setCustomValidity("");
      endDateInput.classList.remove("is-invalid");
    }
  } else {
    endDateInput.setCustomValidity("");
    endDateInput.classList.remove("is-invalid");
  }
  return true;
}

// Validate step before proceeding
function validateStep(step) {
  const stepElement = document.getElementById(`step${step}`);
  const inputs = stepElement.querySelectorAll("input, select, textarea");
  let isValid = true;

  // Validate start date in step 1
  if (step === 1) {
    const startDateInput = document.getElementById("startDate");
    if (startDateInput && startDateInput.value) {
      if (!validateStartDate(startDateInput)) {
        isValid = false;
      }
    }
  }

  // Validate all experience entries in step 2
  if (step === 2) {
    const experienceEntries = stepElement.querySelectorAll(".experience-entry");
    experienceEntries.forEach((entry) => {
      if (!validateExperienceDates(entry)) {
        isValid = false;
      }
    });
  }

  // Check each input for validity
  inputs.forEach((input) => {
    if (input.hasAttribute("required") && !input.value) {
      input.classList.add("is-invalid");
      isValid = false;
    } else if (input.hasAttribute("pattern") && input.value) {
      const pattern = new RegExp(input.getAttribute("pattern"));
      if (!pattern.test(input.value)) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
      }
    } else if (input.type === "email" && input.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value)) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
      }
    } else if (
      input.type === "date" &&
      input.value &&
      input.id !== "startDate"
    ) {
      const selectedDate = new Date(input.value);
      const today = new Date();
      if (selectedDate > today) {
        input.classList.add("is-invalid");
        input.setCustomValidity("Date cannot be in the future");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
        input.setCustomValidity("");
      }
    } else {
      input.classList.remove("is-invalid");
    }

    // Check custom validation messages
    if (input.validationMessage && !input.validity.valid) {
      input.classList.add("is-invalid");
      isValid = false;
    }
  });

  // Special validation for radio button groups (excluding experience entries)
  const radioGroups = stepElement.querySelectorAll(
    'input[type="radio"][required]:not([name*="experience_"]):not([name*="education_"]):not([name*="certification_"])'
  );
  radioGroups.forEach((radio) => {
    const groupName = radio.name;
    const groupChecked = stepElement.querySelector(
      `input[name="${groupName}"]:checked`
    );
    if (!groupChecked) {
      // Add invalid class to all radios in the group
      stepElement
        .querySelectorAll(`input[name="${groupName}"]`)
        .forEach((r) => {
          r.classList.add("is-invalid");
        });
      isValid = false;
    } else {
      // Remove invalid class from all radios in the group
      stepElement
        .querySelectorAll(`input[name="${groupName}"]`)
        .forEach((r) => {
          r.classList.remove("is-invalid");
        });
    }
  });

  if (isValid) {
    nextStep(step);
  }

  return isValid;
}

// Navigate to next step
function nextStep(step) {
  // Hide current step
  document.getElementById(`step${step}`).classList.remove("active");

  // Show next step
  currentStep = step + 1;
  document.getElementById(`step${currentStep}`).classList.add("active");

  // Update step indicators and line fill
  updateStepIndicators(currentStep);
}

// Navigate to previous step
function prevStep(step) {
  // Hide current step
  document.getElementById(`step${step}`).classList.remove("active");

  // Show previous step
  currentStep = step - 1;
  document.getElementById(`step${currentStep}`).classList.add("active");

  // Update step indicators and line fill
  updateStepIndicators(currentStep);
}

// Submit the application
function submitApplication() {
  // Check certification
  const certificationCheckbox = document.getElementById("certification");
  if (!certificationCheckbox.checked) {
    certificationCheckbox.classList.add("is-invalid");
    return;
  }

  // Hide the form and show success message
  document.getElementById("step4").style.display = "none";
  document.getElementById("success-message").style.display = "block";

  // Set the email in success message
  const userEmail = document.getElementById("email").value;
  document.getElementById("success-email").textContent = userEmail;

  // Generate and send PDF
  generateAndSendPDF(userEmail);
}

// Replace your current generateAndSendPDF function with this:
function generateAndSendPDF(email) {
  // Show loading state
  const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML =
    '<i class="bi bi-arrow-repeat spinner"></i> Generating PDF...';
  downloadBtn.disabled = true;

  // Collect all form data
  const formData = collectFormData();

  // Add position information
  formData.position = document
    .getElementById("position-title")
    .textContent.replace("Application for: ", "");

  // Send to backend - THIS IS WHERE THE FETCH GOES
  fetch("http://localhost:5000/api/submit-application", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Restore button state
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;

        // Show success message
        const successMessage = document.getElementById("success-message");
        const confirmationText = document.createElement("p");
        confirmationText.className = "text-success mt-3";
        confirmationText.innerHTML =
          "<i class='bi bi-check-circle me-2'></i>PDF has been generated and emailed to you";
        successMessage.querySelector(".text-muted").before(confirmationText);
      } else {
        throw new Error(data.error || "Submission failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
      alert(
        "There was an error submitting your application. Please try again."
      );
    });
}

// Function to collect all form data
function collectFormData() {
  const data = {
    // Personal Information
    legalName: document.getElementById("legalName").value,
    preferredName: document.getElementById("preferredName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    phoneType: document.getElementById("phoneType").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    zipcode: document.getElementById("zipcode").value,

    // Work Eligibility
    workAuthorization: document.querySelector(
      'input[name="workAuthorization"]:checked'
    )?.value,
    visaSponsorship: document.querySelector(
      'input[name="visaSponsorship"]:checked'
    )?.value,
    over18: document.querySelector('input[name="over18"]:checked')?.value,
    driversLicense: document.querySelector(
      'input[name="driversLicense"]:checked'
    )?.value,
    startDate: document.getElementById("startDate").value,

    // Work Preferences
    relocate: document.querySelector('input[name="relocate"]:checked')?.value,
    travel: document.querySelector('input[name="travel"]:checked')?.value,
    overtime: document.querySelector('input[name="overtime"]:checked')?.value,
    travelPercentage: document.getElementById("travelPercentage").value,

    // Skills
    technicalSkills: document.getElementById("technicalSkills").value,
    softSkills: document.getElementById("softSkills").value,
    languages: document.getElementById("languages").value,

    // EEO Information
    gender: document.querySelector('input[name="gender"]:checked')?.value,
    ethnicity: document.querySelector('input[name="ethnicity"]:checked')?.value,
    veteranStatus: document.querySelector('input[name="veteranStatus"]:checked')
      ?.value,
    disabilityStatus: document.querySelector(
      'input[name="disabilityStatus"]:checked'
    )?.value,

    // Education, Experience, Certifications
    education: [],
    experience: [],
    certifications: [],
  };

  // Collect education entries
  document.querySelectorAll(".education-entry").forEach((entry) => {
    data.education.push({
      schoolName: entry.querySelector('input[name="schoolName"]').value,
      educationLevel: entry.querySelector('select[name="educationLevel"]')
        .value,
      major: entry.querySelector('input[name="major"]').value,
      graduationYear: entry.querySelector('input[name="graduationYear"]').value,
    });
  });

  // Collect experience entries
  document.querySelectorAll(".experience-entry").forEach((entry) => {
    data.experience.push({
      employer: entry.querySelector('input[name="employer"]').value,
      jobTitle: entry.querySelector('input[name="jobTitle"]').value,
      startDate: entry.querySelector('input[name="startDate"]').value,
      endDate: entry.querySelector('input[name="endDate"]').value,
      currentJob: entry.querySelector(
        'input[type="checkbox"][name$="currentJob"]'
      ).checked,
      description: entry.querySelector('textarea[name="description"]').value,
      supervisorName: entry.querySelector('input[name="supervisorName"]').value,
      supervisorTitle: entry.querySelector('input[name="supervisorTitle"]')
        .value,
      reasonForLeaving: entry.querySelector('input[name="reasonForLeaving"]')
        .value,
      employerPhone: entry.querySelector('input[name="employerPhone"]').value,
      contactEmployer: entry.querySelector(
        'input[name$="contactEmployer"]:checked'
      )?.value,
    });
  });

  // Collect certification entries
  document.querySelectorAll(".certification-entry").forEach((entry) => {
    data.certifications.push({
      certificationName: entry.querySelector('input[name="certificationName"]')
        .value,
      issuingOrg: entry.querySelector('input[name="issuingOrg"]').value,
      dateObtained: entry.querySelector('input[name="dateObtained"]').value,
      expirationDate: entry.querySelector('input[name="expirationDate"]').value,
    });
  });

  return data;
}

// Function to create PDF
function createPDF(formData) {
  return new Promise((resolve) => {
    // In a real implementation, you would use a PDF library like jsPDF or pdfmake
    // This is a simplified version that creates a text representation

    let pdfContent = `RenArc Group Job Application\n`;
    pdfContent += `================================\n\n`;
    pdfContent += `Personal Information:\n`;
    pdfContent += `Legal Name: ${formData.legalName}\n`;
    pdfContent += `Email: ${formData.email}\n`;
    pdfContent += `Phone: ${formData.phone} (${formData.phoneType})\n`;
    pdfContent += `Address: ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipcode}\n\n`;

    // Add all other form data to pdfContent...

    // For demonstration, we'll create a Blob that represents the PDF
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    resolve(blob);
  });
}

// Function to download PDF
function downloadPDF() {
  // Collect form data
  const formData = collectFormData();

  // Show loading state
  const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML =
    '<i class="bi bi-arrow-repeat spinner"></i> Preparing Download...';
  downloadBtn.disabled = true;

  // Create and download PDF
  createPDF(formData)
    .then((pdfBlob) => {
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const applicantName = formData.legalName || "application";
      const fileName = `RenArc_Application_${applicantName.replace(
        /\s+/g,
        "_"
      )}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      // Restore button state
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
      alert("Error generating PDF. Please try again.");
    });
}

// These would be implemented on your server
function sendEmailWithAttachment(email, pdfData, formData) {
  return new Promise((resolve) => {
    console.log("Simulating email send to:", email);
    // In a real implementation, you would send this to your server
    // which would then use a service like SendGrid, Mailgun, or SMTP
    setTimeout(resolve, 1000);
  });
}

function saveToAdminFolder(formData) {
  return new Promise((resolve) => {
    console.log("Simulating save to admin folder");
    // In a real implementation, you would send this to your server
    // which would save it to a database or file system
    setTimeout(resolve, 500);
  });
}

// Function to generate and send PDF
function generateAndSendPDF() {
  // Show loading state
  const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML =
    '<i class="bi bi-arrow-repeat spinner"></i> Generating PDF...';
  downloadBtn.disabled = true;

  // In a real application, you would:
  // 1. Collect all form data
  // 2. Generate a PDF on the server or using a client-side library
  // 3. Send the PDF to the user's email
  // 4. Save the PDF to a specific folder on the server for admin review

  // Simulate PDF generation and email sending
  setTimeout(() => {
    // Restore button state
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;

    // Show success message
    const successMessage = document.getElementById("success-message");
    const confirmationText = document.createElement("p");
    confirmationText.className = "text-success mt-3";
    confirmationText.innerHTML =
      "<i class='bi bi-check-circle me-2'></i>PDF has been generated and emailed to you";
    successMessage.querySelector(".text-muted").before(confirmationText);

    // In a real implementation, you would:
    // - Send the data to your server
    // - Generate the PDF
    // - Email it to the user
    // - Store it in your admin folder
    console.log(
      "PDF would be generated and sent to:",
      document.getElementById("email").value
    );
    console.log("PDF would be saved to admin folder for review");
  }, 2000);
}

// Function to download PDF
function downloadPDF() {
  // Show loading state
  const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML =
    '<i class="bi bi-arrow-repeat spinner"></i> Preparing Download...';
  downloadBtn.disabled = true;

  // In a real application, this would generate and download a PDF
  // For now, we'll simulate the process
  setTimeout(() => {
    // Create a mock PDF download
    const applicantName =
      document.getElementById("legalName").value || "application";
    const fileName = `RenArc_Application_${applicantName.replace(
      /\s+/g,
      "_"
    )}.pdf`;

    // Restore button state
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;

    // Create a mock download link
    const link = document.createElement("a");
    link.href = "#"; // In real implementation, this would be the PDF URL
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show download success message
    alert(
      `Download started: ${fileName}\n\nIn a real implementation, this would download the actual PDF file.`
    );
  }, 1500);
}

// Function to populate the review section
function populateReviewSection() {
  // ... (keep the existing populateReviewSection function as is) ...
}

// Update the nextStep function to populate review when reaching step 4
function nextStep(step) {
  // Hide current step
  document.getElementById(`step${step}`).classList.remove("active");

  // Show next step
  currentStep = step + 1;
  document.getElementById(`step${currentStep}`).classList.add("active");

  // If we're on the review step, populate the review fields
  if (currentStep === 4) {
    populateReviewSection();
  }

  // Update step indicators and line fill
  updateStepIndicators(currentStep);
}

// Function to add education entry
function addEducationEntry() {
  const container = document.getElementById("educationContainer");
  const newEntry = container.querySelector(".education-entry").cloneNode(true);

  // Clear input values
  newEntry.querySelectorAll("input, select").forEach((input) => {
    input.value = "";
    input.setCustomValidity("");
  });

  // Make radio names unique for this entry
  makeRadioNamesUnique(newEntry, "education", educationCounter);

  container.appendChild(newEntry);

  // Increment counter for next entry
  educationCounter++;
}

// Function to remove education entry
function removeEducationEntry(button) {
  const container = document.getElementById("educationContainer");
  if (container.children.length > 1) {
    const entry = button.closest(".education-entry");
    entry.remove();
  }
}

// Function to add experience entry
function addExperienceEntry() {
  const container = document.getElementById("experienceContainer");
  const newEntry = container.querySelector(".experience-entry").cloneNode(true);

  // Clear input values
  newEntry.querySelectorAll("input, select, textarea").forEach((input) => {
    if (input.type !== "radio" && input.type !== "checkbox") {
      input.value = "";
      input.setCustomValidity("");
    } else {
      input.checked = false;
    }
  });

  // Make radio names unique for this entry
  makeRadioNamesUnique(newEntry, "experience", experienceCounter);

  // Set default for contact employer radio
  const contactEmployerRadios = newEntry.querySelectorAll(
    'input[name$="contactEmployer"]'
  );
  if (contactEmployerRadios.length > 0) {
    contactEmployerRadios[1].checked = true; // Select "No" option
  }

  container.appendChild(newEntry);

  // Add event listeners to new date fields
  addDateValidationListeners(newEntry);

  // Increment counter for next entry
  experienceCounter++;
}

// Function to remove experience entry
function removeExperienceEntry(button) {
  const container = document.getElementById("experienceContainer");
  if (container.children.length > 1) {
    const entry = button.closest(".experience-entry");
    entry.remove();
  }
}

// Function to add certification entry
function addCertificationEntry() {
  const container = document.getElementById("certificationContainer");
  const newEntry = container
    .querySelector(".certification-entry")
    .cloneNode(true);

  // Clear input values
  newEntry.querySelectorAll("input").forEach((input) => {
    input.value = "";
    input.setCustomValidity("");
  });

  // Make radio names unique for this entry
  makeRadioNamesUnique(newEntry, "certification", certificationCounter);

  container.appendChild(newEntry);

  // Increment counter for next entry
  certificationCounter++;
}

// Function to remove certification entry
function removeCertificationEntry(button) {
  const container = document.getElementById("certificationContainer");
  if (container.children.length > 1) {
    const entry = button.closest(".certification-entry");
    entry.remove();
  }
}

// Function to add date validation listeners to an entry
function addDateValidationListeners(entry) {
  // Experience date validation
  const expStartInputs = entry.querySelectorAll('input[name="startDate"]');
  const expEndInputs = entry.querySelectorAll('input[name="endDate"]');
  const currentJobCheckboxes = entry.querySelectorAll(
    'input[type="checkbox"][name$="currentJob"]'
  );

  expStartInputs.forEach((input) => {
    input.addEventListener("change", function () {
      validateExperienceDates(entry);
    });
  });

  expEndInputs.forEach((input) => {
    input.addEventListener("change", function () {
      validateExperienceDates(entry);
    });
  });

  currentJobCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const endDate = this.closest(".experience-entry").querySelector(
        'input[name="endDate"]'
      );
      if (this.checked) {
        endDate.disabled = true;
        endDate.removeAttribute("required");
        endDate.setCustomValidity("");
      } else {
        endDate.disabled = false;
        endDate.setAttribute("required", "required");
      }
      validateExperienceDates(entry);
    });
  });
}

// Handle current job checkbox for initial entries
document.addEventListener("click", function (e) {
  if (e.target.name && e.target.name.endsWith("currentJob")) {
    const endDate = e.target
      .closest(".experience-entry")
      .querySelector('input[name="endDate"]');
    if (e.target.checked) {
      endDate.disabled = true;
      endDate.removeAttribute("required");
      endDate.setCustomValidity("");
    } else {
      endDate.disabled = false;
      endDate.setAttribute("required", "required");
    }
    validateExperienceDates(e.target.closest(".experience-entry"));
  }
});

// Initialize progress bar
updateProgressBar();

// Function to populate the review section
function populateReviewSection() {
  // Personal Information
  document.getElementById("review-legal-name").textContent =
    document.getElementById("legalName").value || "Not provided";
  document.getElementById("review-preferred-name").textContent =
    document.getElementById("preferredName").value || "Not provided";
  document.getElementById("review-email").textContent =
    document.getElementById("email").value || "Not provided";
  document.getElementById("review-phone").textContent =
    document.getElementById("phone").value || "Not provided";
  document.getElementById("review-phone-type").textContent =
    document.getElementById("phoneType").value || "Not specified";
  document.getElementById("review-address").textContent =
    document.getElementById("address").value || "Not provided";
  document.getElementById("review-location").textContent = `${
    document.getElementById("city").value || ""
  }, ${document.getElementById("state").value || ""} ${
    document.getElementById("zipcode").value || ""
  }`.trim();

  // Contact method
  const contactMethods = [];
  if (document.getElementById("contactPhone").checked)
    contactMethods.push("Phone");
  if (document.getElementById("contactEmail").checked)
    contactMethods.push("Email");
  document.getElementById("review-contact-method").textContent =
    contactMethods.join(", ") || "Not specified";

  // Work eligibility
  document.getElementById("review-work-auth").textContent =
    document.querySelector('input[name="workAuthorization"]:checked')?.value ===
    "yes"
      ? "Yes"
      : "No";
  document.getElementById("review-visa").textContent =
    document.querySelector('input[name="visaSponsorship"]:checked')?.value ===
    "yes"
      ? "Yes"
      : "No";
  document.getElementById("review-age").textContent =
    document.querySelector('input[name="over18"]:checked')?.value === "yes"
      ? "Yes"
      : "No";

  // Driver's license
  const licenseValue = document.querySelector(
    'input[name="driversLicense"]:checked'
  )?.value;
  document.getElementById("review-license").textContent =
    licenseValue === "yes"
      ? "Yes"
      : licenseValue === "no"
      ? "No"
      : licenseValue === "not-required"
      ? "Not Required"
      : "Not specified";

  // Work preferences
  document.getElementById("review-start-date").textContent =
    document.getElementById("startDate").value || "Not specified";
  document.getElementById("review-relocate").textContent =
    document.querySelector('input[name="relocate"]:checked')?.value === "yes"
      ? "Yes"
      : "No";
  document.getElementById("review-travel").textContent =
    document.querySelector('input[name="travel"]:checked')?.value === "yes"
      ? "Yes"
      : "No";
  document.getElementById("review-overtime").textContent =
    document.querySelector('input[name="overtime"]:checked')?.value === "yes"
      ? "Yes"
      : "No";

  // Education
  const educationContainer = document.getElementById("review-education");
  educationContainer.innerHTML = "";
  const educationEntries = document.querySelectorAll(".education-entry");

  if (educationEntries.length === 0) {
    educationContainer.innerHTML = "<p>No education information provided</p>";
  } else {
    educationEntries.forEach((entry, index) => {
      const school = entry.querySelector('input[name="schoolName"]').value;
      const degree = entry.querySelector('select[name="educationLevel"]').value;
      const major = entry.querySelector('input[name="major"]').value;
      const gradYear = entry.querySelector(
        'input[name="graduationYear"]'
      ).value;

      if (school || degree || major || gradYear) {
        const educationHTML = `
          <div class="mb-3 ${index > 0 ? "pt-3 border-top" : ""}">
            <p><strong>School:</strong> ${school || "Not provided"}</p>
            <p><strong>Degree:</strong> ${degree || "Not provided"}</p>
            <p><strong>Major:</strong> ${major || "Not provided"}</p>
            <p><strong>Graduation Year:</strong> ${
              gradYear || "Not provided"
            }</p>
          </div>
        `;
        educationContainer.innerHTML += educationHTML;
      }
    });
  }

  // Work Experience
  const experienceContainer = document.getElementById("review-experience");
  experienceContainer.innerHTML = "";
  const experienceEntries = document.querySelectorAll(".experience-entry");

  if (experienceEntries.length === 0) {
    experienceContainer.innerHTML = "<p>No work experience provided</p>";
  } else {
    experienceEntries.forEach((entry, index) => {
      const employer = entry.querySelector('input[name="employer"]').value;
      const jobTitle = entry.querySelector('input[name="jobTitle"]').value;
      const startDate = entry.querySelector('input[name="startDate"]').value;
      const endDate = entry.querySelector('input[name="endDate"]').value;
      const currentJob = entry.querySelector(
        'input[type="checkbox"][name$="currentJob"]'
      ).checked;
      const description = entry.querySelector(
        'textarea[name="description"]'
      ).value;

      if (employer || jobTitle) {
        const experienceHTML = `
          <div class="mb-3 ${index > 0 ? "pt-3 border-top" : ""}">
            <p><strong>Employer:</strong> ${employer || "Not provided"}</p>
            <p><strong>Job Title:</strong> ${jobTitle || "Not provided"}</p>
            <p><strong>Dates:</strong> ${startDate || "Not provided"} to ${
          currentJob ? "Present" : endDate || "Not provided"
        }</p>
            ${
              description
                ? `<p><strong>Description:</strong> ${description}</p>`
                : ""
            }
          </div>
        `;
        experienceContainer.innerHTML += experienceHTML;
      }
    });
  }

  // Certifications
  const certificationContainer = document.getElementById(
    "review-certifications"
  );
  certificationContainer.innerHTML = "";
  const certificationEntries = document.querySelectorAll(
    ".certification-entry"
  );

  if (certificationEntries.length === 0) {
    certificationContainer.innerHTML = "<p>No certifications provided</p>";
  } else {
    certificationEntries.forEach((entry, index) => {
      const certName = entry.querySelector(
        'input[name="certificationName"]'
      ).value;
      const issuingOrg = entry.querySelector('input[name="issuingOrg"]').value;
      const dateObtained = entry.querySelector(
        'input[name="dateObtained"]'
      ).value;

      if (certName || issuingOrg) {
        const certHTML = `
          <div class="mb-3 ${index > 0 ? "pt-3 border-top" : ""}">
            <p><strong>Certification:</strong> ${certName || "Not provided"}</p>
            <p><strong>Issuing Organization:</strong> ${
              issuingOrg || "Not provided"
            }</p>
            <p><strong>Date Obtained:</strong> ${
              dateObtained || "Not provided"
            }</p>
          </div>
        `;
        certificationContainer.innerHTML += certHTML;
      }
    });
  }

  // Skills
  document.getElementById("review-tech-skills").textContent =
    document.getElementById("technicalSkills").value || "Not provided";
  document.getElementById("review-soft-skills").textContent =
    document.getElementById("softSkills").value || "Not provided";
  document.getElementById("review-languages").textContent =
    document.getElementById("languages").value || "Not provided";

  // EEO Information
  document.getElementById("review-gender").textContent =
    document.querySelector('input[name="gender"]:checked')?.value ||
    "Not specified";
  document.getElementById("review-ethnicity").textContent =
    document.querySelector('input[name="ethnicity"]:checked')?.value ||
    "Not specified";
  document.getElementById("review-veteran").textContent =
    document.querySelector('input[name="veteranStatus"]:checked')?.value ||
    "Not specified";
  document.getElementById("review-disability").textContent =
    document.querySelector('input[name="disabilityStatus"]:checked')?.value ||
    "Not specified";
}

// Update the nextStep function to populate review when reaching step 4
function nextStep(step) {
  // Hide current step
  document.getElementById(`step${step}`).classList.remove("active");

  // Show next step
  currentStep = step + 1;
  document.getElementById(`step${currentStep}`).classList.add("active");

  // If we're on the review step, populate the review fields
  if (currentStep === 4) {
    populateReviewSection();
  }

  // Update step indicators and line fill
  updateStepIndicators(currentStep);
}
