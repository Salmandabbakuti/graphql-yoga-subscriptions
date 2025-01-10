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
        hello: String
      }
      type Subscription {
        # Simple subscription
        hello: String
        # Subscription with arguments
        notification(userId: ID!): Json
        # Subscription with user auth
        protectedNotification: Json
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello GraphQL!"
      },
      Mutation: {
        hello: () => {
          pubsub.publish("hello", "Hello GraphQL Subscription!");
          // Topic e.g. `notification ${args.userId}` or ("notification", args.userId)
          // Note: subscribe topic should also be defined same way as defined in publish.
          // pubsub.publish("notification abc", "Hello Custom GraphQL Subscription!"); // <-last arg is payload(string or json object)
          // or below way.
          pubsub.publish("notification", "abc", {
            id: "1",
            message: "Hello Custom GraphQL Subscription!",
            createdAt: new Date().toISOString()
          });
          // Topic e.g. `protectedNotification ${user.id}` or ("protectedNotification", user.id)
          // get user from request or context
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
            // return pubsub.subscribe(`notification ${args.userId}`);
            // or this way
            return pubsub.subscribe("notification", args.userId);
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
