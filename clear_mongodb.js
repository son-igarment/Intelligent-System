// MongoDB script to clear database collections
db = db.getSiblingDB("intelligent_system_db");

// List collections that need to be cleared
const collections = [
  "stock_data",
  "market_index_data",
  "beta_values",
  "svm_analyses",
  "calculations",
  "imports",
  "market_index_imports",
  "portfolio_betas",
  "items"
];

// Delete all documents from each collection
collections.forEach(collection => {
  if (db.getCollectionNames().includes(collection)) {
    print(`Deleting all documents from ${collection} collection...`);
    db[collection].deleteMany({});
    print(`Successfully cleared ${collection} collection.`);
  } else {
    print(`Collection ${collection} not found, skipping.`);
  }
});

print("Database cleanup completed!"); 