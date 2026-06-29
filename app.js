const storageKey = "methodz-crm-contacts-v1";

const partnerServiceMap = {
  "Web Design": "Recommend SEO Strategy with SearchLift Partners",
  "SEO Strategy": "Recommend Paid Ads with GrowthLoop Media",
  "Paid Ads": "Recommend CRM Setup with PipelineOps Studio",
  "Brand Identity": "Recommend Web Design with BrightSites Collective",
  "CRM Setup": "Recommend Brand Identity with Northstar Creative"
};

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

const seedContacts = [
  {
    id: createId(),
    name: "Ava Thompson",
    company: "Northwind Retreats",
    email: "ava@northwindretreats.com",
    phone: "555-0100",
    status: "New Lead",
    primaryService: "Web Design",
    partnerService: partnerServiceMap["Web Design"],
    nextAction: "Send discovery questionnaire",
    notes: "Needs a refreshed booking experience before the summer season.",
    lastUpdated: createTimestamp()
  },
  {
    id: createId(),
    name: "Jordan Patel",
    company: "Luma Fitness",
    email: "jordan@lumafitness.co",
    phone: "555-0101",
    status: "Potential Client",
    primaryService: "SEO Strategy",
    partnerService: partnerServiceMap["SEO Strategy"],
    nextAction: "Book SEO roadmap review",
    notes: "Interested in improving organic traffic and lead quality.",
    lastUpdated: createTimestamp()
  }
];

const form = document.getElementById("contactForm");
const contactIdInput = document.getElementById("contactId");
const nameInput = document.getElementById("name");
const companyInput = document.getElementById("company");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const statusInput = document.getElementById("status");
const primaryServiceInput = document.getElementById("primaryService");
const partnerServiceInput = document.getElementById("partnerService");
const nextActionInput = document.getElementById("nextAction");
const notesInput = document.getElementById("notes");
const resetButton = document.getElementById("resetButton");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const contactsTable = document.getElementById("contactsTable");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");

function loadContacts() {
  const savedContacts = localStorage.getItem(storageKey);

  if (!savedContacts) {
    localStorage.setItem(storageKey, JSON.stringify(seedContacts));
    return seedContacts;
  }

  try {
    return JSON.parse(savedContacts).map((contact) => ({
      ...contact,
      lastUpdated: contact.lastUpdated || createTimestamp()
    }));
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(seedContacts));
    return seedContacts;
  }
}

let contacts = loadContacts();

function saveContacts() {
  localStorage.setItem(storageKey, JSON.stringify(contacts));
}

function updatePartnerRecommendation() {
  partnerServiceInput.value =
    partnerServiceMap[primaryServiceInput.value] || "Review custom partner fit";
}

function resetForm() {
  form.reset();
  contactIdInput.value = "";
  statusInput.value = "New Lead";
  primaryServiceInput.value = "Web Design";
  updatePartnerRecommendation();
}

function getFilteredContacts() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return contacts.filter((contact) => {
    const matchesStatus = selectedStatus === "All" || contact.status === selectedStatus;
    const haystack = [
      contact.name,
      contact.company,
      contact.email,
      contact.primaryService,
      contact.partnerService
    ]
      .join(" ")
      .toLowerCase();

    return matchesStatus && (!query || haystack.includes(query));
  });
}

function updateSummary() {
  const totals = contacts.reduce(
    (summary, contact) => {
      summary.total += 1;

      if (contact.status === "New Lead") {
        summary.leads += 1;
      } else if (contact.status === "Potential Client") {
        summary.potentials += 1;
      } else if (contact.status === "Active Client") {
        summary.clients += 1;
      }

      return summary;
    },
    { total: 0, leads: 0, potentials: 0, clients: 0 }
  );

  document.getElementById("totalContacts").textContent = String(totals.total);
  document.getElementById("leadContacts").textContent = String(totals.leads);
  document.getElementById("potentialContacts").textContent = String(totals.potentials);
  document.getElementById("clientContacts").textContent = String(totals.clients);

  const mostRecentUpdate = contacts
    .map((contact) => contact.lastUpdated)
    .sort((left, right) => new Date(right) - new Date(left))[0];

  document.getElementById("lastUpdated").textContent = mostRecentUpdate
    ? `Last update: ${formatTimestamp(mostRecentUpdate)}`
    : "Ready for your next follow-up";
}

