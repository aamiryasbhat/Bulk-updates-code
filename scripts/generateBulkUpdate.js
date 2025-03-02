const fs = require('fs');

function generateBulkUpdatePayload(contacts) {
  const updates = contacts.map(contact => ({
    contactId: contact.id,
    updates: {
      name: `Updated_${contact.name.split(' ')[0]}`,
      email: `updated.${contact.email.split('@')[0]}@newdomain.com`,
      age: Math.min(99, contact.age + 1)
    }
  }));

  return {
    accountId: "550e8400-e29b-41d4-a716-446655440000",
    entityType: "CONTACT",
    updates
  };
}

// Read the contacts from your JSON file
const contacts = require('./query_1-2025-03-01_12516.json');
const bulkUpdatePayload = generateBulkUpdatePayload(contacts);

// Write to a new file
fs.writeFileSync(
  'bulk-update-payload.json',
  JSON.stringify(bulkUpdatePayload, null, 2)
);

console.log(`Generated bulk update payload for ${contacts.length} contacts`); 