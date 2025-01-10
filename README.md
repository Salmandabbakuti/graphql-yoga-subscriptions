# graphql-yoga-Subscriptions

This project demonstrates different ways of using GraphQL Subscriptions in [graphql-yoga](https://the-guild.dev/graphql/yoga-server) server.

## Getting Started

```bash

# Install dependencies
npm install

# Start server
npm run dev

```

Open [http://localhost:4000](http://localhost:4000) in your browser and try the below queries:

### Sample Queries

> Call `helloMutation` to trigger subscriptions. Run `helloMutation` in one tab and any of the subscription queries in another tab to see the subscriptions in action.

```graphql
mutation helloMutation {
  hello
}

subscription hello {
  hello
}

subscription notification {
  notification(userId: "abc")
}

subscription protectedNotification {
  protectedNotification
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
