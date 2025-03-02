const fs = require('fs');
const path = require('path');

// Read the JSON data directly using absolute path
const jsonData = fs.readFileSync(path.join(__dirname, '../query_1-2025-03-01_12516.json'), 'utf8');
const contacts = JSON.parse(jsonData);

function generateBulkUpdatePayload(contacts) {
    const updates = contacts.map(contact => ({
        contactId: contact.id,
        updates: {
            name: `Bulk_Updated_${contact.name.split(' ')[0]}`,
            email: `bulk.${contact.email.split('@')[0]}.updated@bulktest.com`,
            age: Math.min(99, contact.age + 5) // increment age by 5, max 99
        }
    }));

    return {
        accountId: "550e8400-e29b-41d4-a716-446655440000",
        entityType: "CONTACT",
        updates,
        scheduledAt: new Date(Date.now() + 2 * 60 * 1000).toISOString() // 2 minutes from now
    };
}

try {
    const bulkUpdatePayload = generateBulkUpdatePayload(contacts);
    
    // Write to a new file using absolute path
    fs.writeFileSync(
        path.join(__dirname, '../bulk-update-payload.json'),
        JSON.stringify(bulkUpdatePayload, null, 2)
    );
    
    console.log(`Generated bulk update payload for ${contacts.length} contacts`);
    console.log(`Scheduled for: ${bulkUpdatePayload.scheduledAt}`);
    console.log('\nSample update:');
    console.log(JSON.stringify(bulkUpdatePayload.updates[0], null, 2));
    
} catch (error) {
    console.error('Error generating payload:', error.message);
    console.error('Stack:', error.stack);
} 