function createRow(contact) {
  const row = document.createElement("tr");
  const contactCell = document.createElement("td");
  const name = document.createElement("div");
  name.className = "contact-name";
  name.textContent = contact.name;
  const company = document.createElement("div");
  company.className = "contact-subtext";
  company.textContent = contact.company || "Independent contact";
  const contactDetails = document.createElement("div");
  contactDetails.className = "contact-subtext";
  contactDetails.textContent = `${contact.email}${contact.phone ? ` • ${contact.phone}` : ""}`;
  contactCell.append(name, company, contactDetails);

  const statusCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = contact.status;
  statusCell.appendChild(badge);

  const serviceCell = document.createElement("td");
  const service = document.createElement("div");
  service.textContent = contact.primaryService;
  const notes = document.createElement("div");
  notes.className = "contact-subtext";
  notes.textContent = contact.notes || "No notes yet.";
  serviceCell.append(service, notes);

  const partnerCell = document.createElement("td");
  partnerCell.textContent = contact.partnerService;

  const nextStepCell = document.createElement("td");
  nextStepCell.textContent = contact.nextAction || "No follow-up scheduled";

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "row-actions";
  const editButton = document.createElement("button");
  editButton.className = "text-button";
  editButton.dataset.action = "edit";
  editButton.dataset.id = contact.id;
  editButton.textContent = "Edit";
  const deleteButton = document.createElement("button");
  deleteButton.className = "text-button delete";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = contact.id;
  deleteButton.textContent = "Delete";
  actions.append(editButton, deleteButton);
  actionsCell.appendChild(actions);

  row.append(contactCell, statusCell, serviceCell, partnerCell, nextStepCell, actionsCell);

  return row;
}

function renderContacts() {
  const filteredContacts = getFilteredContacts();
  contactsTable.innerHTML = "";

  if (!filteredContacts.length) {
    contactsTable.appendChild(emptyStateTemplate.content.cloneNode(true));
    updateSummary();
    return;
  }

  filteredContacts
    .slice()
    .sort((left, right) => new Date(right.lastUpdated) - new Date(left.lastUpdated))
    .forEach((contact) => {
      contactsTable.appendChild(createRow(contact));
    });

  updateSummary();
}

function fillForm(contact) {
  contactIdInput.value = contact.id;
  nameInput.value = contact.name;
  companyInput.value = contact.company;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
  statusInput.value = contact.status;
  primaryServiceInput.value = contact.primaryService;
  partnerServiceInput.value = contact.partnerService;
  nextActionInput.value = contact.nextAction;
  notesInput.value = contact.notes;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const contact = {
    id: contactIdInput.value || createId(),
    name: nameInput.value.trim(),
    company: companyInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    status: statusInput.value,
    primaryService: primaryServiceInput.value,
    partnerService: partnerServiceInput.value,
    nextAction: nextActionInput.value.trim(),
    notes: notesInput.value.trim(),
    lastUpdated: createTimestamp()
  };

  const existingContactIndex = contacts.findIndex((item) => item.id === contact.id);

  if (existingContactIndex >= 0) {
    contacts.splice(existingContactIndex, 1, contact);
  } else {
    contacts.unshift(contact);
  }

  saveContacts();
  resetForm();
  renderContacts();
});

resetButton.addEventListener("click", resetForm);
primaryServiceInput.addEventListener("change", updatePartnerRecommendation);
searchInput.addEventListener("input", renderContacts);
statusFilter.addEventListener("change", renderContacts);

contactsTable.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");

  if (!button) {
    return;
  }

  const selectedContact = contacts.find((contact) => contact.id === button.dataset.id);

  if (!selectedContact) {
    return;
  }

  if (button.dataset.action === "edit") {
    fillForm(selectedContact);
    return;
  }

  if (button.dataset.action === "delete" && window.confirm(`Delete ${selectedContact.name}?`)) {
    contacts = contacts.filter((contact) => contact.id !== selectedContact.id);
    saveContacts();
    renderContacts();
  }
});

updatePartnerRecommendation();
renderContacts();
