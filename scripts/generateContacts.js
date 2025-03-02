const { sequelize, Contact } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

const BATCH_SIZE = 1000;
const TOTAL_CONTACTS = 100000; // 100K contacts
const ACCOUNT_IDS = [
  "550e8400-e29b-41d4-a716-446655440000",
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002"
];

async function generateContacts() {
  try {
    console.log('Starting contact generation...');
    const startTime = Date.now();

    for (let i = 0; i < TOTAL_CONTACTS; i += BATCH_SIZE) {
      const contacts = [];
      const batchSize = Math.min(BATCH_SIZE, TOTAL_CONTACTS - i);

      for (let j = 0; j < batchSize; j++) {
        contacts.push({
          id: uuidv4(),
          accountId: ACCOUNT_IDS[Math.floor(Math.random() * ACCOUNT_IDS.length)],
          name: faker.person.fullName(),
          email: faker.internet.email(),
          age: faker.number.int({ min: 18, max: 80 })
        });
      }

      await Contact.bulkCreate(contacts);
      
      const progress = ((i + batchSize) / TOTAL_CONTACTS) * 100;
      console.log(`Progress: ${progress.toFixed(2)}% (${i + batchSize}/${TOTAL_CONTACTS} contacts)`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Successfully generated ${TOTAL_CONTACTS} contacts in ${duration} seconds`);

    // Log a few sample contacts
    const sampleContacts = await Contact.findAll({ limit: 5 });
    console.log('\nSample contacts:', JSON.stringify(sampleContacts, null, 2));

  } catch (error) {
    console.error('❌ Error generating contacts:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
generateContacts(); 