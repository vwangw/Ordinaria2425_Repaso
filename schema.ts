export const schema = `#graphql
    type Restaurant{
        id:ID!
        name:String!
        address:String!
        phone:String!
        localtime:String!
        temperature:Int!
    },

    type Query{
        getRestaurant(id:ID!):Restaurant
        getRestaurants(city:String!):[Restaurant!]!
    },

    type Mutation{
        addRestaurant(name:String!,address:String!,phone:String!,city:String!):Restaurant
        deleteRestaurant(id:ID!):Boolean!
    }
`