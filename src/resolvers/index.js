const Query = require('./query');
const Mutation = require('./mutation');
const { GraphQLDateTime } = require('graphql-iso-date'); // проверка созданного типа данных DateTime

module.exports = {
  Query,
  Mutation,
  DateTime: GraphQLDateTime
};
