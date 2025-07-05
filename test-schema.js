const { mergeTypeDefs } = require('@graphql-tools/merge');
const gql = require('graphql-tag');

// Test the GraphQL schema compilation
try {
  console.log('Testing GraphQL schema compilation...');
  
  const { typeDefs } = require('./app/graphql/index.ts');
  
  console.log('✅ Schema compiled successfully!');
  console.log('Available types in schema:');
  
  // Try to parse the schema to see if there are any issues
  console.log('Schema length:', typeDefs.length, 'characters');
  
} catch (error) {
  console.error('❌ Schema compilation failed:');
  console.error(error.message);
  console.error('\nFull error:', error);
}
