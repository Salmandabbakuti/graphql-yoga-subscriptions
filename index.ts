import { createServer } from "node:http";
import { createSchema, createYoga, createPubSub } from "graphql-yoga";

const pubsub = createPubSub();

const yoga = createYoga({
  graphqlEndpoint: "/",
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      scalar Json
      type Query {
        hello: String
      }
      type Mutation {
        hello(topicId: ID!): String
      }
      type Subscription {
        # Simple subscription
        hello: String
        # Subscription with custom topic
        notification(topicId: ID!): Json
        # Subscription with user auth topic
        protectedNotification: Json
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello GraphQL!"
      },
      Mutation: {
        hello: (parent, { topicId }) => {
          pubsub.publish("hello", "Hello GraphQL Subscription!");
          // Topic e.g. `notification ${topicId}` or ("notification", topicId)
          // Note: subscribe topic should also be defined same way as defined in publish.
          // pubsub.publish(`notification ${topicId}`, "Hello Custom GraphQL Subscription!"); // <-last arg is payload(string or json object)
          // or below way.
          pubsub.publish("notification", topicId, {
            id: "1",
            message: "Hello Custom GraphQL Subscription!",
            createdAt: new Date().toISOString()
          });
          // get intended user from db/operation and publish to that user
          // Topic e.g. `protectedNotification ${user.id}` or ("protectedNotification", user.id)
          const user = { id: "cm5q" };
          pubsub.publish(`protectedNotification ${user.id}`, {
            id: "1",
            message: "Protected notification intended for specific user!",
            createdAt: new Date().toISOString() // <-last arg is payload(string or json object)
          });
          return "Hello GraphQL!";
        }
      },
      Subscription: {
        hello: {
          subscribe: () => pubsub.subscribe("hello"),
          resolve: (payload) => payload
        },
        notification: {
          subscribe: (parent, args) => {
            // return pubsub.subscribe(`notification ${args.topicId}`);
            // or this way
            return pubsub.subscribe("notification", args.topicId);
          },
          resolve: (payload) => payload
        },
        protectedNotification: {
          subscribe: (parent, args, { request }) => {
            // Check user auth here
            // const user = getUser(request);
            const user = { id: "cm5q" };
            return pubsub.subscribe(`protectedNotification ${user.id}`);
          },
          resolve: (payload) => payload
        }
      }
    }
  })
});

const server = createServer(yoga);
server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
