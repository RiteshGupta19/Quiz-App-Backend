const Level = require('../Model/levelSchema');

const seedLevels = async () => {
  const existingCount = await Level.countDocuments();
  if (existingCount >= 50) {
    console.log('Levels already seeded');
    return;
  }

  const levels = [];
  for (let i = 1; i <= 50; i++) {
    levels.push({
      title: `Level ${i}`,
      order: i,
    });
  }

  try {
    await Level.insertMany(levels);
    console.log('50 Levels inserted successfully');
  } catch (err) {
    console.error('❌ Error inserting levels:', err.message);
  }
};

module.exports = seedLevels